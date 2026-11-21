import { Injectable, NotFoundException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Overall platform statistics for Admin dashboard.
   */
  async getAdminStats() {
    const [
      totalUsers,
      totalTeachers,
      totalStudents,
      totalQuestions,
      totalTopics,
      totalTests,
      totalAttempts,
      recentAttempts,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'TEACHER' } }),
      this.prisma.user.count({ where: { role: 'STUDENT' } }),
      this.prisma.question.count(),
      this.prisma.topic.count(),
      this.prisma.test.count(),
      this.prisma.testAttempt.count({ where: { status: 'COMPLETED' } }),
      this.prisma.testAttempt.findMany({
        where: { status: 'COMPLETED' },
        include: {
          student: { select: { fullName: true, phone: true } },
          test: { select: { title: true } },
        },
        orderBy: { submittedAt: 'desc' },
        take: 10,
      }),
    ]);

    const averageScore = await this.prisma.testAttempt.aggregate({
      where: { status: 'COMPLETED' },
      _avg: { percentage: true },
    });

    return {
      success: true,
      stats: {
        totalUsers,
        totalTeachers,
        totalStudents,
        totalQuestions,
        totalTopics,
        totalTests,
        totalAttempts,
        averagePercentage: Math.round((averageScore._avg.percentage || 0) * 10) / 10,
      },
      recentAttempts,
    };
  }

  /**
   * Teacher statistics: overview of their tests, groups, and students.
   */
  async getTeacherStats(teacherId: string) {
    const tests = await this.prisma.test.findMany({
      where: { teacherId },
      include: {
        _count: { select: { attempts: true, testQuestions: true } },
      },
    });

    const testIds = tests.map(t => t.id);

    const attempts = await this.prisma.testAttempt.findMany({
      where: { testId: { in: testIds }, status: 'COMPLETED' },
      select: {
        score: true,
        maxScore: true,
        percentage: true,
        durationSeconds: true,
      },
    });

    const totalAttempts = attempts.length;
    const avgPercentage =
      totalAttempts > 0
        ? attempts.reduce((acc, a) => acc + a.percentage, 0) / totalAttempts
        : 0;

    const questionsCount = await this.prisma.question.count({
      where: { authorId: teacherId },
    });

    const groupsCount = await this.prisma.group.count({
      where: { teacherId },
    });

    return {
      success: true,
      stats: {
        testsCount: tests.length,
        questionsCount,
        groupsCount,
        totalAttempts,
        averagePercentage: Math.round(avgPercentage * 10) / 10,
      },
    };
  }

  /**
   * Detailed statistics for a specific test (by students, questions, and groups).
   */
  async getTestDetailedStats(testId: string) {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      include: {
        teacher: { select: { fullName: true } },
        testQuestions: {
          include: {
            question: {
              include: { topic: { select: { name: true } } },
            },
          },
        },
        attempts: {
          where: { status: 'COMPLETED' },
          include: {
            student: { select: { id: true, fullName: true, phone: true } },
            answers: true,
          },
          orderBy: { score: 'desc' },
        },
      },
    });

    if (!test) throw new NotFoundException('Тест не найден');

    // Question-level error rate analysis
    const questionStats = test.testQuestions.map(tq => {
      let totalAnswered = 0;
      let correctCount = 0;

      test.attempts.forEach(att => {
        const ans = att.answers.find(a => a.questionId === tq.questionId);
        if (ans) {
          totalAnswered++;
          if (ans.isCorrect) correctCount++;
        }
      });

      const successRate = totalAnswered > 0 ? (correctCount / totalAnswered) * 100 : 0;

      return {
        questionId: tq.questionId,
        conditionText: tq.question.conditionText,
        conditionFormula: tq.question.conditionFormula,
        topicName: tq.question.topic.name,
        difficulty: tq.question.difficulty,
        totalAnswered,
        correctCount,
        incorrectCount: totalAnswered - correctCount,
        successRate: Math.round(successRate * 10) / 10,
      };
    });

    return {
      success: true,
      test: {
        id: test.id,
        title: test.title,
        teacherName: test.teacher.fullName,
        durationMinutes: test.durationMinutes,
        totalAttempts: test.attempts.length,
      },
      studentsResults: test.attempts.map(att => ({
        attemptId: att.id,
        studentName: att.student.fullName,
        studentPhone: att.student.phone,
        attemptNumber: att.attemptNumber,
        score: att.score,
        maxScore: att.maxScore,
        percentage: att.percentage,
        durationSeconds: att.durationSeconds,
        submittedAt: att.submittedAt,
      })),
      questionStats,
    };
  }

  /**
   * Export test results to Excel (.xlsx) file as required by Section 9.
   */
  async exportTestToExcel(testId: string): Promise<Buffer> {
    const detailed = await this.getTestDetailedStats(testId);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ProTest Educational System';
    workbook.created = new Date();

    // Sheet 1: Результаты учеников
    const studentsSheet = workbook.addWorksheet('Результаты учеников');
    studentsSheet.columns = [
      { header: '№', key: 'index', width: 6 },
      { header: 'Ф.И.О. Ученика', key: 'studentName', width: 30 },
      { header: 'Телефон', key: 'studentPhone', width: 18 },
      { header: 'Попытка №', key: 'attemptNumber', width: 12 },
      { header: 'Набранные баллы', key: 'score', width: 18 },
      { header: 'Макс. баллы', key: 'maxScore', width: 15 },
      { header: 'Процент (%)', key: 'percentage', width: 15 },
      { header: 'Время (сек)', key: 'durationSeconds', width: 15 },
      { header: 'Дата сдачи', key: 'submittedAt', width: 22 },
    ];

    // Style header row
    studentsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    studentsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF6B21A8' }, // ProTest purple brand color
    };

    detailed.studentsResults.forEach((s, idx) => {
      studentsSheet.addRow({
        index: idx + 1,
        studentName: s.studentName,
        studentPhone: s.studentPhone,
        attemptNumber: s.attemptNumber,
        score: s.score,
        maxScore: s.maxScore,
        percentage: `${s.percentage}%`,
        durationSeconds: s.durationSeconds,
        submittedAt: s.submittedAt ? new Date(s.submittedAt).toLocaleString('ru-RU') : '',
      });
    });

    // Sheet 2: Анализ по вопросам
    const questionsSheet = workbook.addWorksheet('Аналитика по вопросам');
    questionsSheet.columns = [
      { header: '№', key: 'index', width: 6 },
      { header: 'Тема', key: 'topicName', width: 25 },
      { header: 'Условие вопроса', key: 'conditionText', width: 40 },
      { header: 'Сложность', key: 'difficulty', width: 15 },
      { header: 'Ответили', key: 'totalAnswered', width: 12 },
      { header: 'Правильно', key: 'correctCount', width: 12 },
      { header: 'Неправильно', key: 'incorrectCount', width: 14 },
      { header: 'Успешность (%)', key: 'successRate', width: 16 },
    ];

    questionsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    questionsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4C1D95' },
    };

    detailed.questionStats.forEach((q, idx) => {
      questionsSheet.addRow({
        index: idx + 1,
        topicName: q.topicName,
        conditionText: q.conditionText,
        difficulty: q.difficulty,
        totalAnswered: q.totalAnswered,
        correctCount: q.correctCount,
        incorrectCount: q.incorrectCount,
        successRate: `${q.successRate}%`,
      });
    });

    const uint8Array = await workbook.xlsx.writeBuffer();
    return Buffer.from(uint8Array);
  }

  /**
   * Student's individual progress & history.
   */
  async getStudentHistory(studentId: string) {
    const attempts = await this.prisma.testAttempt.findMany({
      where: { studentId, status: 'COMPLETED' },
      include: {
        test: {
          select: {
            title: true,
            teacher: { select: { fullName: true } },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    const totalCompleted = attempts.length;
    const avgPercentage =
      totalCompleted > 0
        ? attempts.reduce((acc, a) => acc + a.percentage, 0) / totalCompleted
        : 0;

    return {
      success: true,
      stats: {
        totalCompleted,
        avgPercentage: Math.round(avgPercentage * 10) / 10,
      },
      attempts: attempts.map(a => ({
        id: a.id,
        testId: a.testId,
        testTitle: a.test.title,
        teacherName: a.test.teacher.fullName,
        attemptNumber: a.attemptNumber,
        score: a.score,
        maxScore: a.maxScore,
        percentage: a.percentage,
        durationSeconds: a.durationSeconds,
        submittedAt: a.submittedAt,
      })),
    };
  }
}
