import type { ApiClient, ApiResponse } from '@aiprimary/api';
import type { User, UserProfile, UserProfileUpdateRequest } from '../types';

export interface UserProfileApiService {
  getType(): 'real' | 'mock';
  getCurrentUserProfile(): Promise<UserProfile>;
  updateCurrentUserProfile(data: UserProfileUpdateRequest): Promise<UserProfile>;
  updateCurrentUserAvatar(avatar: File): Promise<{ avatarUrl: string }>;
  removeCurrentUserAvatar(): Promise<void>;
  searchUsers(query: string): Promise<User[]>;
}

export default class UserProfileService implements UserProfileApiService {
  private readonly apiClient: ApiClient;
  private readonly baseUrl: string;

  constructor(apiClient: ApiClient, baseUrl: string) {
    this.apiClient = apiClient;
    this.baseUrl = baseUrl;
  }

  getType() {
    return 'real' as const;
  }

  async getCurrentUserProfile(): Promise<UserProfile> {
    const response = await this.apiClient.get<ApiResponse<UserProfile>>(`${this.baseUrl}/api/user/me`);
    return response.data.data;
  }

  async updateCurrentUserProfile(data: UserProfileUpdateRequest): Promise<UserProfile> {
    const response = await this.apiClient.patch<ApiResponse<UserProfile>>(
      `${this.baseUrl}/api/user/me`,
      data
    );
    return response.data.data;
  }

  async updateCurrentUserAvatar(avatar: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', avatar);

    const response = await this.apiClient.patch<ApiResponse<{ avatarUrl: string }>>(
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
    await this.apiClient.delete(`${this.baseUrl}/api/user/me/avatar`);
  }

  async searchUsers(query: string): Promise<User[]> {
    const response = await this.apiClient.get<ApiResponse<User[]>>(`${this.baseUrl}/api/users`, {
      params: {
        search: query,
        pageSize: 20,
      },
    });
    return response.data.data;
  }
}
