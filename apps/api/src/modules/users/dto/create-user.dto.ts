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
import { SafeText, sanitizeText } from '../../../common/validators/safe-text.validator';

const VALIDATION_MESSAGE_KEY = 'messages.ERROR.VALIDATION_FAILED';

export class CreateUserDto {
  @ApiProperty({ example: 'email' })
  @Transform(({ value }) => sanitizeText(value))
  @SafeText({}, { message: i18nValidationMessage(VALIDATION_MESSAGE_KEY) })
  @IsEmail({}, { message: i18nValidationMessage(VALIDATION_MESSAGE_KEY) })
  @MaxLength(191, { message: i18nValidationMessage(VALIDATION_MESSAGE_KEY) })
  email!: string;

  @ApiProperty({ example: 'password' })
  @Transform(({ value }) => sanitizeText(value, { normalize: false }))
  @SafeText(
    { allowHtml: true, allowSqlMeta: true },
    { message: i18nValidationMessage(VALIDATION_MESSAGE_KEY) }
  )
  @IsString({ message: i18nValidationMessage(VALIDATION_MESSAGE_KEY) })
  @MinLength(8, { message: i18nValidationMessage(VALIDATION_MESSAGE_KEY) })
  @MaxLength(255, { message: i18nValidationMessage(VALIDATION_MESSAGE_KEY) })
  password!: string;

  @ApiProperty({ example: 'username' })
  @Transform(({ value }) => sanitizeText(value))
  @SafeText({}, { message: i18nValidationMessage(VALIDATION_MESSAGE_KEY) })
  @IsString({ message: i18nValidationMessage(VALIDATION_MESSAGE_KEY) })
  @MinLength(2, { message: i18nValidationMessage(VALIDATION_MESSAGE_KEY) })
  @MaxLength(191, { message: i18nValidationMessage(VALIDATION_MESSAGE_KEY) })
  displayName!: string;

  @ApiProperty({ required: false, type: Object, example: { theme: 'white' } })
  @IsOptional()
  preferencesJson?: Record<string, unknown> | null;
}
