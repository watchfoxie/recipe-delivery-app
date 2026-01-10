import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsArray, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateIngredientDto {
  @ApiProperty({ required: false, example: 1 })
  @IsInt({ message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @Min(1, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  ingredientCategoryId?: number | null;

  @ApiProperty({ example: 'ingredient' })
  @IsString({ message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @MinLength(2, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @MaxLength(191, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  name!: string;

  @ApiProperty({ required: false, type: [String], example: ['keyword'] })
  @IsOptional()
  @IsArray({ message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @IsString({ each: true, message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  synonyms?: string[];
}
