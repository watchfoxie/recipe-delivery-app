import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserTheme } from '../entities/user.entity';

export class UpdateThemeDto {
  @ApiProperty({ enum: UserTheme, description: 'Tema preferată (light sau dark)' })
  @IsEnum(UserTheme)
  theme!: UserTheme;
}
