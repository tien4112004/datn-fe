import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGoogleCallback } from '../hooks/useGoogleAuth';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Google OAuth Callback Page
 * Handles the redirect from Google OAuth and exchanges the authorization code for tokens
 */
export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const googleCallback = useGoogleCallback();

  useEffect(() => {
    const handleCallback = async () => {
      // Get authorization code from URL
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      // Handle OAuth errors
      if (error) {
        toast.error(`Google authentication failed: ${error}`);
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
        return;
      }

      // Validate code parameter
      if (!code) {
        toast.error('No authorization code received from Google');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
        return;
      }

      // Exchange code for tokens
      try {
        await googleCallback.mutateAsync(code);
        // Success! User will be redirected by the hook's onSuccess
        toast.success('Successfully signed in with Google');
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast.error('Failed to complete sign in. Please try again.');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, googleCallback]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-12 text-center shadow-xl">
        <div className="mb-6 flex justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
        </div>

        <h1 className="mb-3 text-2xl font-semibold text-gray-800">
          {googleCallback.isPending ? 'Completing sign in...' : 'Redirecting...'}
        </h1>

        <p className="text-gray-600">
          {googleCallback.isPending
            ? 'Please wait while we set up your account'
            : 'You will be redirected shortly'}
        </p>

        {googleCallback.isError && (
          <div className="mt-6">
            <p className="mb-4 text-sm text-red-600">
              Failed to complete authentication. Redirecting to login...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
