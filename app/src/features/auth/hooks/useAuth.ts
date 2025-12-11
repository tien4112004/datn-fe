import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth as useAuthContext } from '@/shared/context/auth';
import { useAuthApiService } from '../api';
import type { LoginRequest, SignupRequest } from '@/shared/types/auth';

/**
 * Hook for login mutation
 */
export const useLogin = () => {
  const { setUser } = useAuthContext();
  const navigate = useNavigate();
  const authService = useAuthApiService();

  return useMutation({
    mutationFn: async (request: LoginRequest) => {
      // Call login to store tokens
      await authService.login(request);

      // Fetch current user data
      const user = await authService.getCurrentUser();

      return user;
    },
    onSuccess: (user) => {
      // Update auth context
      setUser(user);

      // Redirect to home page
      navigate('/');
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

  return useMutation({
    mutationFn: async () => {
      await authService.logout();
    },
    onSuccess: () => {
      logout();
    },
  });
};
