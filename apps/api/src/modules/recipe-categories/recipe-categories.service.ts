import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { RecipeCategory } from './entities/recipe-category.entity';
import { CreateRecipeCategoryDto, UpdateRecipeCategoryDto } from './dto';

@Injectable()
export class RecipeCategoriesService {
  constructor(
    @InjectRepository(RecipeCategory)
    private readonly recipeCategoryRepository: Repository<RecipeCategory>,
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

  async create(createDto: CreateRecipeCategoryDto): Promise<RecipeCategory> {
    const category = this.recipeCategoryRepository.create({
      ...createDto,
      slug: this.slugify(createDto.name),
    });
    return this.recipeCategoryRepository.save(category);
  }

  async findAll(): Promise<RecipeCategory[]> {
    return this.recipeCategoryRepository.find({
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async findByThematicCategory(thematicCategory: string): Promise<RecipeCategory[]> {
    return this.recipeCategoryRepository.find({
      where: { thematicCategory },
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<RecipeCategory> {
    const category = await this.recipeCategoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(
        this.i18n.t('messages.recipe_category.not_found', { args: { id } }),
      );
    }
    return category;
  }

  async findBySlug(slug: string): Promise<RecipeCategory> {
    const category = await this.recipeCategoryRepository.findOne({ where: { slug } });
    if (!category) {
      throw new NotFoundException(
        this.i18n.t('messages.recipe_category.not_found', { args: { slug } }),
      );
    }
    return category;
  }

  async update(id: number, updateDto: UpdateRecipeCategoryDto): Promise<RecipeCategory> {
    const category = await this.findOne(id);
    if (updateDto.name && updateDto.name !== category.name) {
      category.slug = this.slugify(updateDto.name);
    }
    Object.assign(category, updateDto);
    return this.recipeCategoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.recipeCategoryRepository.softRemove(category);
  }
}
