import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecipeCategoryResponseDto {
  @ApiProperty()
  @Expose()
  id!: number;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty()
  @Expose()
  slug!: string;

  @ApiProperty()
  @Expose()
  thematicCategory!: string;

  @ApiPropertyOptional()
  @Expose()
  description?: string | null;

  @ApiPropertyOptional()
  @Expose()
  iconClass?: string | null;

  @ApiProperty()
  @Expose()
  displayOrder!: number;

  @ApiProperty()
  @Expose()
  createdAt!: Date;

  @ApiProperty()
  @Expose()
  updatedAt!: Date;
}
