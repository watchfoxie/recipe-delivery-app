import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty()
  @Expose()
  id!: number;

  @ApiProperty()
  @Expose()
  email!: string;

  @ApiProperty()
  @Expose()
  displayName!: string;

  @ApiProperty({ required: false, type: Object })
  @Expose()
  preferencesJson?: Record<string, unknown> | null;

  @ApiProperty()
  @Expose()
  createdAt!: Date;

  @ApiProperty()
  @Expose()
  updatedAt!: Date;
}