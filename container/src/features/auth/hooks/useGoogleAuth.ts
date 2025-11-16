import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth as useAuthContext } from '@/shared/context/auth';
import { OAuthService } from '../api/oauth';
import { getBackendUrl } from '@/shared/utils/backend-url';

/**
 * Hook to initiate Google OAuth login
 */
export const useGoogleLogin = () => {
  const backendUrl = getBackendUrl();
  const oauthService = new OAuthService(backendUrl);

  return useMutation({
    mutationFn: async () => {
      // Get current window origin as redirect URI
      const redirectUri = `${window.location.origin}/auth/google/callback`;

      // Get Google OAuth URL from backend
      const response = await oauthService.getGoogleAuthUrl(redirectUri);

      if (!response.url) {
        throw new Error('No authorization URL received from backend');
      }

      return response.url;
    },
    onSuccess: (authUrl) => {
      // Redirect to Google OAuth page
      window.location.href = authUrl;
    },
  });
};

/**
 * Hook to handle OAuth callback and exchange code for tokens
 */
export const useGoogleCallback = () => {
  const { setUser } = useAuthContext();
  const navigate = useNavigate();
  const backendUrl = getBackendUrl();
  const oauthService = new OAuthService(backendUrl);

  return useMutation({
    mutationFn: async (code: string) => {
      // Use current origin as redirect URI (must match the one used in authorization)
      const redirectUri = `${window.location.origin}/auth/google/callback`;

      // Exchange code for tokens and get user data
      const user = await oauthService.completeOAuthLogin(code, redirectUri);

      return user;
    },
    onSuccess: (user) => {
      // Update auth context with user
      setUser(user);

      // Redirect to home page
      navigate('/', { replace: true });
    },
  });
};
