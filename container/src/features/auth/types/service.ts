import type { Service } from '@/shared/api';
import type { LoginRequest, SignupRequest, SignupResponse, User } from '@/shared/types/auth';

export interface AuthApiService extends Service {
  login(request: LoginRequest): Promise<void>;
  register(request: SignupRequest): Promise<SignupResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User>;
}
