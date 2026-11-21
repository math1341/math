import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { role?: string; search?: string; page?: number; limit?: number }) {
    const pageNum = Math.max(1, Number(params.page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(params.limit) || 20));
    const skip = (pageNum - 1) * limitNum;
    const { role, search } = params;

    const where: any = {};
    if (role) {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          phone: true,
          email: true,
          fullName: true,
          role: true,
          isBlocked: true,
          createdAt: true,
          _count: {
            select: {
              authoredQuestions: true,
              createdTests: true,
              testAttempts: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      success: true,
      items,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        phone: true,
        email: true,
        fullName: true,
        role: true,
        isBlocked: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return { success: true, user };
  }

  async toggleBlock(id: string, currentAdminId: string) {
    if (id === currentAdminId) {
      throw new BadRequestException('Администратор не может заблокировать сам себя');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isBlocked: !user.isBlocked },
      select: {
        id: true,
        phone: true,
        fullName: true,
        role: true,
        isBlocked: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: currentAdminId,
        action: updated.isBlocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
        details: `Пользователь ${updated.fullName} (${updated.phone}) ${updated.isBlocked ? 'заблокирован' : 'разблокирован'}`,
      },
    });

    return {
      success: true,
      message: updated.isBlocked ? 'Пользователь заблокирован' : 'Пользователь разблокирован',
      user: updated,
    };
  }

  async getTeachers() {
    const teachers = await this.prisma.user.findMany({
      where: { role: 'TEACHER', isBlocked: false },
      select: {
        id: true,
        phone: true,
        email: true,
        fullName: true,
        createdAt: true,
      },
      orderBy: { fullName: 'asc' },
    });
    return { success: true, teachers };
  }

  async getStudents() {
    const students = await this.prisma.user.findMany({
      where: { role: 'STUDENT', isBlocked: false },
      select: {
        id: true,
        phone: true,
        email: true,
        fullName: true,
        createdAt: true,
      },
      orderBy: { fullName: 'asc' },
    });
    return { success: true, students };
  }
}
