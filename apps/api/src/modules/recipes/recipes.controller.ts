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
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { I18nService } from 'nestjs-i18n';
import { ApiStandardResponses } from '../../common/swagger/swagger-responses.util';
import { translateMessage } from '../../common/utils/i18n.util';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { ListRecipesQueryDto } from './dto/list-recipes-query.dto';
import { RecipeResponseDto } from './dto/recipe-response.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipesService } from './recipes.service';

@ApiTags('Recipes')
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService, private readonly i18n: I18nService) {}

  @Post()
  @ApiStandardResponses(RecipeResponseDto)
  async create(@Body() dto: CreateRecipeDto) {
    const entity = await this.recipesService.create(dto);
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
  @ApiStandardResponses(RecipeResponseDto)
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRecipeDto) {
    const recipe = await this.recipesService.update(id, dto);
    return {
      message: await this.translate('messages.SUCCESS.RECIPE_UPDATED'),
      data: plainToInstance(RecipeResponseDto, recipe, { excludeExtraneousValues: true }),
    };
  }

  @Delete(':id')
  @ApiStandardResponses()
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.recipesService.remove(id);
    return {
      message: await this.translate('messages.SUCCESS.RECIPE_DELETED'),
      data: null,
    };
  }

  private translate(key: string): Promise<string> {
    return translateMessage(this.i18n, key);
  }
}