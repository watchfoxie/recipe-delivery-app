import { ApiProperty } from '@nestjs/swagger';

export class AppInfoResponseDto {
  @ApiProperty({ example: 'ok' })
  status!: string;

  @ApiProperty({ example: 'development' })
  environment!: string;

  @ApiProperty({ example: 'localhost' })
  host!: string;

  @ApiProperty({ example: 3001 })
  port!: number;

  @ApiProperty({ example: 'localhost' })
  dbHost!: string | null;

  @ApiProperty({ example: '2024-01-01T12:00:00.000Z' })
  timestamp!: string;
}