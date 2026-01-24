import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'Rating de la 0 la 5', minimum: 0, maximum: 5 })
  @IsInt()
  @Min(0)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({ description: 'Comentariu opțional pentru review' })
  @IsOptional()
  @IsString()
  comment?: string;
}
