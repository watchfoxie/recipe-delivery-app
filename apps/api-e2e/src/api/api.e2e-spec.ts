import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  createTestingApp,
  resetDatabase,
  seedTestData,
  SeededData,
} from '../support/testing-app';
import {
  buildCreateIngredientPayload,
  buildCreateRecipePayload,
  buildCreateUserPayload,
  buildRecipeListQuery,
} from '../support/fixtures';

async function authenticateUser(server: ReturnType<INestApplication['getHttpServer']>, fixtures: SeededData) {
  const response = await request(server)
    .post('/api/users/login')
    .set('Accept-Language', 'en')
    .send({ email: fixtures.user.email, password: fixtures.userPlainPassword });

  expect(response.status).toBe(200);
  return response.body.data.token as string;
}

describe('Recipe Delivery API e2e', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let server: ReturnType<INestApplication['getHttpServer']>;
  let fixtures: SeededData;

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
    fixtures = await seedTestData(dataSource);
  });

  describe('GET /api', () => {
    it('returns localized welcome message in English', async () => {
      const response = await request(server).get('/api').query({ lang: 'en' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Welcome to the Recipe Delivery API');
      expect(response.body.data).toMatchObject({
        status: 'ok',
        environment: expect.any(String),
        host: expect.any(String),
        port: expect.any(Number),
        timestamp: expect.any(String),
      });
    });

    it('returns localized welcome message in Romanian', async () => {
      const response = await request(server).get('/api').query({ lang: 'ro' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Bine ai venit la API-ul Recipe Delivery');
    });
  });

  describe('Error formatting', () => {
    it('normalizes validation errors with i18n messages', async () => {
      const response = await request(server)
        .post('/api/users')
        .query({ lang: 'en' })
        .send({ email: 'invalid@email' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('statusCode', 400);
      expect(Array.isArray(response.body.message)).toBe(true);
      expect(response.body.message[0]).toMatchObject({
        field: expect.any(String),
        message: expect.stringContaining('Validation failed'),
      });
    });

    it('normalizes JSON parse errors', async () => {
      const response = await request(server)
        .post('/api/users')
        .query({ lang: 'en' })
        .set('Content-Type', 'application/json')
        .send('{');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('statusCode', 400);
      expect(response.body.message[0]).toMatchObject({
        field: 'json_body',
        message: expect.stringContaining('invalid JSON'),
      });
    });
  });

  describe('Authentication', () => {
    it('authenticates a user and returns a JWT token', async () => {
      const response = await request(server)
        .post('/api/users/login')
        .set('Accept-Language', 'en')
        .send({ email: fixtures.user.email, password: fixtures.userPlainPassword });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Successful login');
      expect(response.body.data).toMatchObject({
        token: expect.any(String),
        user: expect.objectContaining({
          id: fixtures.user.id,
          email: fixtures.user.email,
        }),
      });
    });

    it('rejects invalid credentials with localized message', async () => {
      const response = await request(server)
        .post('/api/users/login')
        .set('Accept-Language', 'ro')
        .send({ email: fixtures.user.email, password: 'ParolaGresita!' });

      expect(response.status).toBe(401);
      expect(Array.isArray(response.body.message)).toBe(true);
      expect(response.body.message[0]).toMatchObject({
        field: 'general',
        message: 'Autentificare nereușită, încercați din nou',
      });
    });

    it('authenticates immediately after user registration', async () => {
      const payload = buildCreateUserPayload();

      const createResponse = await request(server)
        .post('/api/users')
        .set('Accept-Language', 'en')
        .send(payload);

      expect(createResponse.status).toBe(201);

      const loginResponse = await request(server)
        .post('/api/users/login')
        .set('Accept-Language', 'en')
        .send({ email: payload.email, password: payload.password });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.message).toBe('Successful login');
      expect(loginResponse.body.data.user.email).toBe(payload.email);
      expect(loginResponse.body.data.token).toEqual(expect.any(String));
    });
  });

  describe('Favorites', () => {
    it('rejects access without a JWT', async () => {
      const response = await request(server)
        .post(`/api/favorites/${fixtures.recipe.id}`)
        .set('Accept-Language', 'en');

      expect(response.status).toBe(401);
      expect(response.body.message[0]).toMatchObject({
        field: 'general',
        message: 'Authentication required',
      });
    });

    it('adds a favorite and lists it', async () => {
      const token = await authenticateUser(server, fixtures);

      const addResponse = await request(server)
        .post(`/api/favorites/${fixtures.recipe.id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept-Language', 'en');

      expect(addResponse.status).toBe(201);
      expect(addResponse.body.message).toBe('Recipe added to favorites');
      expect(addResponse.body.data).toMatchObject({ id: fixtures.recipe.id });

      const listResponse = await request(server)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${token}`)
        .query({ page: 1, limit: 5, sort: 'created_at:desc' });

      expect(listResponse.status).toBe(200);
      expect(listResponse.body.message).toBe('Favorite recipes retrieved successfully');
      const ids = listResponse.body.data.items.map((item: { id: number }) => item.id);
      expect(ids).toContain(fixtures.recipe.id);
    });

    it('removes a favorite idempotently', async () => {
      const token = await authenticateUser(server, fixtures);

      await request(server)
        .post(`/api/favorites/${fixtures.recipe.id}`)
        .set('Authorization', `Bearer ${token}`);

      const removeResponse = await request(server)
        .delete(`/api/favorites/${fixtures.recipe.id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept-Language', 'en');

      expect(removeResponse.status).toBe(200);
      expect(removeResponse.body.message).toBe('Recipe removed from favorites');

      const removeAgain = await request(server)
        .delete(`/api/favorites/${fixtures.recipe.id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept-Language', 'en');

      expect(removeAgain.status).toBe(200);
      expect(removeAgain.body.message).toBe('Recipe removed from favorites');
    });

    it('returns favorite status for a recipe', async () => {
      const token = await authenticateUser(server, fixtures);

      const statusBefore = await request(server)
        .get(`/api/favorites/${fixtures.recipe.id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept-Language', 'en');

      expect(statusBefore.status).toBe(200);
      expect(statusBefore.body.data.isFavorite).toBe(false);

      await request(server)
        .post(`/api/favorites/${fixtures.recipe.id}`)
        .set('Authorization', `Bearer ${token}`);

      const statusAfter = await request(server)
        .get(`/api/favorites/${fixtures.recipe.id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept-Language', 'en');

      expect(statusAfter.status).toBe(200);
      expect(statusAfter.body.data).toMatchObject({ recipeId: fixtures.recipe.id, isFavorite: true });
    });
  });

  describe('Comments', () => {
    it('rejects creating a comment without authentication', async () => {
      const response = await request(server)
        .post(`/api/recipes/${fixtures.recipe.id}/comments`)
        .set('Accept-Language', 'en')
        .send({ text: 'Nice recipe!' });

      expect(response.status).toBe(401);
      expect(Array.isArray(response.body.message)).toBe(true);
      expect(response.body.message[0]).toMatchObject({
        field: 'general',
        message: 'Authentication required',
      });
    });

    it('creates and lists comments for a recipe', async () => {
      const token = await authenticateUser(server, fixtures);

      const createResponse = await request(server)
        .post(`/api/recipes/${fixtures.recipe.id}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept-Language', 'en')
        .send({ text: 'Excellent!' });

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.message).toBe('Comment created successfully');
      expect(createResponse.body.data).toMatchObject({
        recipeId: fixtures.recipe.id,
        authorId: fixtures.user.id,
        text: 'Excellent!',
      });

      const listResponse = await request(server)
        .get(`/api/recipes/${fixtures.recipe.id}/comments`)
        .set('Accept-Language', 'en');

      expect(listResponse.status).toBe(200);
      expect(listResponse.body.message).toBe('Comments retrieved successfully');
      expect(Array.isArray(listResponse.body.data)).toBe(true);
      expect(listResponse.body.data.length).toBeGreaterThanOrEqual(1);
      expect(listResponse.body.data[0]).toMatchObject({ text: 'Excellent!' });

      const recipeDetail = await request(server)
        .get(`/api/recipes/${fixtures.recipe.id}`)
        .set('Accept-Language', 'en');

      expect(recipeDetail.status).toBe(200);
      expect(Array.isArray(recipeDetail.body.data.comments)).toBe(true);
      expect(recipeDetail.body.data.comments.length).toBeGreaterThanOrEqual(1);
      expect(recipeDetail.body.data.comments[0]).toMatchObject({ text: 'Excellent!' });
    });
  });

  describe('Pagination, sorting and filtering', () => {
    it('returns paginated response structure for recipes', async () => {
      const response = await request(server)
        .get('/api/recipes')
        .query(buildRecipeListQuery());

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Recipes retrieved successfully');

      const payload = response.body.data;
      expect(payload).toMatchObject({
        page: 1,
        limit: 5,
        total: expect.any(Number),
        sort: expect.any(Array),
        filter: expect.any(Array),
      });
      expect(Array.isArray(payload.items)).toBe(true);
      expect(payload.items.length).toBeGreaterThanOrEqual(1);
      expect(payload.items[0]).toHaveProperty('id', fixtures.recipe.id);

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

  describe('CRUD flows and domain invariants', () => {
    it('creates users and prevents duplicates', async () => {
      const payload = buildCreateUserPayload();

      const createResponse = await request(server)
        .post('/api/users')
        .query({ lang: 'en' })
        .send(payload);

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.message).toBe('User created successfully');
      expect(createResponse.body.data).toMatchObject({
        email: payload.email,
        displayName: payload.displayName,
      });

      const duplicateResponse = await request(server)
        .post('/api/users')
        .query({ lang: 'en' })
        .send(payload);

      expect(duplicateResponse.status).toBe(409);
      expect(duplicateResponse.body.message).toBe('A user with this email already exists');
    });

    it('creates ingredients and reports conflicts', async () => {
      const payload = buildCreateIngredientPayload();

      const createResponse = await request(server)
        .post('/api/ingredients')
        .query({ lang: 'en' })
        .send(payload);

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.message).toBe('Ingredient created successfully');
      expect(createResponse.body.data).toMatchObject({
        name: payload.name,
      });

      const conflictResponse = await request(server)
        .post('/api/ingredients')
        .query({ lang: 'en' })
        .send({ ...payload, synonyms: ['duplicate'] });

      expect(conflictResponse.status).toBe(409);
      expect(conflictResponse.body.message).toBe('An ingredient with this name already exists');
    });

    it('creates a recipe with steps and ingredients', async () => {
      const payload = buildCreateRecipePayload({
        authorId: fixtures.user.id,
        ingredientIds: fixtures.ingredients.map((ingredient) => ingredient.id),
      });

      const response = await request(server)
        .post('/api/recipes')
        .query({ lang: 'en' })
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Recipe created successfully');
      expect(response.body.data).toMatchObject({
        slug: payload.slug,
        title: payload.title,
        difficulty: payload.difficulty,
        servings: payload.servings,
      });
      expect(response.body.data.steps).toHaveLength(payload.steps?.length ?? 0);
      expect(response.body.data.recipeIngredients).toHaveLength(
        payload.ingredients?.length ?? 0,
      );

  const listQuery = buildRecipeListQuery();
  delete listQuery['filter'];

      const listResponse = await request(server)
        .get('/api/recipes')
        .query(listQuery);

      expect(listResponse.status).toBe(200);

      const slugs = listResponse.body.data.items.map((item: { slug: string }) => item.slug);
      expect(slugs).toContain(payload.slug);
    });
  });

  describe('Domain error responses', () => {
    it('returns 404 when recipe is missing', async () => {
      const response = await request(server)
        .get('/api/recipes/9999')
        .query({ lang: 'en' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('The requested recipe does not exist');
    });
  });
});
