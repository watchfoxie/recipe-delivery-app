import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { I18nValidationPipe } from 'nestjs-i18n';
import { AppModule } from './app/app.module';
import { APP_CONFIG } from './common/config/app.config';
import { JsonParseExceptionFilter } from './common/filters/json-parse-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.useGlobalPipes(
    new I18nValidationPipe({
      whitelist: APP_CONFIG.validation.whitelist,
      transform: APP_CONFIG.validation.transform,
      transformOptions: { enableImplicitConversion: false },
    }),
  );
  app.useGlobalFilters(new JsonParseExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  if (APP_CONFIG.server.environment !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(APP_CONFIG.swagger.title)
      .setDescription(APP_CONFIG.swagger.description)
      .setVersion(APP_CONFIG.swagger.version)
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(APP_CONFIG.swagger.path, app, document);
  }

  const port = APP_CONFIG.server.port;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  if (APP_CONFIG.server.environment !== 'production') {
    Logger.log(
      `📚 Swagger docs: http://localhost:${port}/${APP_CONFIG.swagger.path}`
    );
  }
}

bootstrap();
