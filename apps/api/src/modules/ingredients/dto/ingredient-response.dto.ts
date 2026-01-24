import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class IngredientResponseDto {
  @ApiProperty()
  @Expose()
  id!: number;

  @ApiProperty({ required: false })
  @Expose()
  ingredientCategoryId?: number | null;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty({ required: false, type: [String] })
  @Expose()
  synonymsJson?: string[] | null;

  @ApiProperty()
  @Expose()
  createdAt!: Date;

  @ApiProperty()
  @Expose()
  updatedAt!: Date;
}