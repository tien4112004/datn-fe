import { Outlet, useNavigation, useLocation } from 'react-router-dom';
import GlobalSpinner from '@/components/common/GlobalSpinner';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'sonner';
import ErrorBoundary from '@/components/common/ErrorBoundary';

export default function StudentLayout() {
  const navigation = useNavigation();
  const location = useLocation();
  const isLoading = navigation.state === 'loading';
  const { t } = useTranslation('glossary', { keyPrefix: 'loading' });

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-white">
        {isLoading && <GlobalSpinner text={t('page')} />}
        <ErrorBoundary pathname={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </div>
    </>
  );
}
