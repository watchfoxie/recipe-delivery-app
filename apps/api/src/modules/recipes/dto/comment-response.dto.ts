import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class CommentAuthorResponseDto {
  @ApiProperty()
  @Expose()
  id!: number;

  @ApiProperty()
  @Expose()
  displayName!: string;
}

export class CommentResponseDto {
  @ApiProperty()
  @Expose()
  id!: number;

  @ApiProperty()
  @Expose()
  recipeId!: number;

  @ApiProperty()
  @Expose()
  authorId!: number;

  @ApiProperty()
  @Expose()
  text!: string;

  @ApiProperty({ type: CommentAuthorResponseDto })
  @Expose()
  @Type(() => CommentAuthorResponseDto)
  author?: CommentAuthorResponseDto;

  @ApiProperty()
  @Expose()
  createdAt!: Date;

  @ApiProperty()
  @Expose()
  updatedAt!: Date;
}
