import { Outlet, useNavigation } from 'react-router-dom';
import GlobalSpinner from '@/components/common/GlobalSpinner';
import { useTranslation } from 'react-i18next';
import { SidebarInset, SidebarProvider, useSidebar } from '../components/ui/sidebar';
import { AppSidebar } from '../components/navigation/AppSidebar';
import { subscribe, unsubscribe } from '@/shared/lib/event';
import React from 'react';

function NavLayoutContent() {
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';
  const { state, toggleSidebar } = useSidebar();
  const { t } = useTranslation('loading');

  const hideSidebar = () => {
    if (state === "expanded") { toggleSidebar(); }
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
      <SidebarInset>
        {isLoading && <GlobalSpinner text={t('page')} />}
        <Outlet />
      </SidebarInset>
    </>
  );
}

export default function NavLayout() {
  return (
    <SidebarProvider>
      <NavLayoutContent />
    </SidebarProvider>
  );
}
