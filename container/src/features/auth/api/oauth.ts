import { api } from '@/shared/api';
import { setTokens, setUserData } from '@/shared/context/auth';
import type { User } from '@/shared/types/auth';

export interface GoogleAuthorizeRequest {
  redirectUri: string;
}

export interface GoogleAuthorizeResponse {
  url: string;
}

export interface ExchangeTokenRequest {
  code: string;
  redirectUri: string;
}

export interface ExchangeTokenResponse {
  access_token: string;
  refresh_token: string;
  user?: User;
}

/**
 * OAuth Service for Google authentication
 */
export class OAuthService {
  baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * Get Google OAuth authorization URL
   * @param redirectUri - Frontend URL where Google will redirect after auth
   * @returns Promise with Google authorization URL
   */
  async getGoogleAuthUrl(redirectUri: string): Promise<GoogleAuthorizeResponse> {
    const response = await api.get<{ data?: GoogleAuthorizeResponse; message?: string }>(
      `${this.baseUrl}/api/auth/google/authorize`,
      {
        params: { redirectUri },
      }
    );

    // Backend returns URL in 'message' field for string responses
    const url = response.data.data?.url || response.data.message;

    return { url: url || '' };
  }

  /**
   * Exchange authorization code for access and refresh tokens
   * @param code - Authorization code from Google OAuth callback
   * @param redirectUri - Same redirect URI used in authorization request
   * @returns Promise with tokens and optional user data
   */
  async exchangeCode(code: string, redirectUri: string): Promise<ExchangeTokenResponse> {
    const response = await api.post<{ data: ExchangeTokenResponse }>(`${this.baseUrl}/api/auth/exchange`, {
      code,
      redirectUri,
    });

    const data = response.data.data || response.data;

    // Store tokens
    if (data.access_token && data.refresh_token) {
      setTokens(data.access_token, data.refresh_token);
    }

    // Store user data if provided
    if (data.user) {
      setUserData(data.user);
    }

    return data;
  }

  /**
   * Complete OAuth login flow
   * Exchanges code, stores tokens, and fetches user profile
   */
  async completeOAuthLogin(code: string, redirectUri: string): Promise<User> {
    // Exchange code for tokens
    const tokenResponse = await this.exchangeCode(code, redirectUri);

    // If user data is included in the exchange response, return it
    if (tokenResponse.user) {
      return tokenResponse.user;
    }

    // Otherwise, fetch user profile separately
    const userResponse = await api.get<{ data: User }>(`${this.baseUrl}/api/user/me`);
    const user = userResponse.data.data || userResponse.data;

    // Store user data
    setUserData(user);

    return user;
  }
}
