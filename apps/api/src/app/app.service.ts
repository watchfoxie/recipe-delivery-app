import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppInfoResponseDto } from './dto/app-info-response.dto';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getInfo(): AppInfoResponseDto {
    const environment = this.configService.get<string>('NODE_ENV') ?? 'development';
    const host = this.configService.get<string>('APP_HOST') ?? 'localhost';
    const port = Number(this.configService.get<string>('NEST_PORT') ?? '3001');
    const dbHost = this.configService.get<string>('DB_HOST') ?? null;

    return {
      status: 'ok',
      environment,
      host,
      port,
      dbHost,
      timestamp: new Date().toISOString(),
    };
  }
}
