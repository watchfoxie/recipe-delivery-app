import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { plainToInstance } from 'class-transformer';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { ActiveUser } from '../auth/interfaces/active-user.interface';
import { ApiStandardResponses } from '../../common/swagger/swagger-responses.util';
import { translateMessage } from '../../common/utils/i18n.util';
import { RecipeResponseDto } from '../recipes/dto/recipe-response.dto';
import { ListRecipesQueryDto } from '../recipes/dto/list-recipes-query.dto';
import { FavoriteStatusResponseDto } from './dto/favorite-status-response.dto';

@ApiTags('Favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService, private readonly i18n: I18nService) {}

  @Post(':recipeId')
  @ApiStandardResponses(RecipeResponseDto)
  async add(
    @Param('recipeId', ParseIntPipe) recipeId: number,
    @CurrentUser() user: ActiveUser,
  ) {
    const recipe = await this.favoritesService.addToFavorites(user.userId, recipeId);
    return {
      message: await this.translate('messages.SUCCESS.FAVORITE_ADDED'),
      data: plainToInstance(RecipeResponseDto, recipe, { excludeExtraneousValues: true }),
    };
  }

  @Delete(':recipeId')
  @ApiStandardResponses()
  async remove(
    @Param('recipeId', ParseIntPipe) recipeId: number,
    @CurrentUser() user: ActiveUser,
  ) {
    await this.favoritesService.removeFromFavorites(user.userId, recipeId);
    return {
      message: await this.translate('messages.SUCCESS.FAVORITE_REMOVED'),
      data: null,
    };
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'filter', required: false, type: String })
  @ApiStandardResponses(RecipeResponseDto, { isPaginated: true })
  async list(@Query() query: ListRecipesQueryDto, @CurrentUser() user: ActiveUser) {
    const result = await this.favoritesService.listFavorites(user.userId, query);
    return {
      message: await this.translate('messages.SUCCESS.FAVORITE_LIST'),
      data: {
        items: result.items.map((recipe) =>
          plainToInstance(RecipeResponseDto, recipe, { excludeExtraneousValues: true }),
        ),
        page: result.page,
        limit: result.limit,
        total: result.total,
        sort: result.sort,
        filter: result.filter,
      },
    };
  }

  @Get(':recipeId/status')
  @ApiStandardResponses(FavoriteStatusResponseDto)
  async status(
    @Param('recipeId', ParseIntPipe) recipeId: number,
    @CurrentUser() user: ActiveUser,
  ) {
    const isFavorite = await this.favoritesService.isFavorite(user.userId, recipeId);
    return {
      message: await this.translate('messages.SUCCESS.FAVORITE_STATUS'),
      data: plainToInstance(
        FavoriteStatusResponseDto,
        { recipeId, isFavorite },
        { excludeExtraneousValues: true },
      ),
    };
  }

  private translate(key: string): Promise<string> {
    return translateMessage(this.i18n, key);
  }
}
