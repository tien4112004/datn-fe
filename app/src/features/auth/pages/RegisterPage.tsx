import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/shared/context/auth';
import { RegisterForm } from '../components/RegisterForm';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { AuthHero } from '../components/auth-hero/index.tsx';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { PageHeader } from '@/shared/components/common/PageHeader';

export function RegisterPage() {
  const { t } = useTranslation(I18N_NAMESPACES.AUTH);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'student') {
        navigate('/student');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

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
          <PageHeader title={t('register.title')} description={t('register.subtitle')} />

          <RegisterForm />

          <div className="text-muted-foreground text-center text-sm">
            {t('register.haveAccount')}{' '}
            <Link to="/login" className="text-primary font-medium underline-offset-4 hover:underline">
              {t('register.signIn')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
