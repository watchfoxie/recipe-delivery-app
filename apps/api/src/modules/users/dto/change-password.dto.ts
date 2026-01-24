import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Parola curentă' })
  @IsString()
  @MinLength(1)
  currentPassword!: string;

  @ApiProperty({ description: 'Noua parolă', minLength: 6 })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  newPassword!: string;
}
