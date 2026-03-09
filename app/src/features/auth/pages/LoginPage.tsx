import { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/shared/context/auth';
import { LoginForm } from '../components/LoginForm';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { AuthHero } from '../components/auth-hero/index.tsx';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { Alert, AlertDescription } from '@ui/alert';

export function LoginPage() {
  const { t } = useTranslation(I18N_NAMESPACES.AUTH);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { requireAuth?: boolean; from?: string } | null;
  const requireAuth = locationState?.requireAuth;
  const from = locationState?.from;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'student') {
        navigate('/student');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate, from]);

  return (
    <div className="relative flex min-h-screen">
      {/* Language Switcher - Fixed top-right */}
      <div className="absolute right-4 top-4 z-10">
        <LanguageSwitcher />
      </div>

      {/* Left side - Animated Hero */}
      <div className="relative hidden lg:block lg:w-2/3">
        <AuthHero />
      </div>

      {/* Right side - Form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/3">
        <div className="w-full max-w-md space-y-8">
          <PageHeader title={t('login.title')} description={t('login.subtitle')} />

          {requireAuth && (
            <Alert variant="destructive">
              <AlertDescription>{t('login.signInRequired')}</AlertDescription>
            </Alert>
          )}

          <LoginForm />

          <div className="text-muted-foreground text-center text-sm">
            {t('login.noAccount')}{' '}
            <Link to="/register" className="text-primary font-medium underline-offset-4 hover:underline">
              {t('login.signUp')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
