import type { User } from '@/shared/types/auth';

// Mock user with password for testing
export interface MockUser extends User {
  password: string;
}

export const MOCK_USERS: MockUser[] = [
  {
    id: 'user-001',
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    avatar: 'https://github.com/shadcn.png',
  },
  {
    id: 'user-002',
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User',
    avatar: 'https://github.com/shadcn.png',
  },
  {
    id: 'user-003',
    email: 'demo@example.com',
    password: 'demo123',
    name: 'Demo User',
    avatar: 'https://github.com/shadcn.png',
  },
];

// Helper function to find user by email
export function findUserByEmail(email: string): MockUser | undefined {
  return MOCK_USERS.find((user) => user.email === email);
}

// Helper function to validate credentials
export function validateCredentials(email: string, password: string): MockUser | null {
  const user = findUserByEmail(email);
  if (user && user.password === password) {
    return user;
  }
  return null;
}

// Generate mock tokens
export function generateMockTokens() {
  return {
    accessToken: `mock-access-token-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    refreshToken: `mock-refresh-token-${Date.now()}-${Math.random().toString(36).substring(7)}`,
  };
}

// Helper function to create a new user (for registration)
export function createMockUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  dateOfBirth: string,
  phoneNumber?: string
): MockUser {
  // Check if user already exists
  const existingUser = findUserByEmail(email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Create new user
  const newUser: MockUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    email,
    password,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    dateOfBirth,
    phoneNumber,
    avatar: 'https://github.com/shadcn.png',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Add to mock users array
  MOCK_USERS.push(newUser);

  return newUser;
}
