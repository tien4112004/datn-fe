import { Outlet, useNavigation } from 'react-router-dom';
import GlobalSpinner from '@/components/common/GlobalSpinner';
import { useTranslation } from 'react-i18next';
import { SidebarInset, SidebarProvider, useSidebar } from '../components/ui/sidebar';
import { AppSidebar } from '../components/nav/app-sidebar';
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
        {/* <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  Building Your Application
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header> */}
        {isLoading && <GlobalSpinner text={t('page')} />}
        <Outlet />
      </SidebarInset>
    </>
  );
}

// Provider component
export default function NavLayout() {
  return (
    <SidebarProvider>
      <NavLayoutContent />
    </SidebarProvider>
  );
}
