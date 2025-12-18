import { API_MODE, type ApiMode } from '@aiprimary/api';
import type { AuthApiService } from '@/types/service';
import type { LoginRequest, LoginResponse, User } from '@/types/auth';

const MOCK_ADMIN_USER: User = {
  id: 'admin-mock-id',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN',
};

export default class AuthMockService implements AuthApiService {
  baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return API_MODE.mock;
  }

  async login(_data: LoginRequest): Promise<LoginResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      token_type: 'Bearer',
      expires_in: 360000,
    };
  }

  async logout(): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return;
  }

  async getProfile(): Promise<User> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_ADMIN_USER;
  }

  async refreshToken(_refreshToken: string): Promise<LoginResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      access_token: 'mock_refreshed_access_token',
      refresh_token: 'mock_refreshed_refresh_token',
      token_type: 'Bearer',
      expires_in: 360000,
    };
  }
}
