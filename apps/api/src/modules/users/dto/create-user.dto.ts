import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'ana@example.com' })
  @IsEmail({}, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @MaxLength(191, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  email!: string;

  @ApiProperty({ example: 'hashed-password' })
  @IsString({ message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @MinLength(8, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @MaxLength(255, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  passwordHash!: string;

  @ApiProperty({ example: 'Ana' })
  @IsString({ message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @MinLength(2, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @MaxLength(191, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  displayName!: string;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  preferencesJson?: Record<string, unknown>;
}