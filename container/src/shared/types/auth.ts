export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  avatar?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: SignupRequest) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber?: string;
}

export interface SignupResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
