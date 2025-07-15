import { Outlet, useNavigation } from 'react-router-dom';
import GlobalSpinner from '@/components/common/GlobalSpinner';
import { useTranslation } from 'react-i18next';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '../components/ui/sidebar';
import { AppSidebar } from '../components/nav/app-sidebar';
import { Separator } from '@radix-ui/react-separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../components/ui/breadcrumb';

export default function NavLayout() {
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';
  const { t } = useTranslation('loading');

  return (
    <>
      {/* <Nav />
      <main className="flex flex-col h-fit">
        {isLoading && <GlobalSpinner text={t('page')} />}
        <Outlet />
      </main> */}
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
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
          </header>
          {isLoading && <GlobalSpinner text={t('page')} />}
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
