import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const VALIDATION_MESSAGE_KEY = 'messages.ERROR.VALIDATION_FAILED';

export class CreateUserDto {
  @ApiProperty({ example: 'username@example.com' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsEmail({}, { message: i18nValidationMessage(VALIDATION_MESSAGE_KEY) })
  @MaxLength(191, { message: i18nValidationMessage(VALIDATION_MESSAGE_KEY) })
  email!: string;

  @ApiProperty({ example: 'enter-password' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: i18nValidationMessage(VALIDATION_MESSAGE_KEY) })
  @MinLength(8, { message: i18nValidationMessage(VALIDATION_MESSAGE_KEY) })
  @MaxLength(255, { message: i18nValidationMessage(VALIDATION_MESSAGE_KEY) })
  password!: string;

  @ApiProperty({ example: 'Username' })
  @IsString({ message: i18nValidationMessage(VALIDATION_MESSAGE_KEY) })
  @MinLength(2, { message: i18nValidationMessage(VALIDATION_MESSAGE_KEY) })
  @MaxLength(191, { message: i18nValidationMessage(VALIDATION_MESSAGE_KEY) })
  displayName!: string;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  preferencesJson?: Record<string, unknown> | null;
}