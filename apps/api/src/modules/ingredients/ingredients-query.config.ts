import type { QueryFieldConfig } from '../../common/utils/query-parser.util';

export const INGREDIENTS_SORT_MAPPING = {
  created_at: 'ingredient.created_at',
  name: 'ingredient.name',
} as const;

export const INGREDIENTS_ALLOWED_SORT_FIELDS = Object.keys(INGREDIENTS_SORT_MAPPING);

export const INGREDIENTS_FILTER_MAPPING: Record<string, QueryFieldConfig> = {
  id: {
    column: 'ingredient.id',
    type: 'number',
    allowedOperators: ['eq', 'in'],
  },
  ingredient_category_id: {
    column: 'ingredient.ingredient_category_id',
    type: 'number',
    allowedOperators: ['eq', 'ne', 'in'],
  },
  name: {
    column: 'ingredient.name',
    type: 'string',
    allowedOperators: ['like', 'eq', 'ne', 'in'],
  },
  slug: {
    column: 'ingredient.slug',
    type: 'string',
    allowedOperators: ['like', 'eq', 'ne', 'in'],
  },
};
