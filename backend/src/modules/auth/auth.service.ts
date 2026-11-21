import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SendOtpDto, VerifyOtpDto } from './dto/otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (existing) {
      throw new ConflictException('Пользователь с таким номером телефона уже зарегистрирован');
    }

    if (dto.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingEmail) {
        throw new ConflictException('Пользователь с таким email уже зарегистрирован');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        email: dto.email,
        fullName: dto.fullName,
        passwordHash,
        role: (dto.role as any) || 'STUDENT',
      },
      select: {
        id: true,
        phone: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });

    // Create Audit Log
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        details: `Пользователь ${user.fullName} зарегистрирован с ролью ${user.role}`,
      },
    });

    const token = this.generateToken(user);
    return {
      success: true,
      user,
      accessToken: token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (!user) {
      throw new UnauthorizedException('Неверный номер телефона или пароль');
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('Ваш аккаунт заблокирован администратором');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Неверный номер телефона или пароль');
    }

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        details: `Вход в систему пользователя ${user.phone}`,
      },
    });

    const token = this.generateToken(user);

    return {
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      accessToken: token,
    };
  }

  // Uzbekistan OTP (+998) Logic as strictly specified in Section 10
  async sendOtp(dto: SendOtpDto) {
    const now = new Date();
    const existingOtp = await this.prisma.otpVerification.findUnique({
      where: { phone: dto.phone },
    });

    // 60 seconds resend cooldown
    if (existingOtp) {
      const secondsSinceLastSent = (now.getTime() - existingOtp.lastSentAt.getTime()) / 1000;
      if (secondsSinceLastSent < 60) {
        const remaining = Math.ceil(60 - secondsSinceLastSent);
        throw new BadRequestException(
          `Повторная отправка кода возможна через ${remaining} сек.`,
        );
      }
    }

    // Generate random 6-digit code
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(rawOtp, 8);
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes validity

    await this.prisma.otpVerification.upsert({
      where: { phone: dto.phone },
      update: {
        otpHash,
        expiresAt,
        attemptsCount: 0,
        lastSentAt: now,
      },
      create: {
        phone: dto.phone,
        otpHash,
        expiresAt,
        attemptsCount: 0,
        lastSentAt: now,
      },
    });

    console.log(`[ProTest OTP Mock Service] Phone: ${dto.phone} => OTP: ${rawOtp}`);

    return {
      success: true,
      message: 'Код подтверждения отправлен на номер ' + dto.phone,
      expiresInSeconds: 300,
      devOtp: process.env.NODE_ENV !== 'production' ? rawOtp : undefined,
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const record = await this.prisma.otpVerification.findUnique({
      where: { phone: dto.phone },
    });

    if (!record) {
      throw new NotFoundException('Код подтверждения для данного номера не запрашивался');
    }

    const now = new Date();
    if (now > record.expiresAt) {
      throw new BadRequestException('Срок действия кода подтверждения (5 минут) истек');
    }

    if (record.attemptsCount >= 5) {
      throw new BadRequestException(
        'Превышен лимит попыток (максимум 5). Запросите новый код подтверждения.',
      );
    }

    const isMatch = await bcrypt.compare(dto.code, record.otpHash);
    if (!isMatch) {
      await this.prisma.otpVerification.update({
        where: { phone: dto.phone },
        data: { attemptsCount: record.attemptsCount + 1 },
      });
      const remainingAttempts = 4 - record.attemptsCount;
      throw new BadRequestException(
        `Неверный код. Осталось попыток: ${remainingAttempts}`,
      );
    }

    // Code verified successfully, delete record
    await this.prisma.otpVerification.delete({
      where: { phone: dto.phone },
    });

    // Check if user already exists
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (user) {
      const token = this.generateToken(user);
      return {
        success: true,
        isRegistered: true,
        user: {
          id: user.id,
          phone: user.phone,
          fullName: user.fullName,
          role: user.role,
        },
        accessToken: token,
      };
    }

    return {
      success: true,
      isRegistered: false,
      message: 'Номер телефона успешно подтвержден. Завершите регистрацию.',
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        email: true,
        fullName: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return { success: true, user };
  }

  private generateToken(user: { id: string; phone: string; role: any; fullName: string }) {
    const payload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
      fullName: user.fullName,
    };
    return this.jwtService.sign(payload);
  }
}
