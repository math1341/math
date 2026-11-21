import { IsNotEmpty, Matches, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Номер телефона обязателен' })
  @Matches(/^\+998\d{9}$/, { message: 'Номер должен быть формата Узбекистана: +998XXXXXXXXX' })
  phone: string;

  @IsNotEmpty({ message: 'Пароль обязателен' })
  @IsString()
  password: string;
}
