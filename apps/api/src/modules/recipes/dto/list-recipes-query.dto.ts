import { HttpStatus } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MaxLength, Validate, ValidateIf } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { QueryPaginationDto } from '../../../common/dto/query-pagination.dto';
import { RECIPES_ALLOWED_SORT_FIELDS } from '../recipes-query.config';
import {
  RecipesFilterFormatValidator,
  RecipesFilterSchemaValidator,
  RecipesSortFieldValidator,
  RecipesSortFormatValidator,
} from '../validators/recipes-query.validators';

const SORTABLE_FIELDS_HINT = RECIPES_ALLOWED_SORT_FIELDS.join(', ');

export class ListRecipesQueryDto extends QueryPaginationDto {
  @ApiPropertyOptional({
    description:
      `Comma separated list of sort expressions (field:direction). Allowed fields: ${SORTABLE_FIELDS_HINT}.`,
    example: 'created_at:desc,title:asc',
    type: String,
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsString({
    message: i18nValidationMessage('messages.ERROR.SORT_TYPE_STRING'),
    context: { httpStatus: HttpStatus.BAD_REQUEST },
  })
  @MaxLength(255, {
    message: i18nValidationMessage('messages.ERROR.INVALID_SORT_FORMAT'),
    context: { httpStatus: HttpStatus.BAD_REQUEST },
  })
  @Validate(RecipesSortFormatValidator, {
    message: i18nValidationMessage('messages.ERROR.INVALID_SORT_FORMAT'),
    context: { httpStatus: HttpStatus.BAD_REQUEST },
  })
  @Validate(RecipesSortFieldValidator, {
    message: i18nValidationMessage('messages.ERROR.INVALID_SORT_FIELD'),
    context: { httpStatus: HttpStatus.UNPROCESSABLE_ENTITY },
  })
  override sort?: string;

  @ApiPropertyOptional({
    description:
      'Comma separated list of filters (field:operator:value). Supported operators: eq, ne, lt, gt, lte, gte, like, in. Use | as delimiter within IN values.',
    example: 'difficulty:eq:usor,total_time_min:lt:45',
    type: String,
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsString({
    message: i18nValidationMessage('messages.ERROR.FILTER_TYPE_STRING'),
    context: { httpStatus: HttpStatus.BAD_REQUEST },
  })
  @MaxLength(1024, {
    message: i18nValidationMessage('messages.ERROR.INVALID_FILTER_FORMAT'),
    context: { httpStatus: HttpStatus.BAD_REQUEST },
  })
  @Validate(RecipesFilterFormatValidator, {
    message: i18nValidationMessage('messages.ERROR.INVALID_FILTER_FORMAT'),
    context: { httpStatus: HttpStatus.BAD_REQUEST },
  })
  @Validate(RecipesFilterSchemaValidator, {
    message: i18nValidationMessage('messages.ERROR.INVALID_FILTER_VALUE'),
    context: { httpStatus: HttpStatus.UNPROCESSABLE_ENTITY },
  })
  override filter?: string;
}
