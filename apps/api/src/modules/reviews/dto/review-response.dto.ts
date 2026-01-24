import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ReviewAuthorDto {
  @ApiProperty()
  @Expose()
  id!: number;

  @ApiProperty()
  @Expose()
  displayName!: string;

  @ApiPropertyOptional()
  @Expose()
  avatar?: string | null;
}

export class ReviewResponseDto {
  @ApiProperty()
  @Expose()
  id!: number;

  @ApiProperty()
  @Expose()
  recipeId!: number;

  @ApiProperty()
  @Expose()
  userId!: number;

  @ApiProperty()
  @Expose()
  rating!: number;

  @ApiPropertyOptional()
  @Expose()
  comment?: string | null;

  @ApiProperty({ type: ReviewAuthorDto })
  @Expose()
  @Type(() => ReviewAuthorDto)
  user?: ReviewAuthorDto;

  @ApiProperty()
  @Expose()
  createdAt!: Date;

  @ApiProperty()
  @Expose()
  updatedAt!: Date;
}
