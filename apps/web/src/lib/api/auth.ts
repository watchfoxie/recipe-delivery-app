import apiClient from './client';
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, User } from './types';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/users/login', credentials);
    return response.data.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    await apiClient.post<ApiResponse<{ user: User }>>('/users', data);
    // After registration, auto-login
    return authApi.login({ email: data.email, password: data.password });
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/users/me');
    return response.data.data;
  },

  updateProfile: async (data: Partial<Pick<User, 'firstName' | 'lastName' | 'avatar'>>): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>('/users/me/profile', data);
    return response.data.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.put('/users/me/password', { currentPassword, newPassword });
  },

  updateTheme: async (theme: 'light' | 'dark'): Promise<User> => {
    const response = await apiClient.patch<ApiResponse<User>>('/users/me/theme', { theme });
    return response.data.data;
  },
};
