export interface TokenUsageStats {
  totalTokens: number | null;
  totalRequests: number | null;
  model?: string | null;
  requestType?: string | null;
  totalCoin: string | null;
  totalMoney: string | null;
}

export interface TokenUsageFilterRequest {
  model?: string | null;
  provider?: string | null;
  requestType?: string | null;
}

export interface UserWithTokenUsage {
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
  role?: string;
  totalCoin?: string;
  totalMoney?: string;
}
