import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../../.env' });

describe('Recipe Delivery API contracts', () => {
  describe('GET /api', () => {
    it('returns localized welcome message in English', async () => {
  const res = await axios.get('/', { params: { lang: 'en' } });

      expect(res.status).toBe(200);
      expect(res.data.message).toBe('Welcome to the Recipe Delivery API');
      expect(res.data.data).toMatchObject({
        status: 'ok',
        environment: expect.any(String),
        host: expect.any(String),
        port: expect.any(Number),
        timestamp: expect.any(String),
      });
    });

    it('returns localized welcome message in Romanian', async () => {
  const res = await axios.get('/', { params: { lang: 'ro' } });

      expect(res.status).toBe(200);
      expect(res.data.message).toBe('Bine ai venit la API-ul Recipe Delivery');
    });
  });

  describe('Error formatting', () => {
    it('normalizes validation errors with i18n messages', async () => {
      const res = await axios.post(
        '/users',
        { email: 'invalid@email' },
        {
          params: { lang: 'en' },
          validateStatus: () => true,
        },
      );

      expect(res.status).toBe(400);
      expect(res.data).toHaveProperty('statusCode', 400);
      expect(res.data).toHaveProperty('error', 'Bad Request');
      expect(Array.isArray(res.data.message)).toBe(true);
      expect(res.data.message[0]).toMatchObject({
        field: expect.any(String),
        message: expect.stringContaining('Validation failed'),
      });
    });

    it('normalizes JSON parse errors', async () => {
      const res = await axios({
        method: 'post',
        url: '/users',
        data: '{',
        headers: { 'Content-Type': 'application/json' },
        params: { lang: 'en' },
        transformRequest: [(data) => data],
        validateStatus: () => true,
      });

      expect(res.status).toBe(400);
      expect(res.data).toHaveProperty('statusCode', 400);
      expect(res.data.message[0]).toMatchObject({
        field: 'json_body',
        message: expect.stringContaining('invalid JSON'),
      });
    });
  });

  describe('Pagination, sorting and filtering', () => {
    it('returns paginated response structure for recipes', async () => {
  const res = await axios.get('/recipes', {
        params: {
          lang: 'en',
          page: 1,
          limit: 5,
          sort: 'created_at:desc',
          filter: 'difficulty:eq:easy',
        },
      });

      expect(res.status).toBe(200);
      expect(res.data.message).toBe('Recipes retrieved successfully');

      const payload = res.data.data;
      expect(payload).toMatchObject({
        page: 1,
        limit: 5,
        total: expect.any(Number),
        sort: expect.any(Array),
        filter: expect.any(Array),
      });
      expect(Array.isArray(payload.items)).toBe(true);

      if (payload.sort.length) {
        expect(payload.sort).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ field: 'created_at', direction: 'DESC' }),
          ]),
        );
      }

      if (payload.filter.length) {
        expect(payload.filter).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ field: 'difficulty', operator: 'eq' }),
          ]),
        );
      }
    });
  });
});
