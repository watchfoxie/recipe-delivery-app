import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiQuery, ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { I18nService } from 'nestjs-i18n';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ApiStandardResponses } from '../../common/swagger/swagger-responses.util';
import { translateMessage } from '../../common/utils/i18n.util';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { ListRecipesIngredientQueryDto } from './dto/list-recipes-ingredient-query.dto';
import { ListRecipesQueryDto } from './dto/list-recipes-query.dto';
import { RecipeResponseDto } from './dto/recipe-response.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipesService } from './recipes.service';

@ApiTags('Recipes')
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService, private readonly i18n: I18nService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Creare rețetă nouă' })
  @ApiStandardResponses(RecipeResponseDto)
  async create(@Body() dto: CreateRecipeDto, @CurrentUser() user: User) {
    const entity = await this.recipesService.create({ ...dto, authorId: user.id });
    return {
      message: await this.translate('messages.SUCCESS.RECIPE_CREATED'),
      data: plainToInstance(RecipeResponseDto, entity, { excludeExtraneousValues: true }),
    };
  }

  @Get()
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (must be a positive integer greater or equal to 1).',
    example: 1,
    schema: { minimum: 1 },
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of items to return per page (1-100).',
    example: 10,
    schema: { minimum: 1, maximum: 100 },
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    description:
      'Comma separated list of sort expressions (field:direction). Example: created_at:desc,title:asc.',
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    type: String,
    description:
      'Comma separated list of filters (field:operator:value). Use | as delimiter within IN expressions.',
  })
  @ApiStandardResponses(RecipeResponseDto, { isPaginated: true })
  async findAll(@Query() query: ListRecipesQueryDto) {
    const result = await this.recipesService.findAll(query);
    return {
      message: await this.translate('messages.SUCCESS.RECIPE_LIST'),
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

  @Get('ingredient')
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (must be a positive integer greater or equal to 1).',
    example: 1,
    schema: { minimum: 1 },
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of items to return per page (1-100).',
    example: 10,
    schema: { minimum: 1, maximum: 100 },
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    description:
      'Comma separated list of sort expressions (field:direction). Example: created_at:desc,title:asc.',
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    type: String,
    description:
      'Comma separated list of filters (field:operator:value). Use | as delimiter within IN expressions.',
  })
  @ApiStandardResponses(RecipeResponseDto, { isPaginated: true })
  async findAllByIngredient(@Query() query: ListRecipesIngredientQueryDto) {
    const result = await this.recipesService.findAllByIngredient(query);
    return {
      message: await this.translate('messages.SUCCESS.RECIPE_LIST'),
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

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Obține rețetele utilizatorului curent' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (must be a positive integer greater or equal to 1).',
    example: 1,
    schema: { minimum: 1 },
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of items to return per page (1-100).',
    example: 10,
    schema: { minimum: 1, maximum: 100 },
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    description:
      'Comma separated list of sort expressions (field:direction). Example: created_at:desc,title:asc.',
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    type: String,
    description:
      'Comma separated list of filters (field:operator:value). Use | as delimiter within IN expressions.',
  })
  @ApiStandardResponses(RecipeResponseDto, { isPaginated: true })
  async findAllByAuthor(@Query() query: ListRecipesQueryDto, @CurrentUser() user: User) {
    const result = await this.recipesService.findAllByAuthor(user.id, query);
    return {
      message: await this.translate('messages.SUCCESS.RECIPE_LIST'),
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

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Obține o rețetă după slug' })
  @ApiStandardResponses(RecipeResponseDto)
  async findBySlug(@Param('slug') slug: string) {
    const recipe = await this.recipesService.findBySlug(slug);
    return {
      message: await this.translate('messages.SUCCESS.RECIPE_FOUND'),
      data: plainToInstance(RecipeResponseDto, recipe, { excludeExtraneousValues: true }),
    };
  }

  @Get(':id')
  @ApiStandardResponses(RecipeResponseDto)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const recipe = await this.recipesService.findOne(id);
    return {
      message: await this.translate('messages.SUCCESS.RECIPE_FOUND'),
      data: plainToInstance(RecipeResponseDto, recipe, { excludeExtraneousValues: true }),
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Actualizare rețetă' })
  @ApiStandardResponses(RecipeResponseDto)
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRecipeDto, @CurrentUser() user: User) {
    const recipe = await this.recipesService.update(id, dto, user.id);
    return {
      message: await this.translate('messages.SUCCESS.RECIPE_UPDATED'),
      data: plainToInstance(RecipeResponseDto, recipe, { excludeExtraneousValues: true }),
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Ștergere rețetă' })
  @ApiStandardResponses()
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    await this.recipesService.remove(id, user.id);
    return {
      message: await this.translate('messages.SUCCESS.RECIPE_DELETED'),
      data: null,
    };
  }

  private translate(key: string): Promise<string> {
    return translateMessage(this.i18n, key);
  }
}