import { API_MODE, type ApiMode, api } from '@aiprimary/api';
import type { AuthApiService } from '@/types/service';
import type { LoginRequest, LoginResponse, User } from '@/types/auth';

export default class AuthRealApiService implements AuthApiService {
  baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return API_MODE.real;
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(`${this.baseUrl}/api/auth/signin`, data);
    return response.data;
  }

  async logout(): Promise<void> {
    await api.post(`${this.baseUrl}/api/auth/logout`);
  }

  async getProfile(): Promise<User> {
    const response = await api.get<{ data: User }>(`${this.baseUrl}/api/user/me`);
    return { ...response.data.data, role: 'admin' };
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(`${this.baseUrl}/auth/refresh`, {
      refresh_token: refreshToken,
    });
    return response.data;
  }
}
