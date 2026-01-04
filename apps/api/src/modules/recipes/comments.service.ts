import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { translateMessage } from '../../common/utils/i18n.util';
import { I18nService } from 'nestjs-i18n';
import { Comment } from './entities/recipe-comment.entity';
import { Recipe } from './entities/recipe.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(Recipe)
    private readonly recipesRepository: Repository<Recipe>,
    private readonly i18n: I18nService,
  ) {}

  async create(recipeId: number, authorId: number, text: string): Promise<Comment> {
    await this.ensureRecipeExists(recipeId);

    const entity = this.commentsRepository.create({
      recipeId,
      authorId,
      text,
    });

    const saved = await this.commentsRepository.save(entity);
    return this.commentsRepository.findOneOrFail({
      where: { id: saved.id },
      relations: { author: true },
      order: { createdAt: 'DESC' },
    });
  }

  async listForRecipe(recipeId: number): Promise<Comment[]> {
    await this.ensureRecipeExists(recipeId);

    return this.commentsRepository.find({
      where: { recipeId },
      relations: { author: true },
      order: { createdAt: 'DESC' },
    });
  }

  private async ensureRecipeExists(recipeId: number): Promise<void> {
    const exists = await this.recipesRepository.exist({ where: { id: recipeId } });
    if (!exists) {
      throw new NotFoundException(await translateMessage(this.i18n, 'messages.ERROR.RECIPE_NOT_FOUND'));
    }
  }
}
