import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { I18nParseIntPipe } from '../../common/pipes';
import { plainToInstance } from 'class-transformer';
import { I18nService } from 'nestjs-i18n';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ApiStandardResponses } from '../../common/swagger/swagger-responses.util';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto, ReviewResponseDto } from './dto';

@ApiTags('Reviews')
@Controller('recipes/:recipeId/reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly i18n: I18nService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Adăugare review la rețetă' })
  @ApiStandardResponses(ReviewResponseDto)
  async create(
    @Param('recipeId', I18nParseIntPipe) recipeId: number,
    @Body() createDto: CreateReviewDto,
    @CurrentUser() user: User,
  ) {
    const review = await this.reviewsService.create(recipeId, user.id, createDto);
    return {
      message: this.i18n.t('messages.review.created'),
      data: plainToInstance(ReviewResponseDto, review, { excludeExtraneousValues: true }),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listare review-uri ale rețetei' })
  @ApiStandardResponses(ReviewResponseDto, { isArray: true })
  async findAll(@Param('recipeId', I18nParseIntPipe) recipeId: number) {
    const reviews = await this.reviewsService.findAllByRecipe(recipeId);
    return {
      message: this.i18n.t('messages.review.list'),
      data: plainToInstance(ReviewResponseDto, reviews, { excludeExtraneousValues: true }),
    };
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Obținere review-ul propriu pentru rețetă' })
  @ApiStandardResponses(ReviewResponseDto)
  async findMyReview(
    @Param('recipeId', I18nParseIntPipe) recipeId: number,
    @CurrentUser() user: User,
  ) {
    const review = await this.reviewsService.findUserReviewForRecipe(recipeId, user.id);
    return {
      message: review
        ? this.i18n.t('messages.review.found')
        : this.i18n.t('messages.review.not_found_user'),
      data: review
        ? plainToInstance(ReviewResponseDto, review, { excludeExtraneousValues: true })
        : null,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistici rating pentru rețetă' })
  async getStats(@Param('recipeId', I18nParseIntPipe) recipeId: number) {
    const stats = await this.reviewsService.getAverageRating(recipeId);
    return {
      message: this.i18n.t('messages.review.stats'),
      data: stats,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Actualizare review propriu' })
  @ApiStandardResponses(ReviewResponseDto)
  async update(
    @Param('id', I18nParseIntPipe) id: number,
    @Body() updateDto: UpdateReviewDto,
    @CurrentUser() user: User,
  ) {
    const review = await this.reviewsService.update(id, user.id, updateDto);
    return {
      message: this.i18n.t('messages.review.updated'),
      data: plainToInstance(ReviewResponseDto, review, { excludeExtraneousValues: true }),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Ștergere review propriu' })
  @ApiStandardResponses()
  async remove(
    @Param('id', I18nParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    await this.reviewsService.remove(id, user.id);
    return {
      message: this.i18n.t('messages.review.deleted'),
      data: null,
    };
  }
}
