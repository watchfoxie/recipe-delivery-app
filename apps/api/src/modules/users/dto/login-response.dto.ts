import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from './user-response.dto';

export class LoginResponseDto {
  @ApiProperty({ description: 'JSON Web Token for authenticated requests' })
  @Expose()
  token!: string;

  @ApiProperty({ type: () => UserResponseDto })
  @Expose()
  @Type(() => UserResponseDto)
  user!: UserResponseDto;
}
