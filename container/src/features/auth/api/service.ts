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
    const response = await api.post<{ data: LoginResponse }>(`${this.baseUrl}/api/auth/signin`, request);

    const { access_token, refresh_token } = response.data.data;

    // Store tokens
    setTokens(access_token, refresh_token);

    return response.data.data;
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
    const response = await api.get<{ data: User }>(`${this.baseUrl}/api/user/me`);

    // Store user data in localStorage
    setUserData(response.data.data);

    return response.data.data;
  }

  /**
   * Refresh access token
   *
   * ⚠️ NOTE: The /api/auth/refresh endpoint is NOT implemented in the backend.
   * Token refresh would need to be handled through Keycloak's standard OAuth2 token endpoint.
   * Currently, when tokens expire (401), the user is logged out and must sign in again.
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    // TODO: Implement token refresh through Keycloak OAuth2 token endpoint
    // For now, this endpoint is not available
    throw new Error('Token refresh endpoint not implemented. Please sign in again.');
  }
}
