import { API_MODE, type ApiMode } from '@/shared/constants';
import type { AuthApiService } from '../types';
import type { LoginRequest, SignupRequest, SignupResponse, User } from '@/shared/types/auth';
import { ExpectedError } from '@/shared/types/errors';
import { ERROR_TYPE } from '@/shared/constants';
import { createMockUser } from './mock-data';
import { setUserData, clearAuthData } from '@/shared/context/auth';

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
   * Always succeeds with any credentials (no validation)
   * Authentication is simulated via localStorage (in real app, backend sets HttpOnly cookies)
   */
  async login(request: LoginRequest): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Create a mock user with the provided email (always succeeds)
    const mockUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      email: request.email,
      name: request.email.split('@')[0], // Use email prefix as name
      avatar: 'https://github.com/shadcn.png',
    };

    // Store user data (simulates backend setting cookies + returning user)
    setUserData(mockUser);
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

      // Remove password from user object
      const { password, ...userWithoutPassword } = user;

      // Signup doesn't return tokens, just user data (matching new API spec)
      return {
        user: userWithoutPassword,
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
   * Endpoint: GET /api/user/me
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
}
