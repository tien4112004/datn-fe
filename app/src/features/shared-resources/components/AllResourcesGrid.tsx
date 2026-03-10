import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Badge } from '@ui/badge';
import { BrainCircuit, Presentation, ClipboardList } from 'lucide-react';
import ViewToggle, { type ViewMode } from '@/features/presentation/components/others/ViewToggle';
import { useAllDocuments } from '@/features/dashboard/hooks';
import type { DocumentItem } from '@/features/dashboard/api/types';
import { DocumentFilters } from '@/features/projects/components/DocumentFilters';
import { SkeletonGrid } from '@ui/skeleton-card';

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  mindmap: BrainCircuit,
  presentation: Presentation,
  assignment: ClipboardList,
};

const AllResourcesGrid = () => {
  const { t } = useTranslation('common', { keyPrefix: 'table' });
  const { t: tProjects } = useTranslation('projects');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const viewMode = (searchParams.get('view') as ViewMode) || 'grid';
  const setViewMode = (mode: ViewMode) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('view', mode);
      return newParams;
    });
  };

  const [search, setSearch] = useState('');
  const [documentFilters, setDocumentFilters] = useState<{
    subject?: string;
    grade?: string;
    chapter?: string;
  }>({});

  const { documents, isLoading } = useAllDocuments({
    page: 1,
    pageSize: 100,
    sort: 'desc',
    filter: search || undefined,
    subject: documentFilters.subject,
    grade: documentFilters.grade,
    chapter: documentFilters.chapter,
  });

  const handleCardClick = (item: DocumentItem) => {
    const path =
      item.type === 'mindmap'
        ? `/mindmap/${item.id}`
        : item.type === 'assignment'
          ? `/assignment/${item.id}`
          : `/presentation/${item.id}`;
    navigate(path);
  };

  const ResourceCard = ({ item }: { item: DocumentItem }) => {
    const Icon = TYPE_ICONS[item.type] ?? Presentation;
    const typeLabel =
      item.type === 'mindmap'
        ? tProjects('resources.mindmap')
        : item.type === 'assignment'
          ? tProjects('resources.assignment')
          : tProjects('resources.presentation');

    return (
      <div className="group w-full cursor-pointer" onClick={() => handleCardClick(item)}>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100 transition-shadow duration-200 hover:shadow-md">
          {item.thumbnail ? (
            <img
              src={item.thumbnail}
              alt={item.title || 'Thumbnail'}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="bg-muted/50 flex h-full w-full items-center justify-center">
              <Icon className="text-muted-foreground h-12 w-12" />
            </div>
          )}
          <div className="absolute left-2 top-2">
            <Badge variant="outline" className="bg-white/90 text-xs">
              {typeLabel}
            </Badge>
          </div>
        </div>
        <div className="mt-3">
          <h3 className="truncate text-sm font-medium">{item.title || t('sharedResources.untitled')}</h3>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <DocumentFilters
          filters={documentFilters}
          onChange={setDocumentFilters}
          searchQuery={search}
          onSearchChange={setSearch}
          searchPlaceholder={t('allResources.searchPlaceholder')}
          RightComponent={<ViewToggle value={viewMode} onValueChange={setViewMode} />}
        />
        <SkeletonGrid count={10} />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <DocumentFilters
        filters={documentFilters}
        onChange={setDocumentFilters}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('allResources.searchPlaceholder')}
        RightComponent={<ViewToggle value={viewMode} onValueChange={setViewMode} />}
      />
      {documents.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {documents.map((item) => (
            <ResourceCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground py-12 text-center">{t('allResources.emptyState')}</div>
      )}
    </div>
  );
};

export default AllResourcesGrid;
