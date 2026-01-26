import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { SafeText, sanitizeText } from '../../../common/validators/safe-text.validator';

export class CreateIngredientCategoryDto {
  @ApiProperty({ description: 'Numele categoriei', example: 'Legume' })
  @Transform(({ value }) => sanitizeText(value))
  @SafeText()
  @IsString()
  @MaxLength(191)
  name!: string;

  @ApiPropertyOptional({ description: 'Descrierea categoriei' })
  @IsOptional()
  @Transform(({ value }) => sanitizeText(value))
  @SafeText({ allowNewlines: true })
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Clasa iconiței Font Awesome', example: 'fa-solid fa-carrot' })
  @IsOptional()
  @Transform(({ value }) => sanitizeText(value))
  @SafeText()
  @IsString()
  @MaxLength(100)
  iconClass?: string;

  @ApiPropertyOptional({ description: 'Ordinea de afișare', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}
