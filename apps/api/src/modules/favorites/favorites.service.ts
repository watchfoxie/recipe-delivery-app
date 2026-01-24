import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { DataSource, EntityManager, IsNull, Repository } from 'typeorm';
import type { FilterOperator, SortDirection } from '../../common/utils/query-parser.util';
import { QueryParserUtil } from '../../common/utils/query-parser.util';
import { RECIPES_FILTER_MAPPING, RECIPES_SORT_MAPPING } from '../recipes/recipes-query.config';
import { ListRecipesQueryDto } from '../recipes/dto/list-recipes-query.dto';
import { UserFavoriteRecipe } from './entities/user-favorite-recipe.entity';
import { Recipe } from '../recipes/entities/recipe.entity';
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
export class FavoritesService {
  constructor(
    @InjectRepository(UserFavoriteRecipe)
    private readonly favoritesRepository: Repository<UserFavoriteRecipe>,
    @InjectRepository(Recipe)
    private readonly recipesRepository: Repository<Recipe>,
    private readonly dataSource: DataSource,
    private readonly i18n: I18nService,
  ) {}

  async addToFavorites(userId: number, recipeId: number): Promise<Recipe> {
    return this.executeInTransaction(async (manager) => {
      await this.ensureUserExists(manager, userId);
      await this.ensureRecipeExists(manager, recipeId);

      const existing = await manager.findOne(UserFavoriteRecipe, {
        where: { userId, recipeId },
        withDeleted: true,
      });

      if (existing) {
        if (existing.deletedAt) {
          existing.deletedAt = null;
          await manager.save(UserFavoriteRecipe, existing);
        }
        return this.findRecipeWithRelations(manager, recipeId);
      }

      await manager.save(UserFavoriteRecipe, manager.create(UserFavoriteRecipe, { userId, recipeId }));
      return this.findRecipeWithRelations(manager, recipeId);
    });
  }

  async removeFromFavorites(userId: number, recipeId: number): Promise<void> {
    await this.executeInTransaction(async (manager) => {
      const existing = await manager.findOne(UserFavoriteRecipe, {
        where: { userId, recipeId },
      });

      if (!existing) {
        return;
      }

      await manager.softRemove(UserFavoriteRecipe, existing);
    });
  }

  async isFavorite(userId: number, recipeId: number): Promise<boolean> {
    const count = await this.favoritesRepository.count({
      where: { userId, recipeId, deletedAt: IsNull() },
    });
    return count > 0;
  }

  async listFavorites(userId: number, query: ListRecipesQueryDto): Promise<PaginatedResult<Recipe>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const parsed = QueryParserUtil.parse(query, {
      sortMapping: RECIPES_SORT_MAPPING,
      filterMapping: RECIPES_FILTER_MAPPING,
    });

    const baseResponse = {
      page,
      limit,
      sort: parsed.sort.map(({ field, direction }) => ({ field, direction })),
      filter: parsed.filter.map(({ field, operator, value }) => ({ field, operator, value })),
    };

    const buildBaseQuery = () =>
      this.recipesRepository
        .createQueryBuilder('recipe')
        .innerJoin(
          UserFavoriteRecipe,
          'favorite',
          'favorite.recipe_id = recipe.id AND favorite.user_id = :userId AND favorite.deleted_at IS NULL',
          { userId },
        )
        .where('recipe.deleted_at IS NULL');

    const totalQuery = buildBaseQuery();
    QueryParserUtil.applyFilter(totalQuery, parsed.filter);
    const total = await totalQuery.getCount();

    const idQuery = buildBaseQuery().select('recipe.id', 'id');
    QueryParserUtil.applyFilter(idQuery, parsed.filter);

    if (parsed.sort.length) {
      QueryParserUtil.applySort(idQuery, parsed.sort);
    } else {
      idQuery.orderBy('favorite.created_at', 'DESC').addOrderBy('recipe.created_at', 'DESC');
    }

    const rows = await idQuery
      .skip((page - 1) * limit)
      .take(limit)
      .getRawMany<{ id: number }>();

    const recipeIds = rows
      .map((row) => (typeof row.id === 'string' ? Number(row.id) : row.id))
      .filter((value): value is number => Number.isFinite(value));

    let items: Recipe[] = [];
    if (recipeIds.length) {
      const options = this.buildRelationsOptions();
      const found = await this.recipesRepository.find({
        where: recipeIds.map((id) => ({ id })),
        relations: options.relations,
        order: options.order,
      });

      const lookup = new Map(found.map((recipe) => [recipe.id, recipe]));
      items = recipeIds
        .map((id) => lookup.get(id))
        .filter((recipe): recipe is Recipe => Boolean(recipe));
    }

    return {
      ...baseResponse,
      items,
      total,
    };
  }

  private async ensureUserExists(manager: EntityManager, userId: number) {
    const user = await manager.findOne(User, { where: { id: userId } });
    if (!user) {
      throw new NotFoundException(await this.translate('messages.ERROR.USER_NOT_FOUND'));
    }
  }

  private async ensureRecipeExists(manager: EntityManager, recipeId: number) {
    const recipe = await manager.findOne(Recipe, {
      where: { id: recipeId },
      withDeleted: true,
    });
    if (!recipe || recipe.deletedAt) {
      throw new NotFoundException(await this.translate('messages.ERROR.RECIPE_NOT_FOUND'));
    }
  }

  private async findRecipeWithRelations(manager: EntityManager, recipeId: number): Promise<Recipe> {
    const options = this.buildRelationsOptions();
    const recipe = await manager.findOne(Recipe, {
      where: { id: recipeId },
      relations: options.relations,
      order: options.order,
    });

    if (!recipe) {
      throw new NotFoundException(await this.translate('messages.ERROR.RECIPE_NOT_FOUND'));
    }

    return recipe;
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
    } as const;
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

  private async translate(key: string): Promise<string> {
    const ctx = I18nContext.current();
    return (await this.i18n.translate(key as Parameters<I18nService['translate']>[0], {
      lang: ctx?.lang,
    })) as unknown as string;
  }
}
