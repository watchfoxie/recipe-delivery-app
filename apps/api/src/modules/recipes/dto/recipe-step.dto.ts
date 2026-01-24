import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsInt, IsNotEmpty, IsOptional, Min, MinLength } from 'class-validator';

export class RecipeStepDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @Min(1, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  stepOrder!: number;

  @ApiProperty({ example: 'mix ingredients thoroughly' })
  @IsNotEmpty({ message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @MinLength(5, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  text!: string;

  @ApiProperty({ required: false, example: 60 })
  @IsOptional()
  @IsInt({ message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @Min(0, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  timerSec?: number | null;
}
