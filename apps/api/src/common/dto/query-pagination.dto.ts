import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class QueryPaginationDto {
  @ApiPropertyOptional({ description: 'Page number (1-indexed)', default: 1, minimum: 1, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('messages.ERROR.INVALID_PAGE') })
  @Min(1, { message: i18nValidationMessage('messages.ERROR.INVALID_PAGE') })
  page = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 10, minimum: 1, maximum: 100, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('messages.ERROR.INVALID_LIMIT') })
  @Min(1, { message: i18nValidationMessage('messages.ERROR.INVALID_LIMIT') })
  @Max(100, { message: i18nValidationMessage('messages.ERROR.INVALID_LIMIT') })
  limit = 10;

  @ApiPropertyOptional({
    description: 'Comma separated list of sort expressions (field:direction)',
    example: 'created_at:desc,title:asc',
    type: String,
  })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('messages.ERROR.INVALID_SORT_FORMAT') })
  @MaxLength(255, { message: i18nValidationMessage('messages.ERROR.INVALID_SORT_FORMAT') })
  sort?: string;

  @ApiPropertyOptional({
    description: 'Comma separated list of filter expressions (field:operator:value)',
    example: 'difficulty:eq:usor,total_time_min:lt:45',
    type: String,
  })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('messages.ERROR.INVALID_FILTER_FORMAT') })
  @MaxLength(1024, { message: i18nValidationMessage('messages.ERROR.INVALID_FILTER_FORMAT') })
  filter?: string;
}
