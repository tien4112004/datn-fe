import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Separator } from '@radix-ui/react-separator';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PresentationTable from '../components/table/PresentationTable';
import { createTestPresentations } from '../hooks/loaders';
import { Plus, Sparkles } from 'lucide-react';

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
      <div className="space-y-4 px-8 py-4">
        <div className="flex space-x-4">
          <Button
            variant={'secondary'}
            className="text-primary-foreground dark:text-foreground flex h-28 flex-col bg-gradient-to-r from-blue-500 to-indigo-500 shadow hover:to-blue-500"
            onClick={() => navigate('/presentation/create')}
          >
            <Sparkles className="!size-6" />
            <p className="text-lg font-semibold">{t('generateNewPresentation')}</p>
          </Button>

          <Button
            variant={'secondary'}
            className="text-primary-foreground dark:text-foreground flex h-28 flex-col bg-gradient-to-r from-green-500 to-teal-500 shadow hover:to-green-500"
            onClick={() => navigate('/presentation/create-blank')}
          >
            <Plus className="!size-6" />
            <p className="text-lg font-semibold">{t('createBlankPresentation')}</p>
          </Button>
        </div>
        <h1 className="mb-4 text-2xl font-semibold">{t('title')}</h1>
        <PresentationTable />
      </div>
    </>
  );
};

export default PresentationListPage;
