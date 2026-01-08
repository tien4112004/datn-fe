import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AuthContextType } from '@/types/auth';
import { useLogin as useLoginMutation, useProfile, useLogout as useLogoutMutation, authKeys } from '@/hooks';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'admin_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const queryClient = useQueryClient();
  const [hasToken, setHasToken] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)));

  // Use the profile query hook to get user data when tokens exist
  const { data: profileData, isLoading: isLoadingProfile } = useProfile(hasToken);

  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();

  // Update user when profile data changes or loading completes
  useEffect(() => {
    if (!isLoadingProfile) {
      setIsInitializing(false);

      if (profileData) {
        // Verify admin role
        if (profileData.role === 'ADMIN' || profileData.role === 'admin') {
          setUser(profileData);
          localStorage.setItem(USER_KEY, JSON.stringify(profileData));
        } else {
          clearAuthData();
          toast.error('Access denied. Admin privileges required.');
        }
      } else {
        // No profile data means user is not authenticated
        setUser(null);
      }
    }
  }, [profileData, isLoadingProfile]);

  // Listen for unauthorized events from API
  useEffect(() => {
    const handleUnauthorized = () => {
      // Clear data immediately without calling API again
      clearAuthData();
      setHasToken(false);
      toast.error('Session expired. Please login again.');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const clearAuthData = () => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  };

  const login = async (email: string, password: string, onSuccess?: () => void) => {
    try {
      // Use the login mutation
      await loginMutation.mutateAsync({ email, password });

      // Update hasToken state to enable profile query
      setHasToken(true);

      // Tokens are stored by the mutation hook
      // Now wait for the profile to be fetched and user state to be updated
      await queryClient.refetchQueries({ queryKey: authKeys.profile });

      toast.success('Login successful');

      // Call onSuccess callback if provided (for navigation)
      onSuccess?.();
    } catch (error: unknown) {
      // Error toast is already shown by the mutation hook
      throw error;
    }
  };

  const logout = () => {
    // Disable profile query immediately to prevent /me calls
    setHasToken(false);
    setUser(null);

    // Use the logout mutation
    logoutMutation.mutate();
    // Data clearing is handled by the mutation hook
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: Boolean(user),
    isLoading: isInitializing || isLoadingProfile || loginMutation.isPending,
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
