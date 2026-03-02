import { Navigate, Outlet, useNavigate, useNavigation, useRouteError, useLocation } from 'react-router-dom';
import GlobalSpinner from '@/components/common/GlobalSpinner';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'sonner';
import ErrorBoundary, { ErrorPageFallback } from '@/components/common/ErrorBoundary';
import type { AppError } from '@aiprimary/api';
import { useAuth } from '@/shared/context/auth';

export default function StudentLayout() {
  const navigation = useNavigation();
  const location = useLocation();
  const isLoading = navigation.state === 'loading';
  const { t } = useTranslation('glossary', { keyPrefix: 'loading' });

  return (
    <>
      <Toaster richColors />
      <div className="min-h-screen bg-white">
        {isLoading && <GlobalSpinner text={t('page')} />}
        <ErrorBoundary pathname={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </div>
    </>
  );
}

export function StudentLayoutErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <GlobalSpinner />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ requireAuth: true, from: location.pathname + location.search }}
      />
    );
  }

  const resetError = () => {
    navigate('/student');
  };

  const errorId = `router_error_${Date.now()}`;

  return (
    <div className="min-h-screen bg-white">
      <ErrorPageFallback
        error={error as AppError}
        errorInfo={null}
        resetError={resetError}
        errorId={errorId}
        showDetails={true}
      />
    </div>
  );
}
