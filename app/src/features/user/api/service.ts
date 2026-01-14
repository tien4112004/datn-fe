import { api } from '@aiprimary/api';
import { API_MODE, type ApiMode } from '@aiprimary/api';
import type { ApiResponse } from '@aiprimary/api';
import type { User, UserProfile, UserProfileUpdateRequest } from '../types';

export interface UserProfileApiService {
  baseUrl: string;
  getType(): ApiMode;
  getCurrentUserProfile(): Promise<UserProfile>;
  updateCurrentUserProfile(data: UserProfileUpdateRequest): Promise<UserProfile>;
  updateCurrentUserAvatar(avatar: File): Promise<{ avatarUrl: string }>;
  removeCurrentUserAvatar(): Promise<void>;
  searchUsers(query: string): Promise<User[]>;
}

export default class UserProfileRealApiService implements UserProfileApiService {
  baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return API_MODE.real;
  }

  async getCurrentUserProfile(): Promise<UserProfile> {
    const response = await api.get<ApiResponse<UserProfile>>(`${this.baseUrl}/api/user/me`);
    return response.data.data;
  }

  async updateCurrentUserProfile(data: UserProfileUpdateRequest): Promise<UserProfile> {
    const response = await api.patch<ApiResponse<UserProfile>>(`${this.baseUrl}/api/user/me`, data);
    return response.data.data;
  }

  async updateCurrentUserAvatar(avatar: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', avatar);

    const response = await api.patch<ApiResponse<{ avatarUrl: string }>>(
      `${this.baseUrl}/api/user/me/avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  }

  async removeCurrentUserAvatar(): Promise<void> {
    await api.delete(`${this.baseUrl}/api/user/me/avatar`);
  }

  async searchUsers(query: string): Promise<User[]> {
    const response = await api.get<ApiResponse<User[]>>(`${this.baseUrl}/api/user/search`, {
      params: { q: query, limit: 10 },
    });
    return response.data.data;
  }
}
