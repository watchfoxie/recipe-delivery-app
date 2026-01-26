import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { SafeText, sanitizeText } from '../../../common/validators/safe-text.validator';

export class CreateCommentDto {
  @ApiProperty({ description: 'Comment text', minLength: 1, maxLength: 2000 })
  @Transform(({ value }) => sanitizeText(value))
  @SafeText({ allowNewlines: true })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  text!: string;
}
