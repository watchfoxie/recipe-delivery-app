import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIngredientCategoryDto {
  @ApiProperty({ description: 'Numele categoriei', example: 'Legume' })
  @IsString()
  @MaxLength(191)
  name!: string;

  @ApiPropertyOptional({ description: 'Descrierea categoriei' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Clasa iconiței Font Awesome', example: 'fa-solid fa-carrot' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  iconClass?: string;

  @ApiPropertyOptional({ description: 'Ordinea de afișare', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}
