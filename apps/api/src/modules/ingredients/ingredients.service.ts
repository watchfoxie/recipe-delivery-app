import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { Ingredient } from './entities/ingredient.entity';

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

  async findAll(): Promise<Ingredient[]> {
    return this.ingredientsRepository.find({ order: { createdAt: 'DESC' } });
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