import { API_MODE, type ApiMode } from '@/shared/constants';
import type { AuthApiService } from '../types';
import type { LoginRequest, LoginResponse, SignupRequest, SignupResponse, User } from '@/shared/types/auth';
import { api } from '@/shared/api';
import { setTokens, setUserData, clearAuthData } from '@/shared/context/auth';

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
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(`${this.baseUrl}/api/auth/login`, request);

    const { user, accessToken, refreshToken } = response.data;

    // Store tokens and user data
    setTokens(accessToken, refreshToken);
    setUserData(user);

    return response.data;
  }

  /**
   * Register new user with real API call
   */
  async register(request: SignupRequest): Promise<SignupResponse> {
    const response = await api.post<SignupResponse>(`${this.baseUrl}/api/auth/register`, request);

    const { user, accessToken, refreshToken } = response.data;

    // Store tokens and user data
    setTokens(accessToken, refreshToken);
    setUserData(user);

    return response.data;
  }

  /**
   * Logout user with real API call
   */
  async logout(): Promise<void> {
    await api.post(`${this.baseUrl}/api/auth/logout`);

    // Clear all auth data
    clearAuthData();
  }

  /**
   * Get current user from backend
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>(`${this.baseUrl}/api/auth/me`);
    return response.data;
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await api.post<{ accessToken: string }>(`${this.baseUrl}/api/auth/refresh`, {
      refreshToken,
    });

    const { accessToken } = response.data;

    // Store new access token
    localStorage.setItem('accessToken', accessToken);

    return response.data;
  }
}
