import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TopicsService {
  constructor(private prisma: PrismaService) {}

  async getTree(includeArchived = false) {
    const where: any = { parentId: null };
    if (!includeArchived) {
      where.isArchived = false;
    }

    const rootTopics = await this.prisma.topic.findMany({
      where,
      include: {
        children: {
          where: includeArchived ? {} : { isArchived: false },
          include: {
            _count: { select: { questions: true } },
          },
          orderBy: { orderIndex: 'asc' },
        },
        _count: { select: { questions: true } },
      },
      orderBy: { orderIndex: 'asc' },
    });

    return { success: true, topics: rootTopics };
  }

  async findAll(params: { search?: string; parentId?: string; isArchived?: boolean }) {
    const where: any = {};
    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { description: { contains: params.search } },
      ];
    }
    if (params.parentId !== undefined) {
      where.parentId = params.parentId === 'null' ? null : params.parentId;
    }
    if (params.isArchived !== undefined) {
      where.isArchived = params.isArchived;
    }

    const topics = await this.prisma.topic.findMany({
      where,
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { questions: true, children: true } },
      },
      orderBy: [{ orderIndex: 'asc' }, { name: 'asc' }],
    });

    return { success: true, topics };
  }

  async findOne(id: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          include: { _count: { select: { questions: true } } },
          orderBy: { orderIndex: 'asc' },
        },
        questions: {
          where: { isArchived: false },
          include: { options: true },
        },
      },
    });

    if (!topic) throw new NotFoundException('Тема не найдена');
    return { success: true, topic };
  }

  async create(data: { name: string; description?: string; parentId?: string; orderIndex?: number }) {
    const topic = await this.prisma.topic.create({
      data: {
        name: data.name,
        description: data.description,
        parentId: data.parentId || null,
        orderIndex: data.orderIndex || 0,
      },
    });
    return { success: true, topic };
  }

  async update(id: string, data: { name?: string; description?: string; parentId?: string; orderIndex?: number }) {
    const existing = await this.prisma.topic.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Тема не найдена');

    const updated = await this.prisma.topic.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        parentId: data.parentId,
        orderIndex: data.orderIndex,
      },
    });

    return { success: true, topic: updated };
  }

  async toggleArchive(id: string) {
    const existing = await this.prisma.topic.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Тема не найдена');

    const updated = await this.prisma.topic.update({
      where: { id },
      data: { isArchived: !existing.isArchived },
    });

    return {
      success: true,
      message: updated.isArchived ? 'Тема перемещена в архив' : 'Тема восстановлена из архива',
      topic: updated,
    };
  }

  async reorder(items: { id: string; orderIndex: number }[]) {
    await Promise.all(
      items.map(item =>
        this.prisma.topic.update({
          where: { id: item.id },
          data: { orderIndex: item.orderIndex },
        }),
      ),
    );
    return { success: true, message: 'Порядок тем успешно обновлен' };
  }
}
