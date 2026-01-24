import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { Review } from './entities/review.entity';
import { Recipe } from '../recipes/entities/recipe.entity';
import { CreateReviewDto, UpdateReviewDto } from './dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
    private readonly i18n: I18nService,
  ) {}

  async create(recipeId: number, userId: number, createDto: CreateReviewDto): Promise<Review> {
    const recipe = await this.recipeRepository.findOne({ where: { id: recipeId } });
    if (!recipe) {
      throw new NotFoundException(this.i18n.t('messages.recipe.not_found', { args: { id: recipeId } }));
    }

    const existingReview = await this.reviewRepository.findOne({
      where: { recipeId, userId },
    });
    if (existingReview) {
      throw new ConflictException(this.i18n.t('messages.review.already_exists'));
    }

    const review = this.reviewRepository.create({
      ...createDto,
      recipeId,
      userId,
    });
    const savedReview = await this.reviewRepository.save(review);

    await this.updateRecipeRating(recipeId);

    return this.findOne(savedReview.id);
  }

  async findAllByRecipe(recipeId: number): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { recipeId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!review) {
      throw new NotFoundException(this.i18n.t('messages.review.not_found', { args: { id } }));
    }
    return review;
  }

  async findUserReviewForRecipe(recipeId: number, userId: number): Promise<Review | null> {
    return this.reviewRepository.findOne({
      where: { recipeId, userId },
      relations: ['user'],
    });
  }

  async update(id: number, userId: number, updateDto: UpdateReviewDto): Promise<Review> {
    const review = await this.reviewRepository.findOne({ where: { id, userId } });
    if (!review) {
      throw new NotFoundException(this.i18n.t('messages.review.not_found', { args: { id } }));
    }

    Object.assign(review, updateDto);
    await this.reviewRepository.save(review);

    await this.updateRecipeRating(review.recipeId);

    return this.findOne(id);
  }

  async remove(id: number, userId: number): Promise<void> {
    const review = await this.reviewRepository.findOne({ where: { id, userId } });
    if (!review) {
      throw new NotFoundException(this.i18n.t('messages.review.not_found', { args: { id } }));
    }

    const recipeId = review.recipeId;
    await this.reviewRepository.softRemove(review);

    await this.updateRecipeRating(recipeId);
  }

  private async updateRecipeRating(recipeId: number): Promise<void> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .where('review.recipe_id = :recipeId', { recipeId })
      .andWhere('review.deleted_at IS NULL')
      .getRawOne<{ avg: string | null }>();

    const avgRating = result?.avg ? parseFloat(result.avg) : 0;

    await this.recipeRepository.update(recipeId, { ratingAvg: avgRating });
  }

  async getAverageRating(recipeId: number): Promise<{ average: number; count: number }> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.recipe_id = :recipeId', { recipeId })
      .andWhere('review.deleted_at IS NULL')
      .getRawOne<{ avg: string | null; count: string }>();

    return {
      average: result?.avg ? parseFloat(result.avg) : 0,
      count: result?.count ? parseInt(result.count, 10) : 0,
    };
  }
}
