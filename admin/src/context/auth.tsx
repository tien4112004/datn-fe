import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AuthContextType } from '@/types/auth';
import { authApi, type ApiMode } from '@/api/auth';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'admin_user';
const API_MODE_KEY = 'admin_api_mode';

// Get API mode from localStorage or environment
const getApiMode = (): ApiMode => {
  const stored = localStorage.getItem(API_MODE_KEY);
  if (stored === 'mock' || stored === 'real') {
    return stored;
  }
  // Default to env variable or 'real'
  return (import.meta.env.VITE_API_MODE as ApiMode) || 'mock';
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem(USER_KEY);
        const storedToken = localStorage.getItem(TOKEN_KEY);

        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          // Verify user has admin role
          if (parsedUser.role === 'ADMIN' || parsedUser.role === 'admin') {
            setUser(parsedUser);
          } else {
            // Clear non-admin user data
            logout();
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
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

  const login = async (email: string, password: string) => {
    const apiMode = getApiMode();

    try {
      const response = await authApi.login({ email, password }, apiMode);

      // Store tokens
      localStorage.setItem(TOKEN_KEY, response.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);

      // Get user profile
      const userProfile = await authApi.getProfile(apiMode);

      // Check if user is admin
      if (userProfile.role !== 'ADMIN' && userProfile.role !== 'admin') {
        logout();
        throw new Error('Access denied. Admin privileges required.');
      }

      localStorage.setItem(USER_KEY, JSON.stringify(userProfile));
      setUser(userProfile);
      toast.success('Login successful');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
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
