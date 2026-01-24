import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { I18nService } from 'nestjs-i18n';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiStandardResponses } from '../../common/swagger/swagger-responses.util';
import { translateMessage } from '../../common/utils/i18n.util';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { IngredientResponseDto } from './dto/ingredient-response.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { IngredientsService } from './ingredients.service';

@ApiTags('Ingredients')
@Controller('ingredients')
export class IngredientsController {
  constructor(
    private readonly ingredientsService: IngredientsService,
    private readonly i18n: I18nService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Creare ingredient nou' })
  @ApiStandardResponses(IngredientResponseDto)
  async create(@Body() dto: CreateIngredientDto) {
    const entity = await this.ingredientsService.create(dto);
    return {
      message: await this.translate('messages.SUCCESS.INGREDIENT_CREATED'),
      data: plainToInstance(IngredientResponseDto, entity, { excludeExtraneousValues: true }),
    };
  }

  @Get()
  @ApiStandardResponses(IngredientResponseDto, { isArray: true })
  async findAll() {
    const entities = await this.ingredientsService.findAll();
    return {
      message: await this.translate('messages.SUCCESS.INGREDIENT_LIST'),
      data: entities.map((entity) =>
        plainToInstance(IngredientResponseDto, entity, { excludeExtraneousValues: true }),
      ),
    };
  }

  @Get(':id')
  @ApiStandardResponses(IngredientResponseDto)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const entity = await this.ingredientsService.findOne(id);
    return {
      message: await this.translate('messages.SUCCESS.INGREDIENT_FOUND'),
      data: plainToInstance(IngredientResponseDto, entity, { excludeExtraneousValues: true }),
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Actualizare ingredient' })
  @ApiStandardResponses(IngredientResponseDto)
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateIngredientDto) {
    const entity = await this.ingredientsService.update(id, dto);
    return {
      message: await this.translate('messages.SUCCESS.INGREDIENT_UPDATED'),
      data: plainToInstance(IngredientResponseDto, entity, { excludeExtraneousValues: true }),
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Ștergere ingredient' })
  @ApiStandardResponses()
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.ingredientsService.remove(id);
    return {
      message: await this.translate('messages.SUCCESS.INGREDIENT_DELETED'),
      data: null,
    };
  }

  private translate(key: string): Promise<string> {
    return translateMessage(this.i18n, key);
  }
}