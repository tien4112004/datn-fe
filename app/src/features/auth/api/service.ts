import { API_MODE, type ApiMode } from '@aiprimary/api';
import type { AuthApiService } from '../types';
import type { LoginRequest, SignupRequest, SignupResponse, User } from '@/shared/types/auth';
import { api } from '@aiprimary/api';
import { setUserData, clearAuthData } from '@/shared/context/auth';

export default class AuthRealApiService implements AuthApiService {
  baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return API_MODE.real;
  }

  /**
   * Login user with real API call
   * Authentication tokens are set as HttpOnly cookies by the backend
   */
  async login(request: LoginRequest): Promise<void> {
    await api.post(`${this.baseUrl}/api/auth/signin`, request);
    // Backend sets HttpOnly cookies automatically
    // No need to handle tokens on frontend
  }

  /**
   * Register new user with real API call
   */
  async register(request: SignupRequest): Promise<SignupResponse> {
    const response = await api.post<{ data: User }>(`${this.baseUrl}/api/auth/signup`, request);

    // Signup doesn't return tokens, just user data
    return { user: response.data.data };
  }

  /**
   * Logout user with real API call
   * Always clears frontend auth data, even if backend call fails
   */
  async logout(): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/api/auth/logout`);
    } catch (error) {
      // Log error but don't throw - we still want to clear frontend session
      console.warn('Backend logout failed, but clearing frontend session:', error);
    } finally {
      // Always clear auth data regardless of backend response
      clearAuthData();
    }
  }

  /**
   * Get current user from backend
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<{ data: User }>(`${this.baseUrl}/api/user/me`);

    // Store user data in localStorage for persistence across page reloads
    setUserData(response.data.data);

    return response.data.data;
  }
}
