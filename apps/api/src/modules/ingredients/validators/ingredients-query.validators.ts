import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { FILTER_OPERATORS, type FilterOperator, type QueryFieldConfig } from '../../../common/utils/query-parser.util';
import {
  INGREDIENTS_ALLOWED_SORT_FIELDS,
  INGREDIENTS_FILTER_MAPPING,
} from '../ingredients-query.config';

interface SortExpressionDescriptor {
  field: string;
  direction: 'asc' | 'desc';
}

interface FilterExpressionDescriptor {
  field: string;
  operator: string;
  rawValue: string;
}

class SortExpressionError extends Error {
  constructor(readonly reason: 'format' | 'direction') {
    super(reason);
  }
}

class FilterExpressionError extends Error {}

const SORT_DIRECTIONS = new Set(['asc', 'desc']);

@ValidatorConstraint({ name: 'IngredientsSortFormatValidator', async: false })
export class IngredientsSortFormatValidator implements ValidatorConstraintInterface {
  private lastErrorKey?: string;

  validate(value: string | undefined): boolean {
    this.lastErrorKey = undefined;
    if (value === undefined) {
      return true;
    }

    if (typeof value !== 'string') {
      this.lastErrorKey = 'messages.ERROR.SORT_TYPE_STRING';
      return false;
    }

    try {
      parseSortExpressions(value);
      return true;
    } catch (error) {
      if (error instanceof SortExpressionError && error.reason === 'direction') {
        this.lastErrorKey = 'messages.ERROR.INVALID_SORT_DIRECTION';
      } else {
        this.lastErrorKey = 'messages.ERROR.INVALID_SORT_FORMAT';
      }
      return false;
    }
  }

  defaultMessage(): string {
    return this.lastErrorKey ?? 'messages.ERROR.INVALID_SORT_FORMAT';
  }
}

@ValidatorConstraint({ name: 'IngredientsSortFieldValidator', async: false })
export class IngredientsSortFieldValidator implements ValidatorConstraintInterface {
  private lastErrorKey?: string;

  validate(value: string | undefined): boolean {
    this.lastErrorKey = undefined;
    if (value === undefined) {
      return true;
    }

    const expressions = safeParseSortExpressions(value);
    if (!expressions) {
      return true;
    }

    const invalidField = expressions.find((expression) => !INGREDIENTS_ALLOWED_SORT_FIELDS.includes(expression.field));
    if (invalidField) {
      this.lastErrorKey = 'messages.ERROR.INVALID_SORT_FIELD';
      return false;
    }

    return true;
  }

  defaultMessage(): string {
    return this.lastErrorKey ?? 'messages.ERROR.INVALID_SORT_FIELD';
  }
}

@ValidatorConstraint({ name: 'IngredientsFilterFormatValidator', async: false })
export class IngredientsFilterFormatValidator implements ValidatorConstraintInterface {
  private lastErrorKey?: string;

  validate(value: string | undefined): boolean {
    this.lastErrorKey = undefined;
    if (value === undefined) {
      return true;
    }

    if (typeof value !== 'string') {
      this.lastErrorKey = 'messages.ERROR.FILTER_TYPE_STRING';
      return false;
    }

    try {
      parseFilterExpressions(value);
      return true;
    } catch (error) {
      if (error instanceof FilterExpressionError) {
        this.lastErrorKey = 'messages.ERROR.INVALID_FILTER_FORMAT';
        return false;
      }
      this.lastErrorKey = 'messages.ERROR.INVALID_FILTER_FORMAT';
      return false;
    }
  }

  defaultMessage(): string {
    return this.lastErrorKey ?? 'messages.ERROR.INVALID_FILTER_FORMAT';
  }
}

@ValidatorConstraint({ name: 'IngredientsFilterSchemaValidator', async: false })
export class IngredientsFilterSchemaValidator implements ValidatorConstraintInterface {
  private lastErrorKey?: string;

  validate(value: string | undefined): boolean {
    this.lastErrorKey = undefined;
    if (value === undefined) {
      return true;
    }

    const expressions = safeParseFilterExpressions(value);
    if (!expressions) {
      return true;
    }

    for (const expression of expressions) {
      const config = INGREDIENTS_FILTER_MAPPING[expression.field];
      if (!config) {
        this.lastErrorKey = 'messages.ERROR.INVALID_FILTER_FIELD';
        return false;
      }

      const operator = expression.operator.toLowerCase() as FilterOperator;
      if (!FILTER_OPERATORS.includes(operator)) {
        this.lastErrorKey = 'messages.ERROR.INVALID_FILTER_OPERATOR';
        return false;
      }

      if (config.allowedOperators && !config.allowedOperators.includes(operator)) {
        this.lastErrorKey = 'messages.ERROR.INVALID_FILTER_OPERATOR';
        return false;
      }

      if (!isValueValid(expression.rawValue, operator, config)) {
        this.lastErrorKey = 'messages.ERROR.INVALID_FILTER_VALUE';
        return false;
      }
    }

    return true;
  }

  defaultMessage(): string {
    return this.lastErrorKey ?? 'messages.ERROR.INVALID_FILTER_VALUE';
  }
}

function parseSortExpressions(value: string): SortExpressionDescriptor[] {
  const expressions = value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (!expressions.length) {
    throw new SortExpressionError('format');
  }

  return expressions.map((expression) => {
    const parts = expression.split(':');
    if (parts.length !== 2) {
      throw new SortExpressionError('format');
    }

    const field = parts[0]?.trim();
    const direction = parts[1]?.trim().toLowerCase();

    if (!field || !direction) {
      throw new SortExpressionError('format');
    }

    if (!SORT_DIRECTIONS.has(direction)) {
      throw new SortExpressionError('direction');
    }

    return { field, direction: direction as SortExpressionDescriptor['direction'] };
  });
}

function safeParseSortExpressions(value: string): SortExpressionDescriptor[] | undefined {
  try {
    return parseSortExpressions(value);
  } catch (error) {
    return undefined;
  }
}

function parseFilterExpressions(value: string): FilterExpressionDescriptor[] {
  const expressions = value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (!expressions.length) {
    throw new FilterExpressionError();
  }

  return expressions.map((expression) => {
    const segments = expression.split(':');
    if (segments.length < 3) {
      throw new FilterExpressionError();
    }

    const field = segments.shift()?.trim();
    const operator = segments.shift()?.trim();
    const rawValue = segments.join(':').trim();

    if (!field || !operator || !rawValue) {
      throw new FilterExpressionError();
    }

    return { field, operator, rawValue };
  });
}

function safeParseFilterExpressions(value: string): FilterExpressionDescriptor[] | undefined {
  try {
    return parseFilterExpressions(value);
  } catch (error) {
    return undefined;
  }
}

function isValueValid(value: string, operator: FilterOperator, config: QueryFieldConfig): boolean {
  if (operator === 'in') {
    const parts = value
      .split('|')
      .map((entry) => entry.trim())
      .filter(Boolean);

    if (!parts.length) {
      return false;
    }

    return parts.every((part) => validateSingleValue(part, config));
  }

  return validateSingleValue(value, config);
}

function validateSingleValue(value: string, config: QueryFieldConfig): boolean {
  switch (config.type) {
    case 'number': {
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) {
        return false;
      }
      return true;
    }
    case 'boolean': {
      const lowered = value.toLowerCase();
      return ['true', 'false', '1', '0'].includes(lowered);
    }
    default: {
      if (config.enumValues && !config.enumValues.includes(value)) {
        return false;
      }
      return Boolean(value.length);
    }
  }
}
