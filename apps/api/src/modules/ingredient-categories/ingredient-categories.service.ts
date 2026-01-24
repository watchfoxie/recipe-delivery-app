import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { IngredientCategory } from './entities/ingredient-category.entity';
import { CreateIngredientCategoryDto, UpdateIngredientCategoryDto } from './dto';

@Injectable()
export class IngredientCategoriesService {
  constructor(
    @InjectRepository(IngredientCategory)
    private readonly ingredientCategoryRepository: Repository<IngredientCategory>,
    private readonly i18n: I18nService,
  ) {}

  private slugify(text: string): string {
    return text
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(createDto: CreateIngredientCategoryDto): Promise<IngredientCategory> {
    const category = this.ingredientCategoryRepository.create({
      ...createDto,
      slug: this.slugify(createDto.name),
    });
    return this.ingredientCategoryRepository.save(category);
  }

  async findAll(): Promise<IngredientCategory[]> {
    return this.ingredientCategoryRepository.find({
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<IngredientCategory> {
    const category = await this.ingredientCategoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(
        this.i18n.t('messages.ingredient_category.not_found', { args: { id } }),
      );
    }
    return category;
  }

  async findBySlug(slug: string): Promise<IngredientCategory> {
    const category = await this.ingredientCategoryRepository.findOne({ where: { slug } });
    if (!category) {
      throw new NotFoundException(
        this.i18n.t('messages.ingredient_category.not_found', { args: { slug } }),
      );
    }
    return category;
  }

  async update(id: number, updateDto: UpdateIngredientCategoryDto): Promise<IngredientCategory> {
    const category = await this.findOne(id);
    if (updateDto.name && updateDto.name !== category.name) {
      category.slug = this.slugify(updateDto.name);
    }
    Object.assign(category, updateDto);
    return this.ingredientCategoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.ingredientCategoryRepository.softRemove(category);
  }
}
