import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRecipeCategoryDto {
  @ApiProperty({ description: 'Numele categoriei', example: 'Mâncăruri cu carne' })
  @IsString()
  @MaxLength(191)
  name!: string;

  @ApiProperty({ description: 'Categoria tematică', example: 'Rețete' })
  @IsString()
  @MaxLength(100)
  thematicCategory!: string;

  @ApiPropertyOptional({ description: 'Descrierea categoriei' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Clasa iconiței Font Awesome', example: 'fa-solid fa-drumstick-bite' })
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
