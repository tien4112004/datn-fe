import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/shared/context/auth';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { getAuthApiService } from '../api';

export default function GoogleCallbackPage() {
  const { t } = useTranslation(I18N_NAMESPACES.AUTH);
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const hasHandledCallback = useRef(false);

  useEffect(() => {
    // Prevent multiple calls if effect runs multiple times
    if (hasHandledCallback.current) {
      return;
    }
    hasHandledCallback.current = true;

    const handleCallback = async () => {
      try {
        const authService = getAuthApiService();
        const user = await authService.getCurrentUser();
        setUser(user);
        toast.success(t('login.googleSignInSuccess'));
        navigate('/', { replace: true });
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast.error(t('login.googleSignInFailed'));
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    handleCallback();
  }, [navigate, setUser, t]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-12 text-center shadow-xl">
        <div className="mb-6 flex justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
        </div>

        <h1 className="mb-3 text-2xl font-semibold text-gray-800">
          {isLoading ? 'Completing sign in...' : 'Redirecting...'}
        </h1>

        <p className="text-gray-600">
          {isLoading ? 'Please wait while we set up your account' : 'You will be redirected shortly'}
        </p>
      </div>
    </div>
  );
}
