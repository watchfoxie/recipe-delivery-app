import * as bcrypt from 'bcrypt';
import { readFile } from 'node:fs/promises';
import * as path from 'node:path';
import { QueryRunner } from 'typeorm';

import dataSource from './typeorm.datasource';

type SeedUser = {
  email: string;
  password: string;
  displayName: string;
  preferencesJson?: Record<string, unknown> | null;
};

type SeedIngredient = {
  ingredientCategoryId?: number | null;
  name: string;
  synonyms?: string[] | null;
};

type SeedRecipeStep = {
  stepOrder: number;
  text: string;
  timerSec?: number | null;
};

type SeedRecipeIngredient = {
  ingredientId: number;
  quantity?: number | null;
  unit?: string | null;
  note?: string | null;
};

type SeedRecipe = {
  slug: string;
  title: string;
  difficulty: 'usor' | 'mediu' | 'greu';
  totalTimeMin: number;
  servings: number;
  ratingAvg: number;
  dietaryTags?: string[] | null;
  description?: string | null;
  authorId: number;
  recipeCategoryId?: number | null;
  imageUrl?: string | null;
  steps: SeedRecipeStep[];
  ingredients: SeedRecipeIngredient[];
};

type SeedRecipeCategory = {
  id: number;
  subcategory: string;
  thematic_category: string;
};

type SeedIngredientCategory = {
  id: number;
  category: string;
};

type CategoriesConstitution = {
  ingredientCategoryId: SeedIngredientCategory[];
  recipeCategoryId: SeedRecipeCategory[];
};

const PASSWORD_SALT_ROUNDS = 12;
const FEEDS_DIR = path.join(__dirname, 'feed-schemas');
const CONSTITUTION_PATH = path.join(__dirname, '../../../../datastruct-constitution/categories-constitution.json');

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function serializeJson(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  return JSON.stringify(value);
}

function normalizeName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();
}

async function loadJsonFeed<T>(fileName: string): Promise<T> {
  const feedPath = path.join(FEEDS_DIR, fileName);
  const content = await readFile(feedPath, 'utf8');
  return JSON.parse(content) as T;
}

async function truncateTables(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
  await queryRunner.query('TRUNCATE TABLE review');
  await queryRunner.query('TRUNCATE TABLE user_favorite_recipe');
  await queryRunner.query('TRUNCATE TABLE recipe_comment');
  await queryRunner.query('TRUNCATE TABLE recipe_ingredient');
  await queryRunner.query('TRUNCATE TABLE recipe_step');
  await queryRunner.query('TRUNCATE TABLE recipe');
  await queryRunner.query('TRUNCATE TABLE ingredient');
  await queryRunner.query('TRUNCATE TABLE user');
  await queryRunner.query('TRUNCATE TABLE recipe_category');
  await queryRunner.query('TRUNCATE TABLE ingredient_category');
  await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
}

async function seedRecipeCategories(queryRunner: QueryRunner, categories: SeedRecipeCategory[]): Promise<void> {
  for (let idx = 0; idx < categories.length; idx++) {
    const cat = categories[idx];
    await queryRunner.manager.insert('recipe_category', {
      id: cat.id,
      name: cat.subcategory,
      slug: slugify(cat.subcategory),
      thematic_category: cat.thematic_category,
      display_order: idx + 1,
    });
  }
}

async function seedIngredientCategories(queryRunner: QueryRunner, categories: SeedIngredientCategory[]): Promise<void> {
  for (let idx = 0; idx < categories.length; idx++) {
    const cat = categories[idx];
    await queryRunner.manager.insert('ingredient_category', {
      id: cat.id,
      name: cat.category,
      slug: slugify(cat.category),
      display_order: idx + 1,
    });
  }
}

async function seedUsers(queryRunner: QueryRunner, users: SeedUser[]): Promise<void> {
  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, PASSWORD_SALT_ROUNDS);

    await queryRunner.manager.insert('user', {
      email: user.email.trim().toLowerCase(),
      password_hash: passwordHash,
      display_name: user.displayName,
      preferences_json: serializeJson(user.preferencesJson),
    });
  }
}

async function seedIngredients(queryRunner: QueryRunner, ingredients: SeedIngredient[]): Promise<Map<number, number>> {
  const seenNames = new Map<string, number>();
  const feedIdToActualId = new Map<number, number>();

  for (let idx = 0; idx < ingredients.length; idx += 1) {
    const ingredient = ingredients[idx];
    const normalizedName = normalizeName(ingredient.name);
    const feedId = idx + 1; // feed uses 1-based ids in recipe_ingredient references

    const existingId = seenNames.get(normalizedName);
    if (existingId) {
      console.warn(`Skipping duplicate ingredient by name (case-insensitive): ${ingredient.name}`);
      feedIdToActualId.set(feedId, existingId);
      continue;
    }

    const insertResult = await queryRunner.manager.insert('ingredient', {
      ingredient_category_id: ingredient.ingredientCategoryId ?? null,
      name: ingredient.name,
      synonyms_json: serializeJson(ingredient.synonyms),
    });

    const insertedId = getInsertedId(insertResult);
    seenNames.set(normalizedName, insertedId);
    feedIdToActualId.set(feedId, insertedId);
  }

  return feedIdToActualId;
}

function getInsertedId(result: { identifiers?: Array<Record<string, unknown>>; raw?: { insertId?: number } }): number {
  const identifier = result.identifiers?.[0]?.id;
  if (typeof identifier === 'number') {
    return identifier;
  }

  const rawId = (result.raw as { insertId?: number } | undefined)?.insertId;
  if (typeof rawId === 'number') {
    return rawId;
  }

  throw new Error('Unable to determine inserted id');
}

async function seedRecipes(queryRunner: QueryRunner, recipes: SeedRecipe[], ingredientIdMap: Map<number, number>): Promise<void> {
  for (const recipe of recipes) {
    if (!['usor', 'mediu', 'greu'].includes(recipe.difficulty)) {
      throw new Error(`Unsupported difficulty: ${recipe.difficulty}`);
    }

    const recipeInsertResult = await queryRunner.manager.insert('recipe', {
      slug: recipe.slug,
      title: recipe.title,
      difficulty: recipe.difficulty,
      total_time_min: recipe.totalTimeMin,
      servings: recipe.servings,
      rating_avg: recipe.ratingAvg,
      dietary_tags_json: serializeJson(recipe.dietaryTags),
      description: recipe.description ?? null,
      author_id: recipe.authorId,
      recipe_category_id: recipe.recipeCategoryId ?? null,
      image_url: recipe.imageUrl ?? null,
      likes_count: 0,
    });

    const recipeId = getInsertedId(recipeInsertResult);

    const stepsPayload = recipe.steps.map((step) => ({
      recipe_id: recipeId,
      step_order: step.stepOrder,
      text: step.text,
      timer_sec: step.timerSec ?? null,
    }));

    if (stepsPayload.length > 0) {
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into('recipe_step', ['recipe_id', 'step_order', 'text', 'timer_sec'])
        .values(stepsPayload)
        .execute();
    }

    const ingredientsPayload = recipe.ingredients.map((ri) => {
      const mappedIngredientId = ingredientIdMap.get(ri.ingredientId);
      if (!mappedIngredientId) {
        throw new Error(`Missing ingredient mapping for ingredientId ${ri.ingredientId} in recipe ${recipe.slug}`);
      }

      return {
        recipe_id: recipeId,
        ingredient_id: mappedIngredientId,
        quantity: ri.quantity ?? null,
        unit: ri.unit ?? null,
        note: ri.note ?? null,
      };
    });

    if (ingredientsPayload.length > 0) {
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into('recipe_ingredient', ['recipe_id', 'ingredient_id', 'quantity', 'unit', 'note'])
        .values(ingredientsPayload)
        .execute();
    }
  }
}

async function seed(): Promise<void> {
  console.log('Starting database seed for recipe_db...');

  if (!dataSource.isInitialized) {
    await dataSource.initialize();
    console.log('Data source initialized.');
  }

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    console.log('Loading feed files...');
    const [usersFeed, ingredientsFeed, recipesFeed, constitution] = await Promise.all([
      loadJsonFeed<SeedUser[]>('user-seed.json'),
      loadJsonFeed<SeedIngredient[]>('ingredients-seed.json'),
      loadJsonFeed<SeedRecipe[]>('recipes-seed.json'),
      readFile(CONSTITUTION_PATH, 'utf8').then((content) => JSON.parse(content) as CategoriesConstitution),
    ]);

    console.log('Truncating tables in dependency-safe order...');
    await truncateTables(queryRunner);

    console.log('Seeding data...');
    await queryRunner.startTransaction();

    await seedRecipeCategories(queryRunner, constitution.recipeCategoryId);
    await seedIngredientCategories(queryRunner, constitution.ingredientCategoryId);
    await seedUsers(queryRunner, usersFeed);
    const ingredientIdMap = await seedIngredients(queryRunner, ingredientsFeed);
    await seedRecipes(queryRunner, recipesFeed, ingredientIdMap);

    await queryRunner.commitTransaction();
    console.log('Seed completed successfully.');
  } catch (error) {
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    console.error('Seed failed, transaction rolled back.', error);
    throw error;
  } finally {
    await queryRunner.release();

    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('Data source connection closed.');
    }
  }
}

seed().catch((error) => {
  console.error('Unexpected error during seed execution:', error);
  process.exitCode = 1;
});
