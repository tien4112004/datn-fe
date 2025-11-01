import { API_MODE, type ApiMode } from '@/shared/constants';
import type { AuthApiService } from '../types';
import type { LoginRequest, LoginResponse, SignupRequest, SignupResponse, User } from '@/shared/types/auth';
import { ExpectedError } from '@/shared/types/errors';
import { ERROR_TYPE } from '@/shared/constants';
import { validateCredentials, generateMockTokens, createMockUser } from './mock-data';
import { setTokens, setUserData, clearAuthData } from '@/shared/context/auth';

export default class AuthMockService implements AuthApiService {
  baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return API_MODE.mock;
  }

  /**
   * Mock login - simulates API call to backend
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Validate credentials against mock data
    const user = validateCredentials(request.email, request.password);

    if (!user) {
      throw new ExpectedError('Invalid email or password', ERROR_TYPE.API_ERROR, 'INVALID_CREDENTIALS', {
        email: request.email,
      });
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
   * Mock register - simulates API call to backend
   */
  async register(request: SignupRequest): Promise<SignupResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      // Create new user with mock data
      const user = createMockUser(
        request.email,
        request.password,
        request.firstName,
        request.lastName,
        request.dateOfBirth,
        request.phoneNumber
      );

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
    } catch (error) {
      if (error instanceof Error && error.message === 'User with this email already exists') {
        throw new ExpectedError(
          'An account with this email already exists',
          ERROR_TYPE.API_ERROR,
          'EMAIL_ALREADY_EXISTS',
          { email: request.email }
        );
      }
      throw error;
    }
  }

  /**
   * Mock logout - simulates API call to backend
   */
  async logout(): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Clear all auth data
    clearAuthData();
  }

  /**
   * Mock get current user - simulates fetching user data from backend
   */
  async getCurrentUser(): Promise<User> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    // In a real app, this would call the backend with the token
    // For now, we'll get it from localStorage
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      throw new ExpectedError('No user found', ERROR_TYPE.API_ERROR, 'USER_NOT_FOUND');
    }

    return JSON.parse(userJson);
  }

  /**
   * Mock refresh token - simulates refreshing access token
   */
  async refreshToken(_refreshToken: string): Promise<{ accessToken: string }> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Generate new mock access token
    const { accessToken } = generateMockTokens();

    // Store new access token
    localStorage.setItem('accessToken', accessToken);

    return { accessToken };
  }
}
