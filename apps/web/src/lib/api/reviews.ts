import apiClient from './client';
import type { ApiResponse, Review, CreateReviewRequest } from './types';

export const reviewsApi = {
  // GET /recipes/:recipeId/reviews
  getByRecipe: async (recipeId: number): Promise<Review[]> => {
    const response = await apiClient.get<ApiResponse<Review[]>>(`/recipes/${recipeId}/reviews`);
    return response.data.data;
  },

  // GET /recipes/:recipeId/reviews/my
  getMyReview: async (recipeId: number): Promise<Review | null> => {
    try {
      const response = await apiClient.get<ApiResponse<Review | null>>(`/recipes/${recipeId}/reviews/my`);
      return response.data.data;
    } catch {
      return null;
    }
  },

  // POST /recipes/:recipeId/reviews (recipeId is path parameter, not in body)
  create: async (recipeId: number, data: CreateReviewRequest): Promise<Review> => {
    const response = await apiClient.post<ApiResponse<Review>>(`/recipes/${recipeId}/reviews`, data);
    return response.data.data;
  },

  // PUT /recipes/:recipeId/reviews/:id
  update: async (recipeId: number, id: number, data: Partial<CreateReviewRequest>): Promise<Review> => {
    const response = await apiClient.put<ApiResponse<Review>>(`/recipes/${recipeId}/reviews/${id}`, data);
    return response.data.data;
  },

  // DELETE /recipes/:recipeId/reviews/:id
  delete: async (recipeId: number, id: number): Promise<void> => {
    await apiClient.delete(`/recipes/${recipeId}/reviews/${id}`);
  },

  // GET /recipes/:recipeId/reviews/stats
  getStats: async (recipeId: number): Promise<{ average: number; count: number }> => {
    const response = await apiClient.get<ApiResponse<{ average: number; count: number }>>(`/recipes/${recipeId}/reviews/stats`);
    return response.data.data;
  },
};
