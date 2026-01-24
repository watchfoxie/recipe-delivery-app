import apiClient from './client';
import type { ApiResponse, PaginatedResponse, Recipe } from './types';

export const favoritesApi = {
  // API returns paginated recipes, not Favorite objects
  getAll: async (): Promise<PaginatedResponse<Recipe>> => {
    const response = await apiClient.get<PaginatedResponse<Recipe>>('/favorites');
    return response.data;
  },

  // POST /favorites/:recipeId (recipeId is a path parameter, not body)
  add: async (recipeId: number): Promise<Recipe> => {
    const response = await apiClient.post<ApiResponse<Recipe>>(`/favorites/${recipeId}`);
    return response.data.data;
  },

  // DELETE /favorites/:recipeId
  remove: async (recipeId: number): Promise<void> => {
    await apiClient.delete(`/favorites/${recipeId}`);
  },

  // GET /favorites/:recipeId/status (not /favorites/check/:recipeId)
  check: async (recipeId: number): Promise<boolean> => {
    const response = await apiClient.get<ApiResponse<{ recipeId: number; isFavorite: boolean }>>(`/favorites/${recipeId}/status`);
    return response.data.data.isFavorite;
  },
};
