import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { I18nValidationPipe } from 'nestjs-i18n';
import { DataSource } from 'typeorm';
import { AppModule } from '@api/app/app.module';
import { APP_CONFIG } from '@api/common/config/app.config';
import { JsonParseExceptionFilter } from '@api/common/filters/json-parse-exception.filter';
import { I18nValidationExceptionFilter } from '@api/common/filters/i18n-validation-exception.filter';
import { HttpExceptionFilter } from '@api/common/filters/http-exception.filter';
import { LoggingInterceptor } from '@api/common/interceptors/logging.interceptor';
import { Recipe, RecipeDifficulty } from '@api/modules/recipes/entities/recipe.entity';
import { RecipeStep } from '@api/modules/recipes/entities/recipe-step.entity';
import { RecipeIngredient } from '@api/modules/recipes/entities/recipe-ingredient.entity';
import { Ingredient } from '@api/modules/ingredients/entities/ingredient.entity';
import { User } from '@api/modules/users/entities/user.entity';

export interface TestingAppContext {
  app: INestApplication;
  dataSource: DataSource;
}

export interface SeededData {
  user: User;
  ingredients: Ingredient[];
  recipe: Recipe;
}

export async function createTestingApp(): Promise<TestingAppContext> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new I18nValidationPipe({
      whitelist: APP_CONFIG.validation.whitelist,
      transform: APP_CONFIG.validation.transform,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new I18nValidationExceptionFilter(),
    new JsonParseExceptionFilter(),
  );

  app.useGlobalInterceptors(new LoggingInterceptor());

  const dataSource = app.get(DataSource);
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  await dataSource.runMigrations();

  await app.init();

  return { app, dataSource };
}

export async function resetDatabase(dataSource: DataSource): Promise<void> {
  const tables = dataSource.entityMetadatas
    .map((metadata) => metadata.tableName)
    .filter((tableName) => Boolean(tableName));

  if (!tables.length) {
    return;
  }

  await dataSource.query('SET FOREIGN_KEY_CHECKS=0;');
  try {
    for (const table of tables) {
      await dataSource.query(`TRUNCATE TABLE \`${table}\`;`);
    }
  } finally {
    await dataSource.query('SET FOREIGN_KEY_CHECKS=1;');
  }
}

export async function seedTestData(dataSource: DataSource): Promise<SeededData> {
  const userRepository = dataSource.getRepository(User);
  const ingredientRepository = dataSource.getRepository(Ingredient);
  const recipeRepository = dataSource.getRepository(Recipe);
  const stepRepository = dataSource.getRepository(RecipeStep);
  const recipeIngredientRepository = dataSource.getRepository(RecipeIngredient);

  const user = await userRepository.save(
    userRepository.create({
      email: 'e2e.user@example.com',
      passwordHash: 'hashed-password',
      displayName: 'E2E User',
    }),
  );

  const primaryIngredient = await ingredientRepository.save(
    ingredientRepository.create({
      name: 'E2E Ingredient 1',
      synonymsJson: ['primary'],
    }),
  );

  const secondaryIngredient = await ingredientRepository.save(
    ingredientRepository.create({
      name: 'E2E Ingredient 2',
      synonymsJson: ['secondary'],
    }),
  );

  const recipe = await recipeRepository.save(
    recipeRepository.create({
      slug: 'e2e-recipe',
      title: 'E2E Recipe',
      difficulty: RecipeDifficulty.EASY,
      totalTimeMin: 30,
      servings: 2,
      ratingAvg: 4.5,
      dietaryTagsJson: ['test'],
      description: 'Recipe used for e2e tests',
      authorId: user.id,
    }),
  );

  await stepRepository.save(
    stepRepository.create({
      recipeId: recipe.id,
      stepOrder: 1,
      text: 'Combine all ingredients.',
    }),
  );

  await recipeIngredientRepository.save(
    [
      recipeIngredientRepository.create({
        recipeId: recipe.id,
        ingredientId: primaryIngredient.id,
        quantity: 1,
        unit: 'unit',
      }),
      recipeIngredientRepository.create({
        recipeId: recipe.id,
        ingredientId: secondaryIngredient.id,
        quantity: 0.5,
        unit: 'unit',
      }),
    ],
  );

  return { user, ingredients: [primaryIngredient, secondaryIngredient], recipe };
}
