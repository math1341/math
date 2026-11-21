import { IsNotEmpty, IsString, IsOptional, IsEmail, Matches, MinLength, IsIn } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Номер телефона обязателен' })
  @Matches(/^\+998\d{9}$/, { message: 'Номер должен быть формата Узбекистана: +998XXXXXXXXX' })
  phone: string;

  @IsNotEmpty({ message: 'Пароль обязателен' })
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password: string;

  @IsNotEmpty({ message: 'Полное имя обязательно' })
  @IsString()
  fullName: string;

  @IsOptional()
  @IsEmail({}, { message: 'Некорректный формат email' })
  email?: string;

  @IsOptional()
  @IsIn(['TEACHER', 'STUDENT'], { message: 'Роль при регистрации может быть TEACHER или STUDENT' })
  role?: string = 'STUDENT';
}
