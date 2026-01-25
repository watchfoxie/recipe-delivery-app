import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { DataSource, EntityManager, Repository } from 'typeorm';
import type { FilterOperator, SortDirection } from '../../common/utils/query-parser.util';
import { QueryParserUtil } from '../../common/utils/query-parser.util';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { ListIngredientsQueryDto } from './dto/list-ingredients-query.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { Ingredient } from './entities/ingredient.entity';
import { INGREDIENTS_FILTER_MAPPING, INGREDIENTS_SORT_MAPPING } from './ingredients-query.config';

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
export class IngredientsService {
  constructor(
    @InjectRepository(Ingredient)
    private readonly ingredientsRepository: Repository<Ingredient>,
    private readonly dataSource: DataSource,
    private readonly i18n: I18nService,
  ) {}

  async create(dto: CreateIngredientDto): Promise<Ingredient> {
    return this.executeInTransaction(async (manager) => {
      const entity = manager.create(Ingredient, {
        ingredientCategoryId: dto.ingredientCategoryId ?? null,
        name: dto.name,
        synonymsJson: dto.synonyms ?? null,
      });

      try {
        return await manager.save(Ingredient, entity);
      } catch (error) {
        await this.handleUniqueConstraint(error, 'messages.ERROR.INGREDIENT_NAME_EXISTS');
        throw error;
      }
    });
  }

  async findAll(query: ListIngredientsQueryDto): Promise<PaginatedResult<Ingredient>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const parsed = QueryParserUtil.parse(query, {
      sortMapping: INGREDIENTS_SORT_MAPPING,
      filterMapping: INGREDIENTS_FILTER_MAPPING,
    });

    const baseResponse = {
      page,
      limit,
      sort: parsed.sort.map(({ field, direction }) => ({ field, direction })),
      filter: parsed.filter.map(({ field, operator, value }) => ({ field, operator, value })),
    };

    const buildBaseQuery = () =>
      this.ingredientsRepository
        .createQueryBuilder('ingredient')
        .where('ingredient.deleted_at IS NULL');

    const totalQuery = buildBaseQuery();
    QueryParserUtil.applyFilter(totalQuery, parsed.filter);
    const total = await totalQuery.getCount();

    const idQuery = buildBaseQuery().select('ingredient.id', 'id');
    QueryParserUtil.applyFilter(idQuery, parsed.filter);

    if (parsed.sort.length) {
      QueryParserUtil.applySort(idQuery, parsed.sort);
    } else {
      idQuery.orderBy('ingredient.created_at', 'DESC');
    }

    const rows = await idQuery
      .skip((page - 1) * limit)
      .take(limit)
      .getRawMany<{ id: number }>();

    const ingredientIds = rows
      .map((row) => (typeof row.id === 'string' ? Number(row.id) : row.id))
      .filter((value): value is number => Number.isFinite(value));

    let items: Ingredient[] = [];
    if (ingredientIds.length) {
      const found = await this.ingredientsRepository.find({
        where: ingredientIds.map((id) => ({ id })),
      });

      const lookup = new Map(found.map((ingredient) => [ingredient.id, ingredient]));
      items = ingredientIds
        .map((id) => lookup.get(id))
        .filter((ingredient): ingredient is Ingredient => Boolean(ingredient));
    }

    return {
      ...baseResponse,
      items,
      total,
    };
  }

  async findOne(id: number): Promise<Ingredient> {
    const entity = await this.ingredientsRepository.findOne({ where: { id } });
      if (!entity) {
        throw new NotFoundException(await this.translate('messages.ERROR.INGREDIENT_NOT_FOUND'));
    }
    return entity;
  }

  async update(id: number, dto: UpdateIngredientDto): Promise<Ingredient> {
    return this.executeInTransaction(async (manager) => {
      const existing = await manager.findOne(Ingredient, { where: { id } });
        if (!existing) {
          throw new NotFoundException(await this.translate('messages.ERROR.INGREDIENT_NOT_FOUND'));
      }

      manager.merge(Ingredient, existing, {
        ...dto,
        synonymsJson: dto.synonyms ?? existing.synonymsJson ?? null,
      });

      try {
        return await manager.save(Ingredient, existing);
      } catch (error) {
          await this.handleUniqueConstraint(error, 'messages.ERROR.INGREDIENT_NAME_EXISTS');
        throw error;
      }
    });
  }

  async remove(id: number): Promise<void> {
    await this.executeInTransaction(async (manager) => {
      const existing = await manager.findOne(Ingredient, { where: { id } });
        if (!existing) {
          throw new NotFoundException(await this.translate('messages.ERROR.INGREDIENT_NOT_FOUND'));
      }

      await manager.softRemove(Ingredient, existing);
    });
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

  private async handleUniqueConstraint(error: unknown, messageKey: string) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'ER_DUP_ENTRY'
    ) {
      throw new ConflictException(await this.translate(messageKey));
    }
  }

  private async translate(key: string): Promise<string> {
    const ctx = I18nContext.current();
    return (await this.i18n.translate(key as Parameters<I18nService['translate']>[0], {
      lang: ctx?.lang,
    })) as unknown as string;
  }
}