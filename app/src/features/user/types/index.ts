export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // Should be in 'YYYY-MM-DD' format
  avatarUrl: string | null;
  createdAt: string; // ISO 8601 date-time string
  updatedAt: string; // ISO 8601 date-time string
  phoneNumber: string | null;
}

export interface UserProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string; // Should be in 'YYYY-MM-DD' format
}
