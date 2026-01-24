import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { ApiStandardResponses } from '../common/swagger/swagger-responses.util';
import { translateMessage } from '../common/utils/i18n.util';
import { AppService } from './app.service';
import { AppInfoResponseDto } from './dto/app-info-response.dto';

@ApiTags('App')
@ApiStandardResponses(AppInfoResponseDto)
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  async getData() {
    const data = this.appService.getInfo();
    const message = await this.translate('messages.SUCCESS.HELLO');
    return { message, data };
  }

  private translate(key: string): Promise<string> {
    return translateMessage(this.i18n, key);
  }
}
