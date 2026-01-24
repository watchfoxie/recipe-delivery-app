import { IsString, IsOptional, IsEmail, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Nume de afișare' })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  displayName?: string;

  @ApiPropertyOptional({ description: 'Adresă email' })
  @IsOptional()
  @IsEmail()
  @MaxLength(191)
  email?: string;

  @ApiPropertyOptional({ description: 'URL sau clasă icon pentru avatar' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  avatar?: string;
}
