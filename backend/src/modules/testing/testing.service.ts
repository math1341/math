import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TestingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Start a new test attempt or resume an existing active attempt.
   */
  async startOrResumeAttempt(testId: string, studentId: string) {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      include: {
        assignedGroups: true,
        testQuestions: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!test || test.isArchived) {
      throw new NotFoundException('Тест не найден или находится в архиве');
    }

    const now = new Date();

    // Check window dates
    if (test.startsAt && now < test.startsAt) {
      throw new BadRequestException('Тестирование еще не началось');
    }
    if (test.endsAt && now > test.endsAt) {
      throw new BadRequestException('Срок проведения тестирования истек');
    }

    // Check group membership
    const assignedGroupIds = test.assignedGroups.map(g => g.groupId);
    if (assignedGroupIds.length > 0) {
      const isMember = await this.prisma.groupMember.findFirst({
        where: {
          studentId,
          groupId: { in: assignedGroupIds },
        },
      });
      if (!isMember) {
        throw new ForbiddenException('Вы не состоите в группе, которой назначен этот тест');
      }
    }

    // 1. Check if there is an ongoing (IN_PROGRESS) attempt
    const activeAttempt = await this.prisma.testAttempt.findFirst({
      where: {
        testId,
        studentId,
        status: 'IN_PROGRESS',
      },
      include: {
        answers: true,
      },
    });

    if (activeAttempt) {
      // Check if time has expired
      if (now > activeAttempt.expiresAt) {
        // Auto-complete expired attempt
        await this.finishAttempt(activeAttempt.id, studentId);
        throw new BadRequestException('Время попытки истекло');
      }

      // Resume attempt using the saved shuffled snapshot
      return this.formatActiveAttemptResponse(activeAttempt, test);
    }

    // 2. Check maximum attempts limit
    const previousAttemptsCount = await this.prisma.testAttempt.count({
      where: { testId, studentId },
    });

    if (!test.allowRetake && previousAttemptsCount >= 1) {
      throw new BadRequestException('Повторное прохождение данного теста запрещено');
    }

    if (test.maxAttempts && previousAttemptsCount >= test.maxAttempts) {
      throw new BadRequestException(`Превышен лимит попыток (${test.maxAttempts})`);
    }

    // 3. Create a NEW attempt with mandatory shuffling and freeze snapshot
    let questionsList = test.testQuestions.map(tq => tq.question);

    // Shuffle questions if enabled
    if (test.shuffleQuestions) {
      questionsList = [...questionsList].sort(() => 0.5 - Math.random());
    }

    // Build the frozen snapshot (stripping isCorrect to prevent client-side inspection!)
    const snapshotQuestions = questionsList.map((q, qIdx) => {
      let optionsList = [...q.options];
      // Shuffle options if enabled
      if (test.shuffleOptions) {
        optionsList = optionsList.sort(() => 0.5 - Math.random());
      }

      return {
        questionId: q.id,
        orderNumber: qIdx + 1,
        conditionText: q.conditionText,
        conditionFormula: q.conditionFormula,
        conditionImageUrl: q.conditionImageUrl,
        difficulty: q.difficulty,
        points: q.points,
        isSingleChoice: q.isSingleChoice,
        isMultipleChoice: q.isMultipleChoice,
        isNumericAnswer: q.isNumericAnswer,
        isTextAnswer: q.isTextAnswer,
        options: optionsList.map((opt, optIdx) => ({
          id: opt.id,
          orderLetter: String.fromCharCode(65 + optIdx), // A, B, C, D...
          text: opt.text,
          formula: opt.formula,
          imageUrl: opt.imageUrl,
          // CRITICAL: isCorrect is deliberately OMITTED here!
        })),
      };
    });

    const expiresAt = new Date(now.getTime() + test.durationMinutes * 60 * 1000);

    const newAttempt = await this.prisma.testAttempt.create({
      data: {
        testId,
        studentId,
        attemptNumber: previousAttemptsCount + 1,
        startedAt: now,
        expiresAt,
        status: 'IN_PROGRESS',
        totalQuestions: snapshotQuestions.length,
        shuffledSnapshot: JSON.stringify(snapshotQuestions),
      },
      include: {
        answers: true,
      },
    });

    return this.formatActiveAttemptResponse(newAttempt, test);
  }

  /**
   * Autosave or update an answer for a question in an active attempt.
   */
  async saveAnswer(attemptId: string, studentId: string, data: {
    questionId: string;
    selectedOptionIds?: string[];
    numericAnswer?: number;
    textAnswer?: string;
  }) {
    const attempt = await this.prisma.testAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt || attempt.studentId !== studentId) {
      throw new NotFoundException('Попытка тестирования не найдена');
    }

    if (attempt.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Попытка уже завершена');
    }

    const now = new Date();
    if (now > attempt.expiresAt) {
      await this.finishAttempt(attemptId, studentId);
      throw new BadRequestException('Время тестирования истекло');
    }

    // Save answer
    const saved = await this.prisma.studentAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId: data.questionId,
        },
      },
      update: {
        selectedOptionIds: data.selectedOptionIds ? JSON.stringify(data.selectedOptionIds) : null,
        numericAnswer: data.numericAnswer ?? null,
        textAnswer: data.textAnswer ?? null,
        answeredAt: now,
      },
      create: {
        attemptId,
        questionId: data.questionId,
        selectedOptionIds: data.selectedOptionIds ? JSON.stringify(data.selectedOptionIds) : null,
        numericAnswer: data.numericAnswer ?? null,
        textAnswer: data.textAnswer ?? null,
        answeredAt: now,
      },
    });

    return {
      success: true,
      message: 'Ответ сохранен',
      savedAnswer: {
        questionId: saved.questionId,
        selectedOptionIds: saved.selectedOptionIds ? JSON.parse(saved.selectedOptionIds) : [],
        numericAnswer: saved.numericAnswer,
        textAnswer: saved.textAnswer,
      },
    };
  }

  /**
   * Submit attempt and perform server-side scoring & verification.
   */
  async finishAttempt(attemptId: string, studentId: string) {
    const attempt = await this.prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        test: {
          include: {
            testQuestions: {
              include: {
                question: {
                  include: {
                    options: true,
                  },
                },
              },
            },
          },
        },
        answers: true,
      },
    });

    if (!attempt || attempt.studentId !== studentId) {
      throw new NotFoundException('Попытка не найдена');
    }

    if (attempt.status === 'COMPLETED') {
      return this.getAttemptResult(attemptId, studentId);
    }

    const now = new Date();
    const durationSeconds = Math.max(0, Math.round((now.getTime() - attempt.startedAt.getTime()) / 1000));

    // Calculate answers
    const answersMap = new Map<string, any>();
    attempt.answers.forEach(a => answersMap.set(a.questionId, a));

    let totalScore = 0;
    let maxPossibleScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;

    for (const tq of attempt.test.testQuestions) {
      const q = tq.question;
      const questionPoints = tq.points || q.points || 1.0;
      maxPossibleScore += questionPoints;

      const studentAns = answersMap.get(q.id);

      if (!studentAns || (!studentAns.selectedOptionIds && studentAns.numericAnswer === null && !studentAns.textAnswer)) {
        skippedCount++;
        continue;
      }

      let isCorrect = false;

      // 1. Single Choice & Multiple Choice verification by Option IDs
      if (q.isSingleChoice || q.isMultipleChoice) {
        const correctOptionIds = q.options.filter(o => o.isCorrect).map(o => o.id);
        const selectedIds: string[] = studentAns.selectedOptionIds
          ? JSON.parse(studentAns.selectedOptionIds)
          : [];

        if (q.isSingleChoice) {
          isCorrect = selectedIds.length === 1 && correctOptionIds.includes(selectedIds[0]);
        } else if (q.isMultipleChoice) {
          // All correct options selected, no wrong options selected
          isCorrect =
            correctOptionIds.length === selectedIds.length &&
            correctOptionIds.every(id => selectedIds.includes(id));
        }
      } else if (q.isNumericAnswer) {
        // Numeric answer comparison (with tolerance for rounding)
        if (q.correctNumeric !== null && studentAns.numericAnswer !== null) {
          isCorrect = Math.abs(q.correctNumeric - studentAns.numericAnswer) < 0.0001;
        }
      } else if (q.isTextAnswer) {
        // Text answer case-insensitive comparison
        if (q.correctText && studentAns.textAnswer) {
          isCorrect = q.correctText.trim().toLowerCase() === studentAns.textAnswer.trim().toLowerCase();
        }
      }

      const pointsAwarded = isCorrect ? questionPoints : 0;
      if (isCorrect) {
        correctCount++;
        totalScore += pointsAwarded;
      } else {
        incorrectCount++;
      }

      // Update answer record
      await this.prisma.studentAnswer.update({
        where: { id: studentAns.id },
        data: {
          isCorrect,
          pointsAwarded,
        },
      });
    }

    const percentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

    const completed = await this.prisma.testAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'COMPLETED',
        submittedAt: now,
        durationSeconds,
        correctAnswers: correctCount,
        incorrectAnswers: incorrectCount,
        skippedAnswers: skippedCount,
        score: Math.round(totalScore * 100) / 100,
        maxScore: Math.round(maxPossibleScore * 100) / 100,
        percentage: Math.round(percentage * 10) / 10,
      },
    });

    return this.getAttemptResult(attemptId, studentId);
  }

  /**
   * Get detailed results of an attempt.
   */
  async getAttemptResult(attemptId: string, studentId: string) {
    const attempt = await this.prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        test: {
          include: {
            teacher: { select: { fullName: true } },
            testQuestions: {
              include: {
                question: {
                  include: {
                    options: true,
                    topic: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
        answers: true,
      },
    });

    if (!attempt) throw new NotFoundException('Результат попытки не найден');

    // Parse snapshot to keep the order identical to what the student saw
    const snapshotQuestions: any[] = JSON.parse(attempt.shuffledSnapshot || '[]');

    const answersMap = new Map<string, any>();
    attempt.answers.forEach(a => answersMap.set(a.questionId, a));

    const questionsReview = attempt.test.showResultsImmediately
      ? snapshotQuestions.map(sq => {
          const tq = attempt.test.testQuestions.find(x => x.questionId === sq.questionId);
          const fullQ = tq?.question;
          const ans = answersMap.get(sq.questionId);

          const studentSelectedIds: string[] = ans?.selectedOptionIds
            ? JSON.parse(ans.selectedOptionIds)
            : [];

          return {
            questionId: sq.questionId,
            orderNumber: sq.orderNumber,
            conditionText: sq.conditionText,
            conditionFormula: sq.conditionFormula,
            conditionImageUrl: sq.conditionImageUrl,
            points: sq.points,
            isCorrect: ans?.isCorrect ?? false,
            pointsAwarded: ans?.pointsAwarded ?? 0,
            studentSelectedOptionIds: studentSelectedIds,
            studentNumericAnswer: ans?.numericAnswer,
            studentTextAnswer: ans?.textAnswer,
            // If explanations allowed by teacher:
            explanationText: attempt.test.showExplanations ? fullQ?.explanationText : null,
            explanationFormula: attempt.test.showExplanations ? fullQ?.explanationFormula : null,
            explanationImageUrl: attempt.test.showExplanations ? fullQ?.explanationImageUrl : null,
            options: sq.options.map((opt: any) => {
              const realOpt = fullQ?.options.find(o => o.id === opt.id);
              return {
                ...opt,
                isCorrect: attempt.test.showExplanations ? realOpt?.isCorrect : undefined,
                isSelected: studentSelectedIds.includes(opt.id),
              };
            }),
          };
        })
      : [];

    return {
      success: true,
      attempt: {
        id: attempt.id,
        testId: attempt.testId,
        testTitle: attempt.test.title,
        teacherName: attempt.test.teacher.fullName,
        attemptNumber: attempt.attemptNumber,
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        durationSeconds: attempt.durationSeconds,
        totalQuestions: attempt.totalQuestions,
        correctAnswers: attempt.correctAnswers,
        incorrectAnswers: attempt.incorrectAnswers,
        skippedAnswers: attempt.skippedAnswers,
        score: attempt.score,
        maxScore: attempt.maxScore,
        percentage: attempt.percentage,
        showExplanations: attempt.test.showExplanations,
      },
      questionsReview,
    };
  }

  private formatActiveAttemptResponse(attempt: any, test: any) {
    const now = new Date();
    const remainingSeconds = Math.max(0, Math.floor((attempt.expiresAt.getTime() - now.getTime()) / 1000));

    // Parse snapshot
    const snapshotQuestions = JSON.parse(attempt.shuffledSnapshot);

    // Map existing answers
    const answersMap: Record<string, any> = {};
    if (attempt.answers) {
      attempt.answers.forEach((ans: any) => {
        answersMap[ans.questionId] = {
          selectedOptionIds: ans.selectedOptionIds ? JSON.parse(ans.selectedOptionIds) : [],
          numericAnswer: ans.numericAnswer,
          textAnswer: ans.textAnswer,
        };
      });
    }

    return {
      success: true,
      attemptId: attempt.id,
      testId: test.id,
      testTitle: test.title,
      attemptNumber: attempt.attemptNumber,
      totalQuestions: snapshotQuestions.length,
      startedAt: attempt.startedAt,
      expiresAt: attempt.expiresAt,
      remainingSeconds,
      questions: snapshotQuestions,
      savedAnswers: answersMap,
    };
  }
}
