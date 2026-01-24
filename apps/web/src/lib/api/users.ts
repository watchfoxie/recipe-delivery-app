import apiClient from './client';
import type { ApiResponse, User } from './types';

export const usersApi = {
  getById: async (id: number): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/users/me');
    return response.data.data;
  },
};
