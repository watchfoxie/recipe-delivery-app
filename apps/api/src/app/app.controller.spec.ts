import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;
  const mockConfigService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'NODE_ENV':
          return 'test';
        case 'APP_HOST':
          return 'api.test';
        case 'NEST_PORT':
          return '3005';
        case 'DB_HOST':
          return 'db.test';
        default:
          return undefined;
      }
    }),
  } satisfies Partial<ConfigService>;
  const mockI18nService = {
    translate: jest.fn().mockResolvedValue('translated-message'),
  } satisfies Partial<I18nService>;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: I18nService,
          useValue: mockI18nService,
        },
      ],
    }).compile();
  });

  describe('getData', () => {
    it('returns standardized response envelope', async () => {
      const appController = app.get<AppController>(AppController);
      const result = await appController.getData();

      expect(result.message).toBe('translated-message');
      expect(result.data).toMatchObject({
        status: 'ok',
        environment: 'test',
        host: 'api.test',
        port: 3005,
        dbHost: 'db.test',
      });
      expect(typeof result.data.timestamp).toBe('string');
    });
  });
});
