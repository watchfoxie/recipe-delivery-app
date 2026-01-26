import { IsString, IsOptional, IsEmail, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { SafeText, sanitizeText } from '../../../common/validators/safe-text.validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Nume de afișare' })
  @IsOptional()
  @Transform(({ value }) => sanitizeText(value))
  @SafeText()
  @IsString()
  @MaxLength(191)
  displayName?: string;

  @ApiPropertyOptional({ description: 'Adresă email' })
  @IsOptional()
  @Transform(({ value }) => sanitizeText(value))
  @SafeText()
  @IsEmail()
  @MaxLength(191)
  email?: string;

  @ApiPropertyOptional({ description: 'URL sau clasă icon pentru avatar' })
  @IsOptional()
  @Transform(({ value }) => sanitizeText(value))
  @SafeText()
  @IsString()
  @MaxLength(255)
  avatar?: string;
}
