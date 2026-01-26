import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SafeText } from '../../../common/validators/safe-text.validator';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Parola curentă' })
  @SafeText({ allowHtml: true, allowSqlMeta: true })
  @IsString()
  @MinLength(1)
  currentPassword!: string;

  @ApiProperty({ description: 'Noua parolă', minLength: 6 })
  @SafeText({ allowHtml: true, allowSqlMeta: true })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  newPassword!: string;
}
