import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AuthContextType } from '../types/auth';
import { useProfile } from '@/features/auth/hooks/useAuth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Note: Authentication is now fully cookie-based (HttpOnly cookies from backend)
// We don't store any tokens in localStorage
// User data is kept in memory only and refreshed on page load via /me endpoint
const USER_KEY = 'user';

// User-specific localStorage keys that should be cleared on logout
const USER_SPECIFIC_STORAGE_KEYS = [
  'recent-slide-theme-ids', // Recent presentation themes
  'outline-store', // Presentation outlines (Zustand persist)
  'CoreStore', // Mindmap nodes and edges (Zustand persist)
  'TreePanelStore', // Mindmap tree panel state (Zustand persist)
  'mindmap-metadata-store', // Mindmap thumbnail (Zustand persist)
  'class-store', // Class filters and selection (Zustand persist)
  'question-bank-store', // Question bank filters (Zustand persist)
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Always fetch profile on mount to check authentication status
  const { data: profileData, isLoading: isLoadingProfile } = useProfile(true);

  // Update user when profile data changes or loading completes
  useEffect(() => {
    if (!isLoadingProfile) {
      setIsInitializing(false);

      if (profileData) {
        setUser(profileData);
        localStorage.setItem(USER_KEY, JSON.stringify(profileData));
      } else {
        // No profile data means user is not authenticated
        setUser(null);
        localStorage.removeItem(USER_KEY);
      }
    }
  }, [profileData, isLoadingProfile]);

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

  const logout = () => {
    // Clear user state
    setUser(null);

    // Clear user data from localStorage
    // Note: HttpOnly cookies will be cleared by calling backend logout endpoint
    localStorage.removeItem(USER_KEY);

    // Clear all user-specific cached data (Zustand stores, recent themes, etc.)
    USER_SPECIFIC_STORAGE_KEYS.forEach((key) => {
      localStorage.removeItem(key);
    });
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: Boolean(user),
    isLoading: isInitializing || isLoadingProfile,
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

  // Clear all user-specific cached data (Zustand stores, recent themes, etc.)
  USER_SPECIFIC_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });
};
