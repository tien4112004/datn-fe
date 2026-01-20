import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import PresentationTable from '@/features/presentation/components/table/PresentationTable';
import PresentationGrid from '@/features/presentation/components/table/PresentationGrid';
import ProjectControls from '@/features/projects/components/ProjectControls';
import CommonTabs, { type TabItem } from '@/shared/components/common/CommonTabs';
import MindmapTable from '@/features/mindmap/components/table/MindmapTable';
import MindmapGrid from '@/features/mindmap/components/table/MindmapGrid';
import type { ResourceType } from '@/shared/constants/resourceTypes';
import Image from '@/features/image';
import AssignmentTable from '@/features/assignment/components/table/AssignmentTable';
import AssignmentGrid from '@/features/assignment/components/table/AssignmentGrid';

const ProjectListPage = () => {
  const { t } = useTranslation('projects');
  const [searchParams, setSearchParams] = useSearchParams();

  const viewMode = searchParams.get('view') || 'list';
  const resourceType = searchParams.get('resource') || 'presentation';

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
      content: viewMode === 'grid' ? <PresentationGrid /> : <PresentationTable />,
    },
    {
      key: 'mindmap',
      value: 'mindmap',
      label: t('resources.mindmap'),
      content: viewMode === 'grid' ? <MindmapGrid /> : <MindmapTable />,
    },
    {
      key: 'assignment',
      value: 'assignment',
      label: t('resources.assignment'),
      content: viewMode === 'grid' ? <AssignmentGrid /> : <AssignmentTable />,
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
