import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/context/auth';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthApiService } from '../api';

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const authService = useAuthApiService();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const user = await authService.getCurrentUser();
        setUser(user);
        toast.success('Successfully signed in with Google');
        navigate('/', { replace: true });
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast.error('Failed to complete sign in. Please try again.');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    handleCallback();
  }, [navigate, setUser, authService]);

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
