import { IsNotEmpty, Matches, Length } from 'class-validator';

export class SendOtpDto {
  @IsNotEmpty({ message: 'Номер телефона обязателен' })
  @Matches(/^\+998\d{9}$/, { message: 'Номер должен быть формата Узбекистана: +998XXXXXXXXX' })
  phone: string;
}

export class VerifyOtpDto {
  @IsNotEmpty({ message: 'Номер телефона обязателен' })
  @Matches(/^\+998\d{9}$/, { message: 'Номер должен быть формата Узбекистана: +998XXXXXXXXX' })
  phone: string;

  @IsNotEmpty({ message: 'Код подтверждения обязателен' })
  @Length(6, 6, { message: 'Код подтверждения должен состоять из 6 цифр' })
  code: string;
}
