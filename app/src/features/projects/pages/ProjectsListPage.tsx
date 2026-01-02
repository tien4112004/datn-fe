import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import PresentationTable from '@/features/presentation/components/table/PresentationTable';
import PresentationGrid from '@/features/presentation/components/table/PresentationGrid';
import ProjectControls from '@/features/projects/components/ProjectControls';
import ViewToggle, { type ViewMode } from '@/features/presentation/components/others/ViewToggle';
import CommonTabs, { type TabItem } from '@/shared/components/common/CommonTabs';
import MindmapTable from '@/features/mindmap/components/table/MindmapTable';
import type { ResourceType } from '@/shared/constants/resourceTypes';
import Image from '@/features/image';

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
      label: t('resources.image', 'Image'),
      content: <Image.ImageGalleryPage />,
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col overflow-auto">
        <div className="mx-auto w-full max-w-7xl space-y-6 px-8 py-12">
          <div className="mb-8 space-y-1">
            <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground text-sm">
              Manage your presentations, documents, videos, mindmaps and images
            </p>
          </div>

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
      </div>
    </div>
  );
};

export default ProjectListPage;
