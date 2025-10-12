import {
  ConflictException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { DataSource, EntityManager, Repository } from 'typeorm';
import type { FilterOperator, SortDirection } from '../../common/utils/query-parser.util';
import { QueryPaginationDto } from '../../common/dto/query-pagination.dto';
import { QueryParserUtil } from '../../common/utils/query-parser.util';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { RecipeIngredientDto } from './dto/recipe-ingredient.dto';
import { RecipeStepDto } from './dto/recipe-step.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { Recipe, RecipeDifficulty } from './entities/recipe.entity';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';
import { RecipeStep } from './entities/recipe-step.entity';
import { User } from '../users/entities/user.entity';

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  sort: Array<{ field: string; direction: SortDirection }>;
  filter: Array<{
    field: string;
    operator: FilterOperator;
    value: string | number | boolean | Array<string | number | boolean>;
  }>;
}

@Injectable()
export class RecipesService {
  private readonly logger = new Logger(RecipesService.name);

  constructor(
    @InjectRepository(Recipe)
    private readonly recipesRepository: Repository<Recipe>,
    private readonly dataSource: DataSource,
    private readonly i18n: I18nService,
  ) {}

  async create(dto: CreateRecipeDto): Promise<Recipe> {
    return this.executeInTransaction(async (manager) => {
      await this.ensureAuthorExists(manager, dto.authorId);
      await this.ensureIngredientReferences(manager, dto.ingredients ?? []);

      const recipe = manager.create(Recipe, {
        slug: dto.slug,
        title: dto.title,
        difficulty: dto.difficulty ?? RecipeDifficulty.EASY,
        totalTimeMin: dto.totalTimeMin,
        servings: dto.servings,
        ratingAvg: dto.ratingAvg ?? 0,
        dietaryTagsJson: dto.dietaryTags ?? null,
        description: dto.description ?? null,
        authorId: dto.authorId,
        categoryId: dto.categoryId ?? null,
      });

      try {
        const saved = await manager.save(Recipe, recipe);

        if (dto.steps?.length) {
          await this.persistSteps(manager, saved.id, dto.steps);
        }

        if (dto.ingredients?.length) {
          await this.persistIngredients(manager, saved.id, dto.ingredients);
        }

        return this.findOneInternal(manager, saved.id);
      } catch (error) {
        await this.handleRecipeUniqueConstraint(error);
        throw error;
      }
    });
  }

  async findAll(query: QueryPaginationDto): Promise<PaginatedResult<Recipe>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const parsed = QueryParserUtil.parse(query, {
      sortMapping: {
        created_at: 'recipe.created_at',
        title: 'recipe.title',
        difficulty: 'recipe.difficulty',
        total_time_min: 'recipe.total_time_min',
        rating_avg: 'recipe.rating_avg',
      },
      filterMapping: {
        difficulty: {
          column: 'recipe.difficulty',
          type: 'string',
          enumValues: Object.values(RecipeDifficulty),
          allowedOperators: ['eq', 'ne', 'in'],
        },
        total_time_min: {
          column: 'recipe.total_time_min',
          type: 'number',
          allowedOperators: ['eq', 'ne', 'lt', 'gt', 'lte', 'gte', 'in'],
        },
        rating_avg: {
          column: 'recipe.rating_avg',
          type: 'number',
          allowedOperators: ['eq', 'ne', 'lt', 'gt', 'lte', 'gte'],
        },
        author_id: {
          column: 'recipe.author_id',
          type: 'number',
          allowedOperators: ['eq', 'in'],
        },
        category_id: {
          column: 'recipe.category_id',
          type: 'number',
          allowedOperators: ['eq', 'ne', 'in'],
        },
        title: {
          column: 'recipe.title',
          type: 'string',
          allowedOperators: ['like', 'eq', 'ne'],
        },
      },
    });

    const baseResponse = {
      page,
      limit,
      sort: parsed.sort.map(({ field, direction }) => ({ field, direction })),
      filter: parsed.filter.map(({ field, operator, value }) => ({ field, operator, value })),
    };

    try {
      const filteredQuery = this.recipesRepository
        .createQueryBuilder('recipe')
        .where('recipe.deleted_at IS NULL');

      QueryParserUtil.applyFilter(filteredQuery, parsed.filter);

      const total = await filteredQuery.clone().getCount();

      const dataQuery = filteredQuery
        .clone()
        .leftJoinAndSelect('recipe.steps', 'steps')
        .leftJoinAndSelect('recipe.recipeIngredients', 'recipeIngredients')
        .leftJoinAndSelect('recipeIngredients.ingredient', 'ingredient');

      if (parsed.sort.length) {
        QueryParserUtil.applySort(dataQuery, parsed.sort);
      } else {
        dataQuery.orderBy('recipe.created_at', 'DESC');
      }

      dataQuery.addOrderBy('steps.stepOrder', 'ASC');

      const items = await dataQuery
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      return {
        ...baseResponse,
        items,
        total,
      };
    } catch (error) {
      this.logger.warn(
        `Returning empty recipe list due to data access error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return {
        ...baseResponse,
        items: [],
        total: 0,
      };
    }
  }

  async findOne(id: number): Promise<Recipe> {
    const options = this.buildRelationsOptions();
    const recipe = await this.recipesRepository.findOne({
      where: { id },
      relations: options.relations,
      order: options.order,
    });
    if (!recipe) {
      throw new NotFoundException(await this.translate('messages.ERROR.RECIPE_NOT_FOUND'));
    }
    return recipe;
  }

  async update(id: number, dto: UpdateRecipeDto): Promise<Recipe> {
    return this.executeInTransaction(async (manager) => {
      const existing = await this.findOneInternal(manager, id);

      if (dto.authorId && dto.authorId !== existing.authorId) {
        await this.ensureAuthorExists(manager, dto.authorId);
      }

      if (dto.ingredients && dto.ingredients.length) {
        await this.ensureIngredientReferences(manager, dto.ingredients);
      }

      manager.merge(Recipe, existing, {
        ...dto,
        dietaryTagsJson: dto.dietaryTags ?? existing.dietaryTagsJson ?? null,
      });

      try {
        const updated = await manager.save(Recipe, existing);

        if (dto.steps) {
          await this.replaceSteps(manager, updated.id, dto.steps);
        }

        if (dto.ingredients) {
          await this.replaceIngredients(manager, updated.id, dto.ingredients);
        }

        return this.findOneInternal(manager, updated.id);
      } catch (error) {
        await this.handleRecipeUniqueConstraint(error);
        throw error;
      }
    });
  }

  async remove(id: number): Promise<void> {
    await this.executeInTransaction(async (manager) => {
      const existing = await this.findOneInternal(manager, id);
      await manager.softRemove(Recipe, existing);
    });
  }

  private async persistSteps(manager: EntityManager, recipeId: number, steps: RecipeStepDto[]) {
    const entities = steps.map((step) =>
      manager.create(RecipeStep, {
        recipeId,
        stepOrder: step.stepOrder,
        text: step.text,
        timerSec: step.timerSec ?? null,
      }),
    );
    await manager.save(RecipeStep, entities);
  }

  private async persistIngredients(
    manager: EntityManager,
    recipeId: number,
    ingredients: RecipeIngredientDto[],
  ) {
    const entities = ingredients.map((item) =>
      manager.create(RecipeIngredient, {
        recipeId,
        ingredientId: item.ingredientId,
        quantity: item.quantity ?? null,
        unit: item.unit ?? null,
        note: item.note ?? null,
      }),
    );

    try {
      await manager.save(RecipeIngredient, entities);
    } catch (error) {
      await this.handleIngredientUniqueConstraint(error);
      throw error;
    }
  }

  private async replaceSteps(manager: EntityManager, recipeId: number, steps: RecipeStepDto[]) {
    await manager.delete(RecipeStep, { recipeId });
    if (steps.length) {
      await this.persistSteps(manager, recipeId, steps);
    }
  }

  private async replaceIngredients(
    manager: EntityManager,
    recipeId: number,
    ingredients: RecipeIngredientDto[],
  ) {
    await manager.delete(RecipeIngredient, { recipeId });
    if (ingredients.length) {
      await this.persistIngredients(manager, recipeId, ingredients);
    }
  }

  private async ensureAuthorExists(manager: EntityManager, authorId: number) {
    const author = await manager.findOne(User, { where: { id: authorId } });
    if (!author) {
      throw new NotFoundException(await this.translate('messages.ERROR.USER_NOT_FOUND'));
    }
  }

  private async ensureIngredientReferences(
    manager: EntityManager,
    items: RecipeIngredientDto[],
  ) {
    if (!items.length) {
      return;
    }

    const ingredientIds = [...new Set(items.map((item) => item.ingredientId))];
    const found = await manager.find(Ingredient, {
      where: ingredientIds.map((id) => ({ id })),
    });

    if (found.length !== ingredientIds.length) {
      throw new NotFoundException(
        await this.translate('messages.ERROR.INGREDIENT_NOT_FOUND'),
      );
    }
  }

  private async findOneInternal(manager: EntityManager, id: number): Promise<Recipe> {
    const options = this.buildRelationsOptions();
    const entity = await manager.findOne(Recipe, {
      where: { id },
      relations: options.relations,
      order: options.order,
    });
    if (!entity) {
      throw new NotFoundException(await this.translate('messages.ERROR.RECIPE_NOT_FOUND'));
    }
    return entity;
  }

  private buildRelationsOptions() {
    return {
      relations: {
        steps: true,
        recipeIngredients: {
          ingredient: true,
        },
      },
      order: {
        createdAt: 'DESC' as const,
        steps: {
          stepOrder: 'ASC' as const,
        },
      },
    };
  }

  private async executeInTransaction<T>(work: (manager: EntityManager) => Promise<T>): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await work(queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async handleRecipeUniqueConstraint(error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'ER_DUP_ENTRY'
    ) {
      throw new ConflictException(await this.translate('messages.ERROR.RECIPE_SLUG_EXISTS'));
    }
  }

  private async handleIngredientUniqueConstraint(error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'ER_DUP_ENTRY'
    ) {
      throw new ConflictException(
        await this.translate('messages.ERROR.RECIPE_INGREDIENT_DUPLICATE'),
      );
    }
  }

  private async translate(key: string): Promise<string> {
    const ctx = I18nContext.current();
    return (await this.i18n.translate(key as Parameters<I18nService['translate']>[0], {
      lang: ctx?.lang,
    })) as unknown as string;
  }
}