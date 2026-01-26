import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  Matches,
  ValidateNested,
} from 'class-validator';
import { SafeText, sanitizeText, sanitizeTextArray } from '../../../common/validators/safe-text.validator';
import { RecipeDifficulty } from '../entities/recipe.entity';
import { RecipeIngredientDto } from './recipe-ingredient.dto';
import { RecipeStepDto } from './recipe-step.dto';

export class CreateRecipeDto {
  @ApiProperty({ example: 'recipe-name-identifier' })
  @Transform(({ value }) => sanitizeText(value))
  @SafeText({}, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @Matches(/^[a-z0-9-]+$/i, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @IsString({ message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @MinLength(3, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @MaxLength(191, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  slug!: string;

  @ApiProperty({ example: 'recipe' })
  @Transform(({ value }) => sanitizeText(value))
  @SafeText({}, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @IsString({ message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @MinLength(3, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @MaxLength(191, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  title!: string;

  @ApiProperty({ enum: RecipeDifficulty, default: RecipeDifficulty.EASY })
  @IsEnum(RecipeDifficulty, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  difficulty!: RecipeDifficulty;

  @ApiProperty({ example: 5 })
  @IsInt({ message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @Min(1, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  totalTimeMin!: number;

  @ApiProperty({ example: 2 })
  @IsInt({ message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @Min(1, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  servings!: number;

  @ApiProperty({ required: false, example: 4.5 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  ratingAvg?: number;

  @ApiProperty({ required: false, type: [String], example: ['tag'] })
  @IsOptional()
  @Transform(({ value }) => sanitizeTextArray(value))
  @IsArray({ message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @SafeText({ allowNewlines: false }, {
    each: true,
    message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED'),
  })
  @IsString({ each: true, message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  dietaryTags?: string[];

  @ApiProperty({ required: false, type: String, example: 'depiction' })
  @IsOptional()
  @Transform(({ value }) => sanitizeText(value))
  @SafeText({ allowNewlines: true }, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @IsString({ message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  description?: string | null;

  @ApiProperty({ example: 1 })
  @IsInt({ message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @Min(1, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  authorId!: number;

  @ApiProperty({ required: false, example: 1 })
  @IsInt({ message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @Min(1, { message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  recipeCategoryId?: number | null;

  @ApiProperty({ type: [RecipeStepDto], required: false })
  @IsOptional()
  @IsArray({ message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @ValidateNested({ each: true })
  @Type(() => RecipeStepDto)
  steps?: RecipeStepDto[];

  @ApiProperty({ type: [RecipeIngredientDto], required: false })
  @IsOptional()
  @IsArray({ message: i18nValidationMessage('messages.ERROR.VALIDATION_FAILED') })
  @ValidateNested({ each: true })
  @Type(() => RecipeIngredientDto)
  ingredients?: RecipeIngredientDto[];
}
