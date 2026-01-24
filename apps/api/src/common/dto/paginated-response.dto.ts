import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import type { FilterOperator, SortDirection } from '../utils/query-parser.util';
import { FILTER_OPERATORS } from '../utils/query-parser.util';

export class AppliedSortDto {
  @ApiProperty({ example: 'created_at' })
  field!: string;

  @ApiProperty({ enum: ['ASC', 'DESC'], example: 'DESC' })
  direction!: SortDirection;
}

export class AppliedFilterDto {
  @ApiProperty({ example: 'difficulty' })
  field!: string;

  @ApiProperty({ enum: FILTER_OPERATORS, example: 'eq' })
  operator!: FilterOperator;

  @ApiProperty({
    oneOf: [
      { type: 'string' },
      { type: 'number' },
      { type: 'boolean' },
      { type: 'array', items: { type: 'string' } },
      { type: 'array', items: { type: 'number' } },
      { type: 'array', items: { type: 'boolean' } },
    ],
  })
  value!: string | number | boolean | Array<string | number | boolean>;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createPaginatedResponseDto<TModel extends Type<unknown>>(model: TModel) {
  class PaginatedResponseDto {
    @ApiProperty({ type: () => model, isArray: true })
    items!: InstanceType<TModel>[];

    @ApiProperty({ example: 1 })
    page!: number;

    @ApiProperty({ example: 10 })
    limit!: number;

    @ApiProperty({ example: 125 })
    total!: number;

    @ApiProperty({ type: () => AppliedSortDto, isArray: true })
    sort!: AppliedSortDto[];

    @ApiProperty({ type: () => AppliedFilterDto, isArray: true })
    filter!: AppliedFilterDto[];
  }

  return PaginatedResponseDto;
}
