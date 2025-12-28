import { ApiProperty } from '@nestjs/swagger';

export class FavoriteStatusResponseDto {
  @ApiProperty({ example: 1 })
  recipeId!: number;

  @ApiProperty({ example: true })
  isFavorite!: boolean;
}
