import apiClient from './client';
import type { ApiResponse, PaginatedResponse, Recipe, CreateRecipeRequest, RecipeQueryParams, RecipeCategory } from './types';

function buildQueryString(params: RecipeQueryParams): string {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.sort) query.set('sort', params.sort);
  if (params.filter) query.set('filter', params.filter);
  if (params.search) query.set('search', params.search);
  return query.toString();
}

export const recipesApi = {
  getAll: async (params: RecipeQueryParams = {}): Promise<PaginatedResponse<Recipe>> => {
    const queryString = buildQueryString(params);
    const url = queryString ? `/recipes?${queryString}` : '/recipes';
    const response = await apiClient.get<PaginatedResponse<Recipe>>(url);
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Recipe> => {
    const response = await apiClient.get<ApiResponse<Recipe>>(`/recipes/slug/${slug}`);
    return response.data.data;
  },

  getById: async (id: number): Promise<Recipe> => {
    const response = await apiClient.get<ApiResponse<Recipe>>(`/recipes/${id}`);
    return response.data.data;
  },

  getByCategory: async (categorySlug: string, params: RecipeQueryParams = {}): Promise<PaginatedResponse<Recipe>> => {
    // First, get the category ID from the slug
    const categoryResponse = await apiClient.get<ApiResponse<RecipeCategory>>(`/recipe-categories/slug/${categorySlug}`);
    const categoryId = categoryResponse.data.data.id;
    
    // Use recipe_category_id filter (API expects snake_case and numeric ID)
    const baseFilter = `recipe_category_id:eq:${categoryId}`;
    const combinedFilter = params.filter ? `${baseFilter},${params.filter}` : baseFilter;
    const queryString = buildQueryString({ ...params, filter: combinedFilter });
    const url = `/recipes?${queryString}`;
    const response = await apiClient.get<PaginatedResponse<Recipe>>(url);
    return response.data;
  },

  create: async (data: CreateRecipeRequest): Promise<Recipe> => {
    const response = await apiClient.post<ApiResponse<Recipe>>('/recipes', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<CreateRecipeRequest>): Promise<Recipe> => {
    const response = await apiClient.put<ApiResponse<Recipe>>(`/recipes/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/recipes/${id}`);
  },

  getMyRecipes: async (params: RecipeQueryParams = {}): Promise<PaginatedResponse<Recipe>> => {
    const queryString = buildQueryString(params);
    const url = queryString ? `/recipes/my?${queryString}` : '/recipes/my';
    const response = await apiClient.get<PaginatedResponse<Recipe>>(url);
    return response.data;
  },
};
