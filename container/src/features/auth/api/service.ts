import type { LoginRequest, LoginResponse, User } from '@/shared/types/auth';
import { ExpectedError } from '@/shared/types/errors';
import { ERROR_TYPE } from '@/shared/constants';
import {
  validateCredentials,
  generateMockTokens,
} from './mock-data';
import {
  setTokens,
  setUserData,
  clearAuthData,
} from '@/shared/context/auth';

class AuthService {
  /**
   * Mock login - simulates API call to backend
   * In production, this would call the real backend API
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Validate credentials against mock data
    const user = validateCredentials(request.email, request.password);

    if (!user) {
      throw new ExpectedError(
        'Invalid email or password',
        ERROR_TYPE.API_ERROR,
        'INVALID_CREDENTIALS',
        { email: request.email }
      );
    }

    // Generate mock tokens
    const { accessToken, refreshToken } = generateMockTokens();

    // Remove password from user object
    const { password, ...userWithoutPassword } = user;

    // Store tokens and user data
    setTokens(accessToken, refreshToken);
    setUserData(userWithoutPassword);

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Mock logout - simulates API call to backend
   * In production, this would invalidate tokens on the backend
   */
  async logout(): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Clear all auth data
    clearAuthData();
  }

  /**
   * Mock get current user - simulates fetching user data from backend
   * In production, this would verify the token and return user data
   */
  async getCurrentUser(): Promise<User> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    // In a real app, this would call the backend with the token
    // For now, we'll get it from localStorage
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      throw new ExpectedError(
        'No user found',
        ERROR_TYPE.API_ERROR,
        'USER_NOT_FOUND'
      );
    }

    return JSON.parse(userJson);
  }

  /**
   * Mock refresh token - simulates refreshing access token
   * In production, this would exchange refresh token for new access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Generate new mock access token
    const { accessToken } = generateMockTokens();

    // Store new access token
    localStorage.setItem('accessToken', accessToken);

    return { accessToken };
  }
}

// Export singleton instance
export const authService = new AuthService();

// For use in production, you would replace the mock methods with real API calls:
/*
class AuthService {
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(
      `${getBackendUrl()}/auth/login`,
      request
    );

    const { user, accessToken, refreshToken } = response.data;

    setTokens(accessToken, refreshToken);
    setUserData(user);

    return response.data;
  }

  async logout(): Promise<void> {
    await api.post(`${getBackendUrl()}/auth/logout`);
    clearAuthData();
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>(`${getBackendUrl()}/auth/me`);
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await api.post(`${getBackendUrl()}/auth/refresh`, {
      refreshToken,
    });

    const { accessToken } = response.data;
    localStorage.setItem('accessToken', accessToken);

    return response.data;
  }
}
*/
