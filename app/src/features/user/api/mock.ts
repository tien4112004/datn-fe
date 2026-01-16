import { API_MODE, type ApiMode } from '@aiprimary/api';
import type { User, UserProfile, UserProfileUpdateRequest } from '../types';
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

  async updateCurrentUserAvatar(_avatar: File): Promise<{ avatarUrl: string }> {
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

  async searchUsers(query: string): Promise<User[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockUsers: User[] = [
      {
        id: '1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: 'https://i.pravatar.cc/150?img=1',
      },
      {
        id: '2',
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        avatarUrl: 'https://i.pravatar.cc/150?img=2',
      },
      {
        id: '3',
        email: 'bob.johnson@example.com',
        firstName: 'Bob',
        lastName: 'Johnson',
        avatarUrl: 'https://i.pravatar.cc/150?img=3',
      },
    ];

    // Filter users based on query
    if (!query) return mockUsers;

    const lowerQuery = query.toLowerCase();
    return mockUsers.filter(
      (user) =>
        user.email.toLowerCase().includes(lowerQuery) ||
        user.firstName.toLowerCase().includes(lowerQuery) ||
        user.lastName.toLowerCase().includes(lowerQuery)
    );
  }
}
