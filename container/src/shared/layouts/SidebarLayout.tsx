import { Outlet, useNavigate, useNavigation, useRouteError, useLocation } from 'react-router-dom';
import GlobalSpinner from '@/components/common/GlobalSpinner';
import { SidebarInset, SidebarProvider, useSidebar } from '../components/ui/sidebar';
import { AppSidebar } from '../components/navigation/AppSidebar';
import { subscribe, unsubscribe } from '@/shared/lib/event';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'sonner';
import ErrorBoundary, { ErrorPageFallback } from '@/components/common/ErrorBoundary';
import type { AppError } from '@/types/errors';

function NavLayoutContent() {
  const navigation = useNavigation();
  const location = useLocation();
  const isLoading = navigation.state === 'loading';
  const { state, toggleSidebar, setFullscreen } = useSidebar();
  const { t } = useTranslation('loading');

  const hideSidebar = () => {
    if (state === 'expanded') {
      toggleSidebar();
    }
  };

  React.useEffect(() => {
    subscribe('toggleSidebar', () => toggleSidebar());
    subscribe('hideSidebar', hideSidebar);
    subscribe('enableFullscreen', () => setFullscreen(true));
    subscribe('disableFullscreen', () => setFullscreen(false));

    return () => {
      unsubscribe('toggleSidebar', () => toggleSidebar());
      unsubscribe('hideSidebar', hideSidebar);
      unsubscribe('enableFullscreen', () => setFullscreen(true));
      unsubscribe('disableFullscreen', () => setFullscreen(false));
    };
  }, [toggleSidebar, state, setFullscreen]);

  return (
    <>
      <AppSidebar />
      <SidebarInset className="bg-white">
        {isLoading && <GlobalSpinner text={t('page')} />}
        <ErrorBoundary pathname={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </SidebarInset>
    </>
  );
}

export default function NavLayout() {
  return (
    <SidebarProvider>
      <Toaster />
      <NavLayoutContent />
    </SidebarProvider>
  );
}

export function NavLayoutErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  const resetError = () => {
    navigate('/');
  };

  const errorId = `router_error_${Date.now()}`;

  return (
    <SidebarProvider>
      <Toaster />
      <AppSidebar />
      <SidebarInset className="bg-white">
        <ErrorPageFallback
          error={error as AppError}
          errorInfo={null}
          resetError={resetError}
          errorId={errorId}
          showDetails={true}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
