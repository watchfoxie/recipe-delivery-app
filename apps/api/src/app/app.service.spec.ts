import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;
  const mockConfigService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'NODE_ENV':
          return 'test';
        case 'APP_HOST':
          return 'api.test';
        case 'NEST_PORT':
          return '4000';
        case 'DB_HOST':
          return 'db.test';
        default:
          return undefined;
      }
    }),
  } satisfies Partial<ConfigService>;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  describe('getInfo', () => {
    it('returns structured application information', () => {
      const result = service.getInfo();

      expect(result).toMatchObject({
        status: 'ok',
        environment: 'test',
        host: 'api.test',
        port: 4000,
        dbHost: 'db.test',
      });
      expect(new Date(result.timestamp).toString()).not.toBe('Invalid Date');
    });
  });
});
