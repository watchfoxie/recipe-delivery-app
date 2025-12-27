import type { QueryFieldConfig } from '../../common/utils/query-parser.util';
import { RecipeDifficulty } from './entities/recipe.entity';

export const RECIPES_SORT_MAPPING = {
  created_at: 'recipe.created_at',
  title: 'recipe.title',
  difficulty: 'recipe.difficulty',
  total_time_min: 'recipe.total_time_min',
  rating_avg: 'recipe.rating_avg',
} as const;

export const RECIPES_ALLOWED_SORT_FIELDS = Object.keys(RECIPES_SORT_MAPPING);

export const RECIPES_FILTER_MAPPING: Record<string, QueryFieldConfig> = {
  difficulty: {
    column: 'recipe.difficulty',
    type: 'string',
    enumValues: Object.values(RecipeDifficulty),
    allowedOperators: ['eq', 'ne', 'in'],
  },
  total_time_min: {
    column: 'recipe.total_time_min',
    type: 'number',
    allowedOperators: ['eq', 'ne', 'lt', 'gt', 'lte', 'gte', 'in'],
  },
  rating_avg: {
    column: 'recipe.rating_avg',
    type: 'number',
    allowedOperators: ['eq', 'ne', 'lt', 'gt', 'lte', 'gte'],
  },
  author_id: {
    column: 'recipe.author_id',
    type: 'number',
    allowedOperators: ['eq', 'in'],
  },
  category_id: {
    column: 'recipe.category_id',
    type: 'number',
    allowedOperators: ['eq', 'ne', 'in'],
  },
  title: {
    column: 'recipe.title',
    type: 'string',
    allowedOperators: ['like', 'eq', 'ne'],
  },
};
