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
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { IngredientResponseDto } from './dto/ingredient-response.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { IngredientsService } from './ingredients.service';

@ApiTags('Ingredients')
@ApiStandardResponses(IngredientResponseDto)
@Controller('ingredients')
export class IngredientsController {
  constructor(
    private readonly ingredientsService: IngredientsService,
    private readonly i18n: I18nService,
  ) {}

  @Post()
  async create(@Body() dto: CreateIngredientDto) {
    const entity = await this.ingredientsService.create(dto);
    return {
      message: await this.translate('messages.INGREDIENTS.SUCCESS.CREATED'),
      data: plainToInstance(IngredientResponseDto, entity, { excludeExtraneousValues: true }),
    };
  }

  @Get()
  async findAll() {
    const entities = await this.ingredientsService.findAll();
    return {
      message: await this.translate('messages.INGREDIENTS.SUCCESS.LISTED'),
      data: entities.map((entity) =>
        plainToInstance(IngredientResponseDto, entity, { excludeExtraneousValues: true }),
      ),
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const entity = await this.ingredientsService.findOne(id);
    return {
      message: await this.translate('messages.INGREDIENTS.SUCCESS.FETCHED'),
      data: plainToInstance(IngredientResponseDto, entity, { excludeExtraneousValues: true }),
    };
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateIngredientDto) {
    const entity = await this.ingredientsService.update(id, dto);
    return {
      message: await this.translate('messages.INGREDIENTS.SUCCESS.UPDATED'),
      data: plainToInstance(IngredientResponseDto, entity, { excludeExtraneousValues: true }),
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.ingredientsService.remove(id);
    return {
      message: await this.translate('messages.INGREDIENTS.SUCCESS.DELETED'),
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