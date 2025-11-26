import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getBackendUrl } from '@/shared/utils/backend-url';
import { getApiMode } from '@/context/api-switching';
import { API_MODE } from '@/shared/constants';
import { setUserData } from '@/shared/context/auth';

export const useGoogleLogin = () => {
  const backendUrl = getBackendUrl();
  const navigate = useNavigate();
  const apiMode = getApiMode();

  return useMutation({
    mutationFn: async () => {
      // In mock mode, simulate Google login without redirecting
      if (apiMode === API_MODE.mock) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Create a mock user for Google sign-in
        const mockUser = {
          id: `google-user-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          email: 'google.user@example.com',
          firstName: 'Google',
          lastName: 'User',
          name: 'Google User',
          avatar: 'https://lh3.googleusercontent.com/a/default-user',
        };

        // Store user data (simulates OAuth callback setting cookies)
        setUserData(mockUser);

        // Navigate to home instead of callback page
        navigate('/', { replace: true });

        return;
      }

      // In real mode, redirect to backend OAuth endpoint
      const authUrl = `${backendUrl}/api/auth/google/authorize`;
      window.location.href = authUrl;
    },
  });
};
