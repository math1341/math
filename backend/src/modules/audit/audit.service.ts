import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { page?: number; limit?: number; action?: string }) {
    const { page = 1, limit = 50, action } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (action) {
      where.action = action;
    }

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, fullName: true, phone: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: Number(skip),
        take: Number(limit),
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      success: true,
      items,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    };
  }

  async log(userId: string | null, action: string, details?: string, ipAddress?: string, userAgent?: string) {
    return this.prisma.auditLog.create({
      data: {
        userId,
        action,
        details,
        ipAddress,
        userAgent,
      },
    });
  }
}
