import { API_MODE, type ApiMode } from '@/shared/constants';
import type { UserProfile, UserProfileUpdateRequest } from '../types';
import type { UserProfileApiService } from './service';

const mockUserProfile: UserProfile = {
  id: 'user_mock_123',
  email: 'mock.user@example.com',
  firstName: 'Mock',
  lastName: 'User',
  dateOfBirth: '1990-01-01',
  avatarUrl: 'https://i.pravatar.cc/150',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  phoneNumber: '123-456-7890',
};

export default class UserProfileMockApiService implements UserProfileApiService {
  baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return API_MODE.mock;
  }

  async getCurrentUserProfile(): Promise<UserProfile> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockUserProfile;
  }

  async updateCurrentUserProfile(data: UserProfileUpdateRequest): Promise<UserProfile> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    Object.assign(mockUserProfile, data);
    mockUserProfile.updatedAt = new Date().toISOString();
    return mockUserProfile;
  }

  async updateCurrentUserAvatar(avatar: File): Promise<{ avatarUrl: string }> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newAvatarUrl = 'https://i.pravatar.cc/150?u=' + Date.now();
    mockUserProfile.avatarUrl = newAvatarUrl;
    return { avatarUrl: newAvatarUrl };
  }

  async removeCurrentUserAvatar(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    mockUserProfile.avatarUrl = null;
    return;
  }
}
