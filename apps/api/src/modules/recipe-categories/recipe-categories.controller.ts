import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { I18nParseIntPipe } from '../../common/pipes';
import { plainToInstance } from 'class-transformer';
import { I18nService } from 'nestjs-i18n';
import { ApiStandardResponses } from '../../common/swagger/swagger-responses.util';
import { RecipeCategoriesService } from './recipe-categories.service';
import {
  CreateRecipeCategoryDto,
  UpdateRecipeCategoryDto,
  RecipeCategoryResponseDto,
} from './dto';

@ApiTags('Recipe Categories')
@Controller('recipe-categories')
export class RecipeCategoriesController {
  constructor(
    private readonly recipeCategoriesService: RecipeCategoriesService,
    private readonly i18n: I18nService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Creare categorie rețetă' })
  @ApiStandardResponses(RecipeCategoryResponseDto)
  async create(@Body() createDto: CreateRecipeCategoryDto) {
    const category = await this.recipeCategoriesService.create(createDto);
    return {
      message: this.i18n.t('messages.recipe_category.created'),
      data: plainToInstance(RecipeCategoryResponseDto, category, { excludeExtraneousValues: true }),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listare categorii rețete' })
  @ApiQuery({ name: 'thematic', required: false, description: 'Filtrare după categoria tematică' })
  @ApiStandardResponses(RecipeCategoryResponseDto, { isArray: true })
  async findAll(@Query('thematic') thematic?: string) {
    const categories = thematic
      ? await this.recipeCategoriesService.findByThematicCategory(thematic)
      : await this.recipeCategoriesService.findAll();
    return {
      message: this.i18n.t('messages.recipe_category.list'),
      data: plainToInstance(RecipeCategoryResponseDto, categories, { excludeExtraneousValues: true }),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obținere categorie rețetă după ID' })
  @ApiStandardResponses(RecipeCategoryResponseDto)
  async findOne(@Param('id', I18nParseIntPipe) id: number) {
    const category = await this.recipeCategoriesService.findOne(id);
    return {
      message: this.i18n.t('messages.recipe_category.found'),
      data: plainToInstance(RecipeCategoryResponseDto, category, { excludeExtraneousValues: true }),
    };
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Obținere categorie rețetă după slug' })
  @ApiStandardResponses(RecipeCategoryResponseDto)
  async findBySlug(@Param('slug') slug: string) {
    const category = await this.recipeCategoriesService.findBySlug(slug);
    return {
      message: this.i18n.t('messages.recipe_category.found'),
      data: plainToInstance(RecipeCategoryResponseDto, category, { excludeExtraneousValues: true }),
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizare categorie rețetă' })
  @ApiStandardResponses(RecipeCategoryResponseDto)
  async update(
    @Param('id', I18nParseIntPipe) id: number,
    @Body() updateDto: UpdateRecipeCategoryDto,
  ) {
    const category = await this.recipeCategoriesService.update(id, updateDto);
    return {
      message: this.i18n.t('messages.recipe_category.updated'),
      data: plainToInstance(RecipeCategoryResponseDto, category, { excludeExtraneousValues: true }),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ștergere categorie rețetă' })
  @ApiStandardResponses()
  async remove(@Param('id', I18nParseIntPipe) id: number) {
    await this.recipeCategoriesService.remove(id);
    return {
      message: this.i18n.t('messages.recipe_category.deleted'),
      data: null,
    };
  }
}
