import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useClassStore } from '../shared/stores';
import { AddClassModal } from './components/controls/AddClassModal';
import { ViewToggle, type ViewMode } from './components/ViewToggle';
import { ClassFilters } from './components/ClassFilters';
import ClassGrid from './components/ClassGrid';
import { ClassTable } from './components/ClassTable';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Separator } from '@radix-ui/react-separator';

export const ClassListPage = () => {
  const { t } = useTranslation('classes', { keyPrefix: 'list' });
  const [searchParams, setSearchParams] = useSearchParams();

  // Use selectors to prevent unnecessary re-renders
  const viewMode = useClassStore((state) => state.viewMode);
  const setViewMode = useClassStore((state) => state.setViewMode);
  const openCreateModal = useClassStore((state) => state.openCreateModal);
  const closeCreateModal = useClassStore((state) => state.closeCreateModal);
  const isCreateModalOpen = useClassStore((state) => state.isCreateModalOpen);

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
              <BreadcrumbPage>{t('title')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="space-y-6 px-8 py-6">
        {/* Page Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground text-sm">{t('description')}</p>
          </div>
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('createClass')}
          </Button>
          <AddClassModal isOpen={isCreateModalOpen} onClose={closeCreateModal} />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <ClassFilters />
          </div>
          <ViewToggle value={currentViewMode} onValueChange={handleViewModeChange} />
        </div>

        {currentViewMode === 'list' ? <ClassTable /> : <ClassGrid />}
      </div>
    </>
  );
};
