import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class RecipeIngredientDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @Min(1, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  ingredientId!: number;

  @ApiProperty({ required: false, example: 200.5 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 }, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @IsPositive({ message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  quantity?: number | null;

  @ApiProperty({ required: false, example: 'g' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @MaxLength(32, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  unit?: string | null;

  @ApiProperty({ required: false, example: 'remark' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @MaxLength(191, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  note?: string | null;
}
