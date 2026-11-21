import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    topicId?: string;
    difficulty?: string;
    search?: string;
    isArchived?: boolean;
    authorId?: string;
    page?: number;
    limit?: number;
  }, user: { id: string; role: string }) {
    const pageNum = Math.max(1, Number(params.page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(params.limit) || 20));
    const skip = (pageNum - 1) * limitNum;
    const { topicId, difficulty, search, isArchived = false, authorId } = params;

    const where: any = { isArchived };

    // Teacher sees their own questions unless Admin
    if (user.role === 'TEACHER') {
      where.authorId = user.id;
    } else if (authorId && user.role === 'ADMIN') {
      where.authorId = authorId;
    }

    if (topicId) {
      where.topicId = topicId;
    }
    if (difficulty) {
      where.difficulty = difficulty;
    }
    if (search) {
      where.OR = [
        { conditionText: { contains: search } },
        { conditionFormula: { contains: search } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.question.findMany({
        where,
        include: {
          topic: { select: { id: true, name: true } },
          author: { select: { id: true, fullName: true } },
          options: { orderBy: { orderIndex: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      this.prisma.question.count({ where }),
    ]);

    return {
      success: true,
      items,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  async findOne(id: string, user: { id: string; role: string }) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        topic: true,
        author: { select: { id: true, fullName: true } },
        options: { orderBy: { orderIndex: 'asc' } },
      },
    });

    if (!question) throw new NotFoundException('Вопрос не найден');

    if (user.role === 'TEACHER' && question.authorId !== user.id) {
      throw new ForbiddenException('Нет доступа к вопросу другого преподавателя');
    }

    return { success: true, question };
  }

  async create(data: {
    topicId: string;
    conditionText: string;
    conditionFormula?: string;
    conditionImageUrl?: string;
    difficulty?: any;
    points?: number;
    isSingleChoice?: boolean;
    isMultipleChoice?: boolean;
    isNumericAnswer?: boolean;
    isTextAnswer?: boolean;
    correctNumeric?: number;
    correctText?: string;
    explanationText?: string;
    explanationFormula?: string;
    explanationImageUrl?: string;
    options?: {
      text: string;
      formula?: string;
      imageUrl?: string;
      isCorrect: boolean;
      orderIndex?: number;
    }[];
  }, authorId: string) {
    const question = await this.prisma.question.create({
      data: {
        topicId: data.topicId,
        authorId,
        conditionText: data.conditionText,
        conditionFormula: data.conditionFormula,
        conditionImageUrl: data.conditionImageUrl,
        difficulty: data.difficulty || 'MEDIUM',
        points: data.points || 1.0,
        isSingleChoice: data.isSingleChoice ?? true,
        isMultipleChoice: data.isMultipleChoice ?? false,
        isNumericAnswer: data.isNumericAnswer ?? false,
        isTextAnswer: data.isTextAnswer ?? false,
        correctNumeric: data.correctNumeric,
        correctText: data.correctText,
        explanationText: data.explanationText,
        explanationFormula: data.explanationFormula,
        explanationImageUrl: data.explanationImageUrl,
        options: data.options && data.options.length > 0 ? {
          create: data.options.map((opt, idx) => ({
            text: opt.text,
            formula: opt.formula,
            imageUrl: opt.imageUrl,
            isCorrect: opt.isCorrect,
            orderIndex: opt.orderIndex ?? (idx + 1),
          })),
        } : undefined,
      },
      include: {
        options: { orderBy: { orderIndex: 'asc' } },
        topic: true,
      },
    });

    return { success: true, question };
  }

  async update(id: string, data: any, user: { id: string; role: string }) {
    const existing = await this.prisma.question.findUnique({
      where: { id },
      include: { options: true },
    });

    if (!existing) throw new NotFoundException('Вопрос не найден');

    if (user.role === 'TEACHER' && existing.authorId !== user.id) {
      throw new ForbiddenException('Нет прав на редактирование чужого вопроса');
    }

    // Update question base fields
    const updated = await this.prisma.question.update({
      where: { id },
      data: {
        topicId: data.topicId,
        conditionText: data.conditionText,
        conditionFormula: data.conditionFormula,
        conditionImageUrl: data.conditionImageUrl,
        difficulty: data.difficulty,
        points: data.points,
        isSingleChoice: data.isSingleChoice,
        isMultipleChoice: data.isMultipleChoice,
        isNumericAnswer: data.isNumericAnswer,
        isTextAnswer: data.isTextAnswer,
        correctNumeric: data.correctNumeric,
        correctText: data.correctText,
        explanationText: data.explanationText,
        explanationFormula: data.explanationFormula,
        explanationImageUrl: data.explanationImageUrl,
      },
    });

    // If options are provided, recreate them to avoid stale IDs
    if (data.options && Array.isArray(data.options)) {
      await this.prisma.option.deleteMany({ where: { questionId: id } });
      await this.prisma.option.createMany({
        data: data.options.map((opt: any, idx: number) => ({
          questionId: id,
          text: opt.text,
          formula: opt.formula,
          imageUrl: opt.imageUrl,
          isCorrect: opt.isCorrect,
          orderIndex: opt.orderIndex ?? (idx + 1),
        })),
      });
    }

    const result = await this.prisma.question.findUnique({
      where: { id },
      include: { options: { orderBy: { orderIndex: 'asc' } }, topic: true },
    });

    return { success: true, question: result };
  }

  async toggleArchive(id: string, user: { id: string; role: string }) {
    const existing = await this.prisma.question.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Вопрос не найден');

    if (user.role === 'TEACHER' && existing.authorId !== user.id) {
      throw new ForbiddenException('Нет прав на архивацию чужого вопроса');
    }

    const updated = await this.prisma.question.update({
      where: { id },
      data: { isArchived: !existing.isArchived },
    });

    return {
      success: true,
      message: updated.isArchived ? 'Вопрос перенесен в архив' : 'Вопрос восстановлен из архива',
      question: updated,
    };
  }
}
