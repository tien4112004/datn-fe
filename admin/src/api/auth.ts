import api from './client';
import type { LoginRequest, LoginResponse, User } from '@/types/auth';
import { getApiMode, type ApiMode } from '@aiprimary/api';

const MOCK_ADMIN_USER: User = {
  id: 'admin-mock-id',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN',
};

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const apiMode = getApiMode();

    if (apiMode === 'mock') {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        token_type: 'Bearer',
        expires_in: 360000,
      };
    }
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  logout: async (apiMode: ApiMode = 'real'): Promise<void> => {
    if (apiMode === 'mock') {
      return;
    }
    await api.post('/auth/logout');
  },

  getProfile: async (apiMode: ApiMode = 'real'): Promise<User> => {
    if (apiMode === 'mock') {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      return MOCK_ADMIN_USER;
    }
    const response = await api.get<{ data: User }>('/auth/profile');
    return response.data.data;
  },

  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  },
};
