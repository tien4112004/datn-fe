import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import PresentationTable from '@/features/presentation/components/table/PresentationTable';
import PresentationGrid from '@/features/presentation/components/table/PresentationGrid';
import ProjectControls from '@/features/projects/components/ProjectControls';
import ViewToggle, { type ViewMode } from '@/features/presentation/components/others/ViewToggle';
import CommonTabs, { type TabItem } from '@/shared/components/common/CommonTabs';
import MindmapTable from '@/features/mindmap/components/table/MindmapTable';
import type { ResourceType } from '@/shared/constants/resourceTypes';

const ProjectListPage = () => {
  const { t } = useTranslation('projects');
  const [searchParams, setSearchParams] = useSearchParams();

  const viewMode = (searchParams.get('view') as ViewMode) || 'list';
  const resourceType = searchParams.get('resource') || 'presentation';

  const setViewMode = (mode: ViewMode) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('view', mode);
      return newParams;
    });
  };

  const handleResourceChange = (value: string) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('resource', value);
      return newParams;
    });
  };

  const tabItems: TabItem[] = [
    {
      key: 'presentation',
      value: 'presentation',
      label: t('resources.presentation'),
      // content: viewMode === 'list' ? <PresentationTable /> : <PresentationGrid />,
      content: (
        <>
          <ViewToggle value={viewMode} onValueChange={setViewMode} />
          {viewMode === 'list' ? <PresentationTable /> : <PresentationGrid />}
        </>
      ),
    },
    {
      key: 'document',
      value: 'document',
      label: t('resources.document'),
      content: <div className="text-muted-foreground py-8 text-center">Document resource coming soon...</div>,
    },
    {
      key: 'video',
      value: 'video',
      label: t('resources.video'),
      content: <div className="text-muted-foreground py-8 text-center">Video resource coming soon...</div>,
    },
    {
      key: 'mindmap',
      value: 'mindmap',
      label: t('resources.mindmap'),
      content: <MindmapTable />,
    },
    {
      key: 'image',
      value: 'image',
      label: t('resources.image'),
      content: <div className="text-muted-foreground py-8 text-center">Image resource coming soon...</div>,
    },
  ];

  return (
    <>
      <div className="space-y-4 px-8 py-4">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <ProjectControls currentResourceType={resourceType as ResourceType} />
        <CommonTabs
          value={resourceType}
          onValueChange={handleResourceChange}
          items={tabItems}
          tabsListClassName="bg-card flex w-full flex-row justify-start rounded-none border-b p-0 mb-2"
          tabsClassName="w-full"
          tabsContentClassName="flex flex-col gap-2"
        />
      </div>
    </>
  );
};

export default ProjectListPage;
