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

export const ClassListPage = () => {
  const { t } = useTranslation('classes', { keyPrefix: 'list' });
  const [searchParams, setSearchParams] = useSearchParams();

  const { viewMode, setViewMode, openCreateModal, closeCreateModal, isCreateModalOpen } = useClassStore();

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
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col overflow-auto">
        <div className="mx-auto w-full max-w-7xl space-y-6 px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight">{t('title')}</h1>
              <p className="text-muted-foreground text-sm">{t('description')}</p>
            </div>
            <Button onClick={openCreateModal} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('createClass')}
            </Button>
            <AddClassModal isOpen={isCreateModalOpen} onClose={closeCreateModal} />
          </div>

          <div className="flex items-center justify-end">
            <ViewToggle value={currentViewMode} onValueChange={handleViewModeChange} />
          </div>

          <ClassFilters />

          {currentViewMode === 'list' ? <ClassTable /> : <ClassGrid />}
        </div>
      </div>
    </div>
  );
};
