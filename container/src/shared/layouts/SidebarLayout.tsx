import { Outlet, useNavigate, useNavigation, useRouteError } from 'react-router-dom';
import GlobalSpinner from '@/components/common/GlobalSpinner';
import { SidebarInset, SidebarProvider, useSidebar } from '../components/ui/sidebar';
import { AppSidebar } from '../components/navigation/AppSidebar';
import { subscribe, unsubscribe } from '@/shared/lib/event';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'sonner';
import ErrorBoundary, { ErrorPageFallback } from '@/components/common/ErrorBoundary';

function NavLayoutContent() {
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';
  const { state, toggleSidebar } = useSidebar();
  const { t } = useTranslation('loading');

  const hideSidebar = () => {
    if (state === 'expanded') {
      toggleSidebar();
    }
  };

  React.useEffect(() => {
    subscribe('toggleSidebar', () => toggleSidebar());
    subscribe('hideSidebar', hideSidebar);

    return () => {
      unsubscribe('toggleSidebar', () => toggleSidebar());
      unsubscribe('hideSidebar', hideSidebar);
    };
  }, [toggleSidebar, state]);

  return (
    <>
      <AppSidebar />
      <SidebarInset className="bg-white">
        {isLoading && <GlobalSpinner text={t('page')} />}
        <ErrorBoundary>
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
          error={error as Error}
          errorInfo={null}
          resetError={resetError}
          errorId={errorId}
          showDetails={true}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
