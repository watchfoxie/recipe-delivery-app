import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsArray, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateIngredientDto {
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
