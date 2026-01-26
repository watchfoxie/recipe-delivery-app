import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsArray, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { SafeText, sanitizeText, sanitizeTextArray } from '../../../common/validators/safe-text.validator';

export class CreateIngredientDto {
  @ApiProperty({ required: false, example: 1 })
  @IsInt({ message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @Min(1, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  ingredientCategoryId?: number | null;

  @ApiProperty({ example: 'ingredient' })
  @Transform(({ value }) => sanitizeText(value))
  @SafeText({}, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @IsString({ message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @MinLength(2, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @MaxLength(191, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  name!: string;

  @ApiProperty({ required: false, type: [String], example: ['keyword'] })
  @IsOptional()
  @Transform(({ value }) => sanitizeTextArray(value))
  @IsArray({ message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @SafeText({ allowNewlines: false }, {
    each: true,
    message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED'),
  })
  @IsString({ each: true, message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  synonyms?: string[];
}
