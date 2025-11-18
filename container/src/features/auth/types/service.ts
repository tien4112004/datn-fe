import type { Service } from '@/shared/api';
import type { LoginRequest, LoginResponse, SignupRequest, SignupResponse, User } from '@/shared/types/auth';

export interface AuthApiService extends Service {
  login(request: LoginRequest): Promise<LoginResponse>;
  register(request: SignupRequest): Promise<SignupResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User>;
  refreshToken(refreshToken: string): Promise<{ accessToken: string }>;
}
