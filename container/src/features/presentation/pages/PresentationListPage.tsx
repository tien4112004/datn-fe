import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Separator } from '@radix-ui/react-separator';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import PresentationTable from '../components/table/PresentationTable';
import PresentationGrid from '../components/others/PresentationGrid';
import CreatePresentationControls from '../components/others/CreatePresentationControls';
import ViewToggle, { type ViewMode } from '../components/others/ViewToggle';

/**
 * @deprecated Use `ProjectsListPage` instead
 */
const PresentationListPage = () => {
  const { t } = useTranslation('presentation', { keyPrefix: 'list' });
  const { t: tPage } = useTranslation('common', { keyPrefix: 'pages' });
  const [searchParams, setSearchParams] = useSearchParams();

  const viewMode = (searchParams.get('view') as ViewMode) || 'list';

  const setViewMode = (mode: ViewMode) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('view', mode);
      return newParams;
    });
  };

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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{t('title')}</h1>
          <ViewToggle value={viewMode} onValueChange={setViewMode} />
        </div>
        {viewMode === 'list' ? <PresentationTable /> : <PresentationGrid />}
      </div>
    </>
  );
};

export default PresentationListPage;
