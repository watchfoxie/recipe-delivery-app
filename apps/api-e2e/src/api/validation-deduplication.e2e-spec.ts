import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  createTestingApp,
  resetDatabase,
} from '../support/testing-app';

describe('Validation Deduplication (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let server: ReturnType<INestApplication['getHttpServer']>;

  beforeAll(async () => {
    const context = await createTestingApp();
    app = context.app;
    dataSource = context.dataSource;
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    await resetDatabase(dataSource);
  });

  it('should deduplicate validation messages for the limit field in GET /api/recipes', async () => {
    const response = await request(server)
      .get('/api/recipes')
      .query({
        page: 1,
        limit: 'asd',
        sort: 'created_at:desc',
        filter: 'difficulty:eq:usor',
        lang: 'en'
      });

    expect(response.status).toBe(422);
    expect(response.body.error).toBe('Bad Request');
    
    const limitErrors = response.body.message.filter((m: any) => m.field === 'limit');
    
    // Expected messages:
    // 1. "Limit must be a number between 1 and 100" (from Min or Max)
    // 2. "Limit must be a numeric value" (from IsInt)
    
    expect(limitErrors).toHaveLength(2);
    expect(limitErrors).toContainEqual({
      field: 'limit',
      message: 'Limit must be a number between 1 and 100'
    });
    expect(limitErrors).toContainEqual({
      field: 'limit',
      message: 'Limit must be a numeric value'
    });
    
    // Verify no duplicates
    const messages = limitErrors.map((m: any) => m.message);
    const uniqueMessages = Array.from(new Set(messages));
    expect(messages.length).toBe(uniqueMessages.length);
  });
});
