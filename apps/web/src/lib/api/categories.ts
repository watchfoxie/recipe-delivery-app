import apiClient from './client';
import type { ApiResponse, RecipeCategory, IngredientCategory } from './types';

export const categoriesApi = {
  // Recipe categories
  getRecipeCategories: async (): Promise<RecipeCategory[]> => {
    const response = await apiClient.get<ApiResponse<RecipeCategory[]>>('/recipe-categories');
    return response.data.data;
  },

  getRecipeCategoriesByThematic: async (thematic: 'retete' | 'selectii'): Promise<RecipeCategory[]> => {
    const response = await apiClient.get<ApiResponse<RecipeCategory[]>>(`/recipe-categories/thematic/${thematic}`);
    return response.data.data;
  },

  getRecipeCategoryBySlug: async (slug: string): Promise<RecipeCategory> => {
    const response = await apiClient.get<ApiResponse<RecipeCategory>>(`/recipe-categories/slug/${slug}`);
    return response.data.data;
  },

  // Ingredient categories
  getIngredientCategories: async (): Promise<IngredientCategory[]> => {
    const response = await apiClient.get<ApiResponse<IngredientCategory[]>>('/ingredient-categories');
    return response.data.data;
  },
};
