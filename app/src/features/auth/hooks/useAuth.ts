import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth as useAuthContext } from '@/shared/context/auth';
import { useAuthApiService, getAuthApiService } from '../api';
import type { LoginRequest, SignupRequest } from '@/shared/types/auth';

/**
 * Query key factory for auth
 */
export const authKeys = {
  profile: ['auth', 'profile'] as const,
};

/**
 * Hook to get current user profile
 * Used to check authentication status and get user data
 */
export const useProfile = (enabled: boolean = true) => {
  return useQuery({
    queryKey: authKeys.profile,
    queryFn: () => getAuthApiService().getCurrentUser(),
    enabled,
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
    retry: false, // Don't retry on 401
  });
};

/**
 * Hook for login mutation
 */
export const useLogin = () => {
  const { setUser } = useAuthContext();
  const navigate = useNavigate();
  const authService = useAuthApiService();

  return useMutation({
    mutationFn: async (request: LoginRequest) => {
      // Call login to set cookies
      await authService.login(request);

      // Fetch current user data
      const user = await authService.getCurrentUser();

      return user;
    },
    onSuccess: (user) => {
      // Update auth context
      setUser(user);

      // Redirect based on role
      if (user.role === 'student') {
        navigate('/student');
      } else {
        navigate('/');
      }
    },
  });
};

/**
 * Hook for register mutation
 */
export const useRegister = () => {
  const navigate = useNavigate();
  const authService = useAuthApiService();

  return useMutation({
    mutationFn: async (request: SignupRequest) => {
      const response = await authService.register(request);
      return response;
    },
    onSuccess: () => {
      // Redirect to login page after successful registration
      navigate('/login');
    },
  });
};

/**
 * Hook for logout
 */
export const useLogout = () => {
  const { logout } = useAuthContext();
  const authService = useAuthApiService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await authService.logout();
      } catch (error) {
        // Even if backend logout fails (e.g., invalid refresh token),
        // we should still clear the frontend session
        console.warn('Backend logout failed, clearing frontend session anyway:', error);
      }
    },
    onSuccess: () => {
      // Always clear frontend session regardless of backend response
      logout();
      // Clear all cached queries to prevent data leakage between users
      queryClient.clear();
    },
    onError: () => {
      // Even on error, clear frontend session
      logout();
      // Clear all cached queries to prevent data leakage between users
      queryClient.clear();
    },
  });
};
