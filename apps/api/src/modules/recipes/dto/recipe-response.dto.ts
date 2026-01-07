import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IngredientResponseDto } from '../../ingredients/dto/ingredient-response.dto';
import { RecipeDifficulty } from '../entities/recipe.entity';
import { CommentResponseDto } from './comment-response.dto';

export class RecipeStepResponseDto {
  @ApiProperty()
  @Expose()
  id!: number;

  @ApiProperty()
  @Expose()
  stepOrder!: number;

  @ApiProperty()
  @Expose()
  text!: string;

  @ApiProperty({ required: false })
  @Expose()
  timerSec?: number | null;
}

export class RecipeIngredientResponseDto {
  @ApiProperty()
  @Expose()
  id!: number;

  @ApiProperty()
  @Expose()
  ingredientId!: number;

  @ApiProperty({ required: false })
  @Expose()
  quantity?: number | null;

  @ApiProperty({ required: false })
  @Expose()
  unit?: string | null;

  @ApiProperty({ required: false })
  @Expose()
  note?: string | null;

  @ApiProperty({ type: IngredientResponseDto })
  @Expose()
  @Type(() => IngredientResponseDto)
  ingredient?: IngredientResponseDto;
}

export class RecipeResponseDto {
  @ApiProperty()
  @Expose()
  id!: number;

  @ApiProperty()
  @Expose()
  slug!: string;

  @ApiProperty()
  @Expose()
  title!: string;

  @ApiProperty({ enum: RecipeDifficulty })
  @Expose()
  difficulty!: RecipeDifficulty;

  @ApiProperty()
  @Expose()
  totalTimeMin!: number;

  @ApiProperty()
  @Expose()
  servings!: number;

  @ApiProperty()
  @Expose()
  ratingAvg!: number;

  @ApiProperty({ required: false, type: [String] })
  @Expose()
  dietaryTagsJson?: string[] | null;

  @ApiProperty({ required: false })
  @Expose()
  description?: string | null;

  @ApiProperty()
  @Expose()
  authorId!: number;

  @ApiProperty({ required: false })
  @Expose()
  recipeCategoryId?: number | null;

  @ApiProperty({ type: [RecipeStepResponseDto] })
  @Expose()
  @Type(() => RecipeStepResponseDto)
  steps?: RecipeStepResponseDto[];

  @ApiProperty({ type: [RecipeIngredientResponseDto] })
  @Expose()
  @Type(() => RecipeIngredientResponseDto)
  recipeIngredients?: RecipeIngredientResponseDto[];

  @ApiProperty({ type: [CommentResponseDto], required: false })
  @Expose()
  @Type(() => CommentResponseDto)
  comments?: CommentResponseDto[];

  @ApiProperty()
  @Expose()
  createdAt!: Date;

  @ApiProperty()
  @Expose()
  updatedAt!: Date;
}