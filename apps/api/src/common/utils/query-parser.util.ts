import { BadRequestException } from '@nestjs/common';
import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { I18nContext } from 'nestjs-i18n';

export const FILTER_OPERATORS = ['eq', 'ne', 'lt', 'gt', 'lte', 'gte', 'like', 'in'] as const;
const ALLOWED_OPERATORS = FILTER_OPERATORS;

export type FilterOperator = (typeof FILTER_OPERATORS)[number];

export type SortDirection = 'ASC' | 'DESC';

export interface SortFieldDescriptor {
  field: string;
  column: string;
  direction: SortDirection;
}

export interface FilterConditionDescriptor {
  field: string;
  column: string;
  operator: FilterOperator;
  value: string | number | boolean | Array<string | number | boolean>;
  rawValue: string;
}

export interface ParsedQueryDescriptor {
  sort: SortFieldDescriptor[];
  filter: FilterConditionDescriptor[];
}

type FieldDefinition = string | QueryFieldConfig;

export interface QueryFieldConfig {
  column: string;
  type?: 'string' | 'number' | 'boolean';
  allowedOperators?: FilterOperator[];
  enumValues?: string[];
}

export interface QueryParserOptions {
  sortMapping?: Record<string, FieldDefinition>;
  filterMapping?: Record<string, FieldDefinition>;
}

const FALLBACK_MESSAGES: Record<string, string> = {
  'messages.ERROR.INVALID_SORT_FORMAT': 'Sort parameter must follow the format field:direction',
  'messages.ERROR.INVALID_SORT_FIELD': 'Sorting by the requested field is not allowed',
  'messages.ERROR.INVALID_SORT_DIRECTION': 'Sorting direction must be either asc or desc',
  'messages.ERROR.INVALID_FILTER_FORMAT': 'Filter parameter must follow the format field:operator:value',
  'messages.ERROR.INVALID_FILTER_FIELD': 'Filtering by the requested field is not allowed',
  'messages.ERROR.INVALID_FILTER_OPERATOR': 'The provided filter operator is not supported',
  'messages.ERROR.INVALID_FILTER_VALUE': 'The filter value provided is invalid',
};

export class QueryParserUtil {
  static parse(query: { sort?: string; filter?: string }, options?: QueryParserOptions): ParsedQueryDescriptor {
    const sort = this.parseSort(query.sort, options?.sortMapping);
    const filter = this.parseFilter(query.filter, options?.filterMapping);
    return { sort, filter };
  }

  static parseSort(sortValue: string | undefined, mapping?: Record<string, FieldDefinition>): SortFieldDescriptor[] {
    if (!sortValue) {
      return [];
    }

    const expressions = sortValue
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);

    if (!expressions.length) {
      throw new BadRequestException(this.translateMessage('messages.ERROR.INVALID_SORT_FORMAT'));
    }

    return expressions.map((expression) => {
      const [fieldRaw, directionRaw] = expression.split(':').map((value) => value?.trim());

      if (!fieldRaw || !directionRaw) {
        throw new BadRequestException(this.translateMessage('messages.ERROR.INVALID_SORT_FORMAT'));
      }

      const field = fieldRaw;
      const directionLower = directionRaw.toLowerCase();
      if (!['asc', 'desc'].includes(directionLower)) {
        throw new BadRequestException(
          `${this.translateMessage('messages.ERROR.INVALID_SORT_DIRECTION')} (field: ${field})`,
        );
      }

      const config = this.resolveFieldConfig(field, mapping, 'sort');
      if (!config) {
        throw new BadRequestException(
          `${this.translateMessage('messages.ERROR.INVALID_SORT_FIELD')} (field: ${field})`,
        );
      }

      return {
        field,
        column: config.column,
        direction: directionLower === 'asc' ? 'ASC' : 'DESC',
      } satisfies SortFieldDescriptor;
    });
  }

  static parseFilter(filterValue: string | undefined, mapping?: Record<string, FieldDefinition>): FilterConditionDescriptor[] {
    if (!filterValue) {
      return [];
    }

    const expressions = filterValue
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);

    if (!expressions.length) {
      throw new BadRequestException(this.translateMessage('messages.ERROR.INVALID_FILTER_FORMAT'));
    }

    return expressions.map((expression) => {
      const segments = expression.split(':');
      if (segments.length < 3) {
        throw new BadRequestException(this.translateMessage('messages.ERROR.INVALID_FILTER_FORMAT'));
      }

      const field = segments.shift()?.trim();
      const operatorRaw = segments.shift()?.trim();
      const valueRaw = segments.join(':').trim();

      if (!field || !operatorRaw || !valueRaw) {
        throw new BadRequestException(this.translateMessage('messages.ERROR.INVALID_FILTER_FORMAT'));
      }

      const operator = operatorRaw.toLowerCase() as FilterOperator;
      if (!ALLOWED_OPERATORS.includes(operator)) {
        throw new BadRequestException(
          `${this.translateMessage('messages.ERROR.INVALID_FILTER_OPERATOR')} (operator: ${operatorRaw})`,
        );
      }

      const config = this.resolveFieldConfig(field, mapping, 'filter');
      if (!config) {
        throw new BadRequestException(
          `${this.translateMessage('messages.ERROR.INVALID_FILTER_FIELD')} (field: ${field})`,
        );
      }

      if (config.allowedOperators && !config.allowedOperators.includes(operator)) {
        throw new BadRequestException(
          `${this.translateMessage('messages.ERROR.INVALID_FILTER_OPERATOR')} (operator: ${operatorRaw})`,
        );
      }

      const value = this.normalizeValue(valueRaw, operator, config);

      return {
        field,
        column: config.column,
        operator,
        value,
        rawValue: valueRaw,
      } satisfies FilterConditionDescriptor;
    });
  }

  static applySort<T extends ObjectLiteral>(queryBuilder: SelectQueryBuilder<T>, sort: SortFieldDescriptor[]) {
    sort.forEach(({ column, direction }) => {
      queryBuilder.addOrderBy(column, direction);
    });
  }

  static applyFilter<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    filter: FilterConditionDescriptor[],
  ) {
    filter.forEach((condition, index) => {
      const parameter = `filter_${condition.field}_${index}`;

      switch (condition.operator) {
        case 'eq':
          queryBuilder.andWhere(`${condition.column} = :${parameter}`, { [parameter]: condition.value });
          break;
        case 'ne':
          queryBuilder.andWhere(`${condition.column} != :${parameter}`, { [parameter]: condition.value });
          break;
        case 'lt':
          queryBuilder.andWhere(`${condition.column} < :${parameter}`, { [parameter]: condition.value });
          break;
        case 'gt':
          queryBuilder.andWhere(`${condition.column} > :${parameter}`, { [parameter]: condition.value });
          break;
        case 'lte':
          queryBuilder.andWhere(`${condition.column} <= :${parameter}`, { [parameter]: condition.value });
          break;
        case 'gte':
          queryBuilder.andWhere(`${condition.column} >= :${parameter}`, { [parameter]: condition.value });
          break;
        case 'like':
          queryBuilder.andWhere(`${condition.column} LIKE :${parameter}`, {
            [parameter]: `%${condition.value}%`,
          });
          break;
        case 'in':
          queryBuilder.andWhere(`${condition.column} IN (:...${parameter})`, {
            [parameter]: Array.isArray(condition.value) ? condition.value : [condition.value],
          });
          break;
        default:
          throw new BadRequestException(
            `${this.translateMessage('messages.ERROR.INVALID_FILTER_OPERATOR')} (operator: ${condition.operator})`,
          );
      }
    });
  }

  private static resolveFieldConfig(
    field: string,
    mapping: Record<string, FieldDefinition> | undefined,
    context: 'sort' | 'filter',
  ): QueryFieldConfig | undefined {
    if (!mapping) {
      return undefined;
    }

    const definition = mapping[field];
    if (!definition) {
      return undefined;
    }

    if (typeof definition === 'string') {
      return { column: definition } satisfies QueryFieldConfig;
    }

    if (context === 'sort' && definition.allowedOperators && definition.allowedOperators.length) {
      // Sort context does not utilise allowedOperators; ignore gracefully.
      return { ...definition } satisfies QueryFieldConfig;
    }

    return { ...definition } satisfies QueryFieldConfig;
  }

  private static normalizeValue(
    value: string,
    operator: FilterOperator,
    config: QueryFieldConfig,
  ): string | number | boolean | Array<string | number | boolean> {
    if (operator === 'in') {
      const parts = value.split('|').map((entry) => entry.trim()).filter(Boolean);
      if (!parts.length) {
        throw new BadRequestException(this.translateMessage('messages.ERROR.INVALID_FILTER_VALUE'));
      }
  return parts.map((entry) => this.castValue(entry, config));
    }

    return this.castValue(value, config);
  }

  private static castValue(value: string, config: QueryFieldConfig): string | number | boolean {
    switch (config.type) {
      case 'number': {
        const parsed = Number(value);
        if (Number.isNaN(parsed)) {
          throw new BadRequestException(this.translateMessage('messages.ERROR.INVALID_FILTER_VALUE'));
        }
        return parsed;
      }
      case 'boolean': {
        if (['true', 'false', '1', '0'].includes(value.toLowerCase())) {
          return ['true', '1'].includes(value.toLowerCase());
        }
        throw new BadRequestException(this.translateMessage('messages.ERROR.INVALID_FILTER_VALUE'));
      }
      default: {
        if (config.enumValues && !config.enumValues.includes(value)) {
          throw new BadRequestException(this.translateMessage('messages.ERROR.INVALID_FILTER_VALUE'));
        }
        return value;
      }
    }
  }

  private static translateMessage(key: string): string {
    const i18n = I18nContext.current();
    const lang = i18n?.lang;
    const translated = i18n?.t(key as Parameters<typeof i18n.t>[0], { lang });
    if (typeof translated === 'string') {
      return translated;
    }
    return FALLBACK_MESSAGES[key] ?? key;
  }
}