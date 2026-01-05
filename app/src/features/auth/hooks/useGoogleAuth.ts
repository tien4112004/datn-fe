import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getBackendUrl } from '@/shared/utils/backend-url';
import { getApiMode, API_MODE } from '@aiprimary/api';
import { setUserData, useAuth } from '@/shared/context/auth';

export const useGoogleLogin = () => {
  const backendUrl = getBackendUrl();
  const navigate = useNavigate();
  const apiMode = getApiMode();
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (apiMode === API_MODE.mock) {
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockUser = {
          id: `google-user-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          email: 'google.user@example.com',
          firstName: 'Google',
          lastName: 'User',
          name: 'Google User',
          avatar: 'https://lh3.googleusercontent.com/a/default-user',
          role: 'student' as const,
        };

        // Update both localStorage and React context state
        setUserData(mockUser);
        setUser(mockUser);
        navigate('/', { replace: true });
        return;
      }

      const authUrl = `${backendUrl}/api/auth/google/authorize`;
      window.location.href = authUrl;
    },
  });
};
