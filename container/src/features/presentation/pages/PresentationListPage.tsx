import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Separator } from '@radix-ui/react-separator';
import { useTranslation } from 'react-i18next';
import PresentationTable from '../components/table/PresentationTable';
import CreatePresentationControls from '../components/others/CreatePresentationControls';

const PresentationListPage = () => {
  const { t } = useTranslation('presentation', { keyPrefix: 'list' });
  const { t: tPage } = useTranslation('page');

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        {/* <SidebarTrigger className="-ml-1" /> */}
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbPage>{tPage('presentations')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="space-y-4 px-8 py-4">
        <CreatePresentationControls />
        <h1 className="mb-4 text-2xl font-semibold">{t('title')}</h1>
        <PresentationTable />
      </div>
    </>
  );
};

export default PresentationListPage;
