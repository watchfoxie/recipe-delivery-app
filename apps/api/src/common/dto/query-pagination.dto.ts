import { HttpStatus } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString, Max, MaxLength, Min, ValidateIf } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class QueryPaginationDto {
  @ApiPropertyOptional({ description: 'Page number (1-indexed)', default: 1, minimum: 1, type: Number })
  @Type(() => Number)
  @IsInt({
    message: i18nValidationMessage('messages.ERROR.PAGE_TYPE_NUMBER'),
    context: { httpStatus: HttpStatus.BAD_REQUEST },
  })
  @Min(1, {
    message: i18nValidationMessage('messages.ERROR.INVALID_PAGE'),
    context: { httpStatus: HttpStatus.UNPROCESSABLE_ENTITY },
  })
  page = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 10, minimum: 1, maximum: 100, type: Number })
  @Type(() => Number)
  @IsInt({
    message: i18nValidationMessage('messages.ERROR.LIMIT_TYPE_NUMBER'),
    context: { httpStatus: HttpStatus.BAD_REQUEST },
  })
  @Min(1, {
    message: i18nValidationMessage('messages.ERROR.INVALID_LIMIT'),
    context: { httpStatus: HttpStatus.UNPROCESSABLE_ENTITY },
  })
  @Max(100, {
    message: i18nValidationMessage('messages.ERROR.INVALID_LIMIT'),
    context: { httpStatus: HttpStatus.UNPROCESSABLE_ENTITY },
  })
  limit = 10;

  @ApiPropertyOptional({
    description: 'Comma separated list of sort expressions (field:direction)',
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
  sort?: string;

  @ApiPropertyOptional({
    description: 'Comma separated list of filter expressions (field:operator:value)',
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
  filter?: string;
}
