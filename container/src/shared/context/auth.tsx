import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AuthContextType, SignupRequest } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Note: Authentication is now fully cookie-based (HttpOnly cookies from backend)
// We don't store any tokens in localStorage
// User data is kept in memory only and refreshed on page load via /me endpoint
const USER_KEY = 'user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem(USER_KEY);

        // If we have user data, assume authenticated (cookies will be sent automatically)
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clear corrupted data
        localStorage.removeItem(USER_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Listen for unauthorized events from API (401 responses)
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

    // Clear user data from localStorage
    // Note: HttpOnly cookies will be cleared by calling backend logout endpoint
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

// Helper function to store user data in localStorage
export const setUserData = (user: User) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Helper function to clear all auth data
export const clearAuthData = () => {
  localStorage.removeItem(USER_KEY);
};
