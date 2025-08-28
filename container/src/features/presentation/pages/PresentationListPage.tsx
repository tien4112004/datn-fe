import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Separator } from '@radix-ui/react-separator';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PresentationTable from '../components/table/PresentationTable';
import { createTestPresentations } from '../hooks/loaders';

const PresentationListPage = () => {
  const navigate = useNavigate();
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
        <div>
          <Button variant="outline" onClick={() => createTestPresentations()}>
            Create Test Presentation (Using API)
          </Button>
        </div>
      </header>
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="mb-4 text-center text-2xl font-semibold">{t('title')}</h1>
          <div className="space-x-2">
            <Button variant={'secondary'} className="mb-4" onClick={() => navigate('/presentation/create')}>
              {t('createNewPresentation')}
            </Button>
            <Button variant={'secondary'} className="mb-4" onClick={() => navigate('/presentation/editor')}>
              {t('viewEditor')}
            </Button>
          </div>
        </div>
        <PresentationTable />
      </div>
    </>
  );
};

export default PresentationListPage;
