import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/shared/context/auth';
import { LoginForm } from '../components/LoginForm';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';

export function LoginPage() {
  const { t } = useTranslation(I18N_NAMESPACES.AUTH);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'student') {
        navigate('/student');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="relative flex min-h-screen">
      {/* Language Switcher - Fixed top-right */}
      <div className="absolute right-4 top-4 z-10">
        <LanguageSwitcher />
      </div>

      {/* Left side - Image */}
      <div className="bg-muted relative hidden lg:block lg:w-2/3">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80"
          alt="Login"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="from-background/80 via-background/50 to-background/30 absolute inset-0 bg-gradient-to-t" />
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
          <h2 className="mb-4 text-4xl font-bold">{t('login.heroTitle')}</h2>
          <p className="text-lg text-white/90">{t('login.heroSubtitle')}</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/3">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{t('login.title')}</h1>
            <p className="text-muted-foreground">{t('login.subtitle')}</p>
          </div>

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
