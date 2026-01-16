import type { ApiClient } from '@aiprimary/api';
import type { AuthApiService } from '../types';
import type { LoginRequest, SignupRequest, SignupResponse, User } from '@/shared/types/auth';
import { setUserData, clearAuthData } from '@/shared/context/auth';

export default class AuthService implements AuthApiService {
  private readonly apiClient: ApiClient;
  private readonly baseUrl: string;

  constructor(apiClient: ApiClient, baseUrl: string) {
    this.apiClient = apiClient;
    this.baseUrl = baseUrl;
  }

  /**
   * Login user with real API call
   * Authentication tokens are set as HttpOnly cookies by the backend
   */
  async login(request: LoginRequest): Promise<void> {
    await this.apiClient.post(`${this.baseUrl}/api/auth/signin`, request);
    // Backend sets HttpOnly cookies automatically
    // No need to handle tokens on frontend
  }

  /**
   * Register new user with real API call
   */
  async register(request: SignupRequest): Promise<SignupResponse> {
    const response = await this.apiClient.post<{ data: User }>(`${this.baseUrl}/api/auth/signup`, request);

    // Signup doesn't return tokens, just user data
    return { user: response.data.data };
  }

  /**
   * Logout user with real API call
   */
  async logout(): Promise<void> {
    await this.apiClient.post(`${this.baseUrl}/api/auth/logout`);

    // Clear all auth data
    clearAuthData();
  }

  /**
   * Get current user from backend
   */
  async getCurrentUser(): Promise<User> {
    const response = await this.apiClient.get<{ data: User }>(`${this.baseUrl}/api/user/me`);

    // Store user data in localStorage for persistence across page reloads
    setUserData(response.data.data);

    return response.data.data;
  }
}
