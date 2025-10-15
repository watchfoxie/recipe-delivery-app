import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

const VALIDATION_MESSAGE_KEY = 'messages.ERROR.VALIDATION_FAILED';

export class LoginDto {
  @ApiProperty({ example: 'username@example.com' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsEmail({}, { message: i18nValidationMessage(VALIDATION_MESSAGE_KEY) })
  email!: string;

  @ApiProperty({ example: 'enter-password' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: i18nValidationMessage(VALIDATION_MESSAGE_KEY) })
  @MinLength(8, { message: i18nValidationMessage(VALIDATION_MESSAGE_KEY) })
  password!: string;
}
