import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { I18nService } from 'nestjs-i18n';
import { ApiStandardResponses } from '../../common/swagger/swagger-responses.util';
import { IngredientCategoriesService } from './ingredient-categories.service';
import {
  CreateIngredientCategoryDto,
  UpdateIngredientCategoryDto,
  IngredientCategoryResponseDto,
} from './dto';

@ApiTags('Ingredient Categories')
@Controller('ingredient-categories')
export class IngredientCategoriesController {
  constructor(
    private readonly ingredientCategoriesService: IngredientCategoriesService,
    private readonly i18n: I18nService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Creare categorie ingredient' })
  @ApiStandardResponses(IngredientCategoryResponseDto)
  async create(@Body() createDto: CreateIngredientCategoryDto) {
    const category = await this.ingredientCategoriesService.create(createDto);
    return {
      message: this.i18n.t('messages.ingredient_category.created'),
      data: plainToInstance(IngredientCategoryResponseDto, category, { excludeExtraneousValues: true }),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listare categorii ingrediente' })
  @ApiStandardResponses(IngredientCategoryResponseDto, { isArray: true })
  async findAll() {
    const categories = await this.ingredientCategoriesService.findAll();
    return {
      message: this.i18n.t('messages.ingredient_category.list'),
      data: plainToInstance(IngredientCategoryResponseDto, categories, { excludeExtraneousValues: true }),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obținere categorie ingredient după ID' })
  @ApiStandardResponses(IngredientCategoryResponseDto)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const category = await this.ingredientCategoriesService.findOne(id);
    return {
      message: this.i18n.t('messages.ingredient_category.found'),
      data: plainToInstance(IngredientCategoryResponseDto, category, { excludeExtraneousValues: true }),
    };
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Obținere categorie ingredient după slug' })
  @ApiStandardResponses(IngredientCategoryResponseDto)
  async findBySlug(@Param('slug') slug: string) {
    const category = await this.ingredientCategoriesService.findBySlug(slug);
    return {
      message: this.i18n.t('messages.ingredient_category.found'),
      data: plainToInstance(IngredientCategoryResponseDto, category, { excludeExtraneousValues: true }),
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizare categorie ingredient' })
  @ApiStandardResponses(IngredientCategoryResponseDto)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateIngredientCategoryDto,
  ) {
    const category = await this.ingredientCategoriesService.update(id, updateDto);
    return {
      message: this.i18n.t('messages.ingredient_category.updated'),
      data: plainToInstance(IngredientCategoryResponseDto, category, { excludeExtraneousValues: true }),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ștergere categorie ingredient' })
  @ApiStandardResponses()
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.ingredientCategoriesService.remove(id);
    return {
      message: this.i18n.t('messages.ingredient_category.deleted'),
      data: null,
    };
  }
}
