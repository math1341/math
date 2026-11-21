import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; description?: string; studentIds?: string[] }, teacherId: string) {
    const group = await this.prisma.group.create({
      data: {
        name: data.name,
        description: data.description,
        teacherId,
        members: data.studentIds && data.studentIds.length > 0 ? {
          create: data.studentIds.map(sId => ({ studentId: sId })),
        } : undefined,
      },
      include: {
        members: {
          include: {
            student: {
              select: { id: true, fullName: true, phone: true },
            },
          },
        },
      },
    });

    return { success: true, group };
  }

  async findMyGroups(user: { id: string; role: string }) {
    if (user.role === 'ADMIN') {
      const groups = await this.prisma.group.findMany({
        include: {
          teacher: { select: { id: true, fullName: true, phone: true } },
          _count: { select: { members: true, testAssignments: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return { success: true, groups };
    }

    if (user.role === 'TEACHER') {
      const groups = await this.prisma.group.findMany({
        where: { teacherId: user.id },
        include: {
          _count: { select: { members: true, testAssignments: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return { success: true, groups };
    }

    // Student
    const memberRecords = await this.prisma.groupMember.findMany({
      where: { studentId: user.id },
      include: {
        group: {
          include: {
            teacher: { select: { id: true, fullName: true } },
            _count: { select: { members: true, testAssignments: true } },
          },
        },
      },
    });

    return {
      success: true,
      groups: memberRecords.map(m => m.group),
    };
  }

  async findOne(id: string, user: { id: string; role: string }) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        teacher: { select: { id: true, fullName: true, phone: true } },
        members: {
          include: {
            student: { select: { id: true, fullName: true, phone: true, email: true } },
          },
        },
        testAssignments: {
          include: {
            test: { select: { id: true, title: true, durationMinutes: true, startsAt: true, endsAt: true } },
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Группа не найдена');
    }

    if (user.role === 'TEACHER' && group.teacherId !== user.id) {
      throw new ForbiddenException('Нет доступа к группе другого преподавателя');
    }

    return { success: true, group };
  }

  async update(id: string, data: { name?: string; description?: string }, teacherId: string, isAdmin: boolean) {
    const group = await this.prisma.group.findUnique({ where: { id } });
    if (!group) throw new NotFoundException('Группа не найдена');
    if (!isAdmin && group.teacherId !== teacherId) {
      throw new ForbiddenException('Вы не являетесь владельцем этой группы');
    }

    const updated = await this.prisma.group.update({
      where: { id },
      data,
    });

    return { success: true, group: updated };
  }

  async addStudent(groupId: string, studentId: string, teacherId: string, isAdmin: boolean) {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Группа не найдена');
    if (!isAdmin && group.teacherId !== teacherId) {
      throw new ForbiddenException('Вы не можете управлять этой группой');
    }

    await this.prisma.groupMember.upsert({
      where: { groupId_studentId: { groupId, studentId } },
      update: {},
      create: { groupId, studentId },
    });

    return { success: true, message: 'Ученик успешно добавлен в группу' };
  }

  async removeStudent(groupId: string, studentId: string, teacherId: string, isAdmin: boolean) {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Группа не найдена');
    if (!isAdmin && group.teacherId !== teacherId) {
      throw new ForbiddenException('Вы не можете управлять этой группой');
    }

    await this.prisma.groupMember.deleteMany({
      where: { groupId, studentId },
    });

    return { success: true, message: 'Ученик удален из группы' };
  }
}
