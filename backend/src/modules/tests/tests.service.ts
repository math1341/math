import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TestsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { search?: string; page?: number; limit?: number }, user: { id: string; role: string }) {
    const pageNum = Math.max(1, Number(params.page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(params.limit) || 20));
    const skip = (pageNum - 1) * limitNum;
    const { search } = params;

    const where: any = { isArchived: false };

    if (user.role === 'TEACHER') {
      where.teacherId = user.id;
    } else if (user.role === 'STUDENT') {
      // Find tests assigned to student's groups
      const studentGroups = await this.prisma.groupMember.findMany({
        where: { studentId: user.id },
        select: { groupId: true },
      });
      const groupIds = studentGroups.map(g => g.groupId);

      where.assignedGroups = {
        some: {
          groupId: { in: groupIds },
        },
      };
    }

    if (search) {
      where.title = { contains: search };
    }

    const [items, total] = await Promise.all([
      this.prisma.test.findMany({
        where,
        include: {
          teacher: { select: { id: true, fullName: true } },
          assignedGroups: {
            include: { group: { select: { id: true, name: true } } },
          },
          _count: { select: { testQuestions: true, attempts: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      this.prisma.test.count({ where }),
    ]);

    // If student, attach student's attempt information
    if (user.role === 'STUDENT') {
      const studentAttempts = await this.prisma.testAttempt.findMany({
        where: { studentId: user.id },
        select: {
          testId: true,
          id: true,
          attemptNumber: true,
          status: true,
          score: true,
          maxScore: true,
          percentage: true,
          submittedAt: true,
        },
      });

      const attemptsMap = new Map<string, any[]>();
      studentAttempts.forEach(att => {
        const arr = attemptsMap.get(att.testId) || [];
        arr.push(att);
        attemptsMap.set(att.testId, arr);
      });

      const itemsWithAttempts = items.map(t => ({
        ...t,
        myAttempts: attemptsMap.get(t.id) || [],
      }));

      return {
        success: true,
        items: itemsWithAttempts,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      };
    }

    return {
      success: true,
      items,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  async findOne(id: string, user: { id: string; role: string }) {
    const test = await this.prisma.test.findUnique({
      where: { id },
      include: {
        teacher: { select: { id: true, fullName: true, phone: true } },
        assignedGroups: {
          include: { group: { select: { id: true, name: true } } },
        },
        testQuestions: {
          include: {
            question: {
              include: {
                topic: { select: { id: true, name: true } },
                options: true,
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        _count: { select: { attempts: true } },
      },
    });

    if (!test) throw new NotFoundException('Тест не найден');

    if (user.role === 'TEACHER' && test.teacherId !== user.id) {
      throw new ForbiddenException('Нет доступа к тесту другого преподавателя');
    }

    return { success: true, test };
  }

  async create(data: {
    title: string;
    description?: string;
    durationMinutes: number;
    startsAt?: Date;
    endsAt?: Date;
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    allowRetake?: boolean;
    maxAttempts?: number;
    showResultsImmediately?: boolean;
    showExplanations?: boolean;
    groupIds?: string[];
    // Manual question selection or criteria
    questionIds?: string[];
    autoSelect?: {
      topicIds: string[];
      count: number;
      difficulty?: string;
    };
  }, teacherId: string) {
    let finalQuestionIds: string[] = [];

    if (data.questionIds && data.questionIds.length > 0) {
      finalQuestionIds = data.questionIds;
    } else if (data.autoSelect && data.autoSelect.topicIds.length > 0) {
      // Auto selection logic
      const where: any = {
        topicId: { in: data.autoSelect.topicIds },
        isArchived: false,
      };
      if (data.autoSelect.difficulty) {
        where.difficulty = data.autoSelect.difficulty;
      }

      const availableQuestions = await this.prisma.question.findMany({
        where,
        select: { id: true },
        take: data.autoSelect.count * 2,
      });

      // Shuffle available and pick count
      const shuffled = availableQuestions.sort(() => 0.5 - Math.random());
      finalQuestionIds = shuffled.slice(0, data.autoSelect.count).map(q => q.id);
    }

    if (finalQuestionIds.length === 0) {
      throw new BadRequestException('В тесте должен быть хотя бы один вопрос');
    }

    // Fetch questions to get points
    const questions = await this.prisma.question.findMany({
      where: { id: { in: finalQuestionIds } },
      select: { id: true, points: true },
    });

    const test = await this.prisma.test.create({
      data: {
        title: data.title,
        description: data.description,
        teacherId,
        durationMinutes: data.durationMinutes || 45,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        shuffleQuestions: data.shuffleQuestions ?? true,
        shuffleOptions: data.shuffleOptions ?? true,
        allowRetake: data.allowRetake ?? false,
        maxAttempts: data.maxAttempts || 1,
        showResultsImmediately: data.showResultsImmediately ?? true,
        showExplanations: data.showExplanations ?? false,
        assignedGroups: data.groupIds && data.groupIds.length > 0 ? {
          create: data.groupIds.map(groupId => ({ groupId })),
        } : undefined,
        testQuestions: {
          create: questions.map((q, idx) => ({
            questionId: q.id,
            points: q.points,
            orderIndex: idx + 1,
          })),
        },
      },
      include: {
        assignedGroups: { include: { group: true } },
        testQuestions: { include: { question: true } },
      },
    });

    return { success: true, test };
  }

  async update(id: string, data: any, user: { id: string; role: string }) {
    const test = await this.prisma.test.findUnique({ where: { id } });
    if (!test) throw new NotFoundException('Тест не найден');
    if (user.role === 'TEACHER' && test.teacherId !== user.id) {
      throw new ForbiddenException('Нет прав на редактирование чужого теста');
    }

    const updated = await this.prisma.test.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        durationMinutes: data.durationMinutes,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        shuffleQuestions: data.shuffleQuestions,
        shuffleOptions: data.shuffleOptions,
        allowRetake: data.allowRetake,
        maxAttempts: data.maxAttempts,
        showResultsImmediately: data.showResultsImmediately,
        showExplanations: data.showExplanations,
      },
    });

    if (data.groupIds && Array.isArray(data.groupIds)) {
      await this.prisma.testGroupAssignment.deleteMany({ where: { testId: id } });
      await this.prisma.testGroupAssignment.createMany({
        data: data.groupIds.map((gId: string) => ({ testId: id, groupId: gId })),
      });
    }

    if (data.questionIds && Array.isArray(data.questionIds)) {
      await this.prisma.testQuestion.deleteMany({ where: { testId: id } });
      const questions = await this.prisma.question.findMany({
        where: { id: { in: data.questionIds } },
        select: { id: true, points: true },
      });
      await this.prisma.testQuestion.createMany({
        data: questions.map((q, idx) => ({
          testId: id,
          questionId: q.id,
          points: q.points,
          orderIndex: idx + 1,
        })),
      });
    }

    return { success: true, test: updated };
  }

  async toggleArchive(id: string, user: { id: string; role: string }) {
    const test = await this.prisma.test.findUnique({ where: { id } });
    if (!test) throw new NotFoundException('Тест не найден');
    if (user.role === 'TEACHER' && test.teacherId !== user.id) {
      throw new ForbiddenException('Нет прав на архивацию чужого теста');
    }

    const updated = await this.prisma.test.update({
      where: { id },
      data: { isArchived: !test.isArchived },
    });

    return {
      success: true,
      message: updated.isArchived ? 'Тест архивирован' : 'Тест восстановлен из архива',
      test: updated,
    };
  }
}
