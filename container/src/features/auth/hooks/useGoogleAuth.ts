import { useMutation } from '@tanstack/react-query';
import { getBackendUrl } from '@/shared/utils/backend-url';

export const useGoogleLogin = () => {
  const backendUrl = getBackendUrl();

  return useMutation({
    mutationFn: async () => {
      const authUrl = `${backendUrl}/api/auth/google/authorize`;
      window.location.href = authUrl;
    },
  });
};
