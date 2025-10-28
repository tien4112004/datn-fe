import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Separator } from '@radix-ui/react-separator';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import ClassTable from '../components/table/ClassTable';
import ClassGrid from '../components/grid/ClassGrid';
import CreateClassControls from '../components/controls/CreateClassControls';
import ViewToggle, { type ViewMode } from '../components/controls/ViewToggle';
import ClassFilters from '../components/filters/ClassFilters';
import { useClassStore } from '../stores';

const ClassListPage = () => {
  const { t } = useTranslation('classes', { keyPrefix: 'list' });
  const { t: tPage } = useTranslation('page');
  const [searchParams, setSearchParams] = useSearchParams();

  const { viewMode, setViewMode } = useClassStore();

  const currentViewMode = (searchParams.get('view') as ViewMode) || viewMode;

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('view', mode);
      return newParams;
    });
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbPage>{tPage('classes')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="space-y-4 px-8 py-4">
        <CreateClassControls />

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{t('title')}</h1>
          <ViewToggle value={currentViewMode} onValueChange={handleViewModeChange} />
        </div>

        <ClassFilters />

        {currentViewMode === 'list' ? <ClassTable /> : <ClassGrid />}
      </div>
    </>
  );
};

export default ClassListPage;
