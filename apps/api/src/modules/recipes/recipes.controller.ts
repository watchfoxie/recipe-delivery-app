import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { ApiStandardResponses } from '../../common/swagger/swagger-responses.util';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { RecipeResponseDto } from './dto/recipe-response.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipesService } from './recipes.service';

@ApiTags('Recipes')
@ApiStandardResponses(RecipeResponseDto)
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService, private readonly i18n: I18nService) {}

  @Post()
  async create(@Body() dto: CreateRecipeDto) {
    const entity = await this.recipesService.create(dto);
    return {
      message: await this.translate('messages.RECIPES.SUCCESS.CREATED'),
      data: plainToInstance(RecipeResponseDto, entity, { excludeExtraneousValues: true }),
    };
  }

  @Get()
  async findAll() {
    const recipes = await this.recipesService.findAll();
    return {
      message: await this.translate('messages.RECIPES.SUCCESS.LISTED'),
      data: recipes.map((recipe) =>
        plainToInstance(RecipeResponseDto, recipe, { excludeExtraneousValues: true }),
      ),
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const recipe = await this.recipesService.findOne(id);
    return {
      message: await this.translate('messages.RECIPES.SUCCESS.FETCHED'),
      data: plainToInstance(RecipeResponseDto, recipe, { excludeExtraneousValues: true }),
    };
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRecipeDto) {
    const recipe = await this.recipesService.update(id, dto);
    return {
      message: await this.translate('messages.RECIPES.SUCCESS.UPDATED'),
      data: plainToInstance(RecipeResponseDto, recipe, { excludeExtraneousValues: true }),
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.recipesService.remove(id);
    return {
      message: await this.translate('messages.RECIPES.SUCCESS.DELETED'),
      data: null,
    };
  }

  private async translate(key: string): Promise<string> {
    const ctx = I18nContext.current();
    return (await this.i18n.translate(key as Parameters<I18nService['translate']>[0], {
      lang: ctx?.lang,
    })) as unknown as string;
  }
}