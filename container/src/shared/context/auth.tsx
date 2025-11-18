import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AuthContextType, SignupRequest } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem(USER_KEY);
        const storedToken = localStorage.getItem(TOKEN_KEY);

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clear corrupted data
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Listen for unauthorized events from API
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (_email: string, _password: string) => {
    // This will be implemented by the auth service
    // For now, this is just a placeholder
    throw new Error('Login function should be overridden by auth service');
  };

  const register = async (_data: SignupRequest) => {
    // This will be implemented by the auth service
    // For now, this is just a placeholder
    throw new Error('Register function should be overridden by auth service');
  };

  const logout = () => {
    // Clear user state
    setUser(null);

    // Clear tokens from localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper functions for token management
export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const setUserData = (user: User) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
