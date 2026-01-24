import { RecipeDifficulty } from '@api/modules/recipes/entities/recipe.entity';
import type { CreateIngredientDto } from '@api/modules/ingredients/dto/create-ingredient.dto';
import type { CreateRecipeDto } from '@api/modules/recipes/dto/create-recipe.dto';
import type { RecipeIngredientDto } from '@api/modules/recipes/dto/recipe-ingredient.dto';
import type { RecipeStepDto } from '@api/modules/recipes/dto/recipe-step.dto';
import type { CreateUserDto } from '@api/modules/users/dto/create-user.dto';

let uniqueCounter = 0;

function uniqueSuffix(): string {
  uniqueCounter += 1;
  return `${Date.now().toString(36)}${uniqueCounter.toString(36)}`;
}

export function buildCreateUserPayload(
  overrides: Partial<CreateUserDto> = {},
): CreateUserDto {
  const base: CreateUserDto = {
    email: `e2e-user-${uniqueSuffix()}@example.com`,
    password: 'Str0ngPassw0rd!',
    displayName: 'E2E User',
  };

  return { ...base, ...overrides };
}

export function buildCreateIngredientPayload(
  overrides: Partial<CreateIngredientDto> = {},
): CreateIngredientDto {
  const base: CreateIngredientDto = {
    name: `E2E Ingredient ${uniqueSuffix()}`,
    synonyms: ['fresh', 'seasonal'],
  };

  return { ...base, ...overrides };
}

interface CreateRecipePayloadOptions {
  authorId: number;
  ingredientIds: number[];
  overrides?: Partial<CreateRecipeDto>;
}

export function buildCreateRecipePayload({
  authorId,
  ingredientIds,
  overrides,
}: CreateRecipePayloadOptions): CreateRecipeDto {
  const suffix = uniqueSuffix();

  const steps: RecipeStepDto[] = [
    {
      stepOrder: 1,
      text: 'Prepare all ingredients.',
    },
    {
      stepOrder: 2,
      text: 'Cook ingredients according to instructions.',
    },
  ];

  const recipeIngredients: RecipeIngredientDto[] = ingredientIds.map((ingredientId, index) => ({
    ingredientId,
    quantity: index + 1,
    unit: 'unit',
    note: index === 0 ? 'primary' : null,
  }));

  const base: CreateRecipeDto = {
    slug: `e2e-recipe-${suffix}`,
    title: `E2E Recipe ${suffix}`,
    difficulty: RecipeDifficulty.EASY,
    totalTimeMin: 25,
    servings: 2,
    ratingAvg: 4.5,
    dietaryTags: ['test'],
    description: 'E2E recipe created via automated test.',
    authorId,
    steps,
    ingredients: recipeIngredients,
  };

  return {
    ...base,
    ...overrides,
    steps: overrides?.steps ?? base.steps,
    ingredients: overrides?.ingredients ?? base.ingredients,
  };
}

export function buildRecipeListQuery(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    lang: 'en',
    page: 1,
    limit: 5,
    sort: 'created_at:desc',
    filter: 'difficulty:eq:usor',
    ...overrides,
  };
}
