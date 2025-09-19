import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import PresentationTable from '@/features/presentation/components/table/PresentationTable';
import PresentationGrid from '@/features/presentation/components/others/PresentationGrid';
import CreatePresentationControls from '@/features/presentation/components/others/CreatePresentationControls';
import ViewToggle, { type ViewMode } from '@/features/presentation/components/others/ViewToggle';

const ProjectListPage = () => {
  const { t } = useTranslation('presentation', { keyPrefix: 'list' });
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

export default ProjectListPage;
