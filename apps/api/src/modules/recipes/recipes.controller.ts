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
import { ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { I18nService } from 'nestjs-i18n';
import { ApiStandardResponses } from '../../common/swagger/swagger-responses.util';
import { QueryPaginationDto } from '../../common/dto/query-pagination.dto';
import { translateMessage } from '../../common/utils/i18n.util';
import { CreateRecipeDto } from './dto/create-recipe.dto';
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
  @ApiStandardResponses(RecipeResponseDto, { isPaginated: true })
  async findAll(@Query() query: QueryPaginationDto) {
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