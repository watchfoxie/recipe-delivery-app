import { HttpStatus } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MaxLength, Validate, ValidateIf } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { QueryPaginationDto } from '../../../common/dto/query-pagination.dto';
import { INGREDIENTS_ALLOWED_SORT_FIELDS } from '../ingredients-query.config';
import {
  IngredientsFilterFormatValidator,
  IngredientsFilterSchemaValidator,
  IngredientsSortFieldValidator,
  IngredientsSortFormatValidator,
} from '../validators/ingredients-query.validators';

const SORTABLE_FIELDS_HINT = INGREDIENTS_ALLOWED_SORT_FIELDS.join(', ');

export class ListIngredientsQueryDto extends QueryPaginationDto {
  @ApiPropertyOptional({
    description:
      `Comma separated list of sort expressions (field:direction). Allowed fields: ${SORTABLE_FIELDS_HINT}.`,
    example: 'created_at:desc,name:asc',
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
  @Validate(IngredientsSortFormatValidator, {
    message: i18nValidationMessage('messages.ERROR.INVALID_SORT_FORMAT'),
    context: { httpStatus: HttpStatus.BAD_REQUEST },
  })
  @Validate(IngredientsSortFieldValidator, {
    message: i18nValidationMessage('messages.ERROR.INVALID_SORT_FIELD'),
    context: { httpStatus: HttpStatus.UNPROCESSABLE_ENTITY },
  })
  override sort?: string;

  @ApiPropertyOptional({
    description:
      'Comma separated list of filters (field:operator:value). Supported operators: eq, ne, lt, gt, lte, gte, like, in. Use | as delimiter within IN values.',
    example: 'ingredient_category_id:eq:4,name:like:lapte',
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
  @Validate(IngredientsFilterFormatValidator, {
    message: i18nValidationMessage('messages.ERROR.INVALID_FILTER_FORMAT'),
    context: { httpStatus: HttpStatus.BAD_REQUEST },
  })
  @Validate(IngredientsFilterSchemaValidator, {
    message: i18nValidationMessage('messages.ERROR.INVALID_FILTER_VALUE'),
    context: { httpStatus: HttpStatus.UNPROCESSABLE_ENTITY },
  })
  override filter?: string;
}
