import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getData(): { message: string } {
    const dbHost = this.configService.get<string>('DB_HOST');
    return { message: `Hello API, DB_HOST: ${dbHost}` };
  }
}
