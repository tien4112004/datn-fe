import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SearchBar } from '@/shared/components/common/SearchBar';
import { useSharedResources } from '../hooks';
import type { SharedResource } from '../types';
import { Badge } from '@/components/ui/badge';
import { BrainCircuit, Presentation } from 'lucide-react';
import ViewToggle, { type ViewMode } from '@/features/presentation/components/others/ViewToggle';
import { SkeletonGrid } from '@/shared/components/ui/skeleton-card';

const SharedResourcesGrid = () => {
  const { t } = useTranslation('common', { keyPrefix: 'table' });
  const { t: tProjects } = useTranslation('projects');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');

  const viewMode = (searchParams.get('view') as ViewMode) || 'grid';

  const setViewMode = (mode: ViewMode) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('view', mode);
      return newParams;
    });
  };

  const { data, isLoading } = useSharedResources();

  // Filter data by search term
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const searchLower = search.toLowerCase();
    return data.filter(
      (item) =>
        item.title?.toLowerCase().includes(searchLower) || item.ownerName?.toLowerCase().includes(searchLower)
    );
  }, [data, search]);

  const handleCardClick = (resource: SharedResource) => {
    const path = resource.type === 'mindmap' ? `/mindmap/${resource.id}` : `/presentation/${resource.id}`;
    navigate(path);
  };

  // Inline card component
  const SharedResourceCard = ({ resource }: { resource: SharedResource }) => {
    const Icon = resource.type === 'mindmap' ? BrainCircuit : Presentation;

    return (
      <div className="group w-full cursor-pointer">
        <div
          className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100 transition-shadow duration-200 hover:shadow-md"
          onClick={() => handleCardClick(resource)}
        >
          {/* Thumbnail Image */}
          {resource.thumbnailUrl ? (
            <img
              src={resource.thumbnailUrl}
              alt={resource.title || 'Resource Thumbnail'}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="bg-muted/50 flex h-full w-full items-center justify-center">
              <Icon className="text-muted-foreground h-12 w-12" />
            </div>
          )}

          {/* Type Badge (top left) */}
          <div className="absolute left-2 top-2">
            <Badge variant={resource.type === 'mindmap' ? 'default' : 'secondary'} className="text-xs">
              {resource.type === 'mindmap'
                ? tProjects('resources.mindmap')
                : tProjects('resources.presentation')}
            </Badge>
          </div>

          {/* Permission Badge (top right) */}
          <div className="absolute right-2 top-2">
            <Badge variant="outline" className="bg-white/90 text-xs">
              {resource.permission === 'comment'
                ? t('sharedResources.permissionComment')
                : t('sharedResources.permissionRead')}
            </Badge>
          </div>
        </div>

        {/* Card Footer */}
        <div className="mt-3 space-y-1">
          <h3
            className="cursor-pointer truncate text-sm font-medium text-gray-900 transition-colors hover:text-blue-600"
            onClick={() => handleCardClick(resource)}
          >
            {resource.title || t('sharedResources.untitled')}
          </h3>
          <p className="text-xs text-gray-500">
            {t('sharedResources.sharedBy')}: {resource.ownerName || 'Unknown'}
          </p>
        </div>
      </div>
    );
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between gap-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder={t('sharedResources.searchPlaceholder')}
            className="flex-1 rounded-lg border-2 border-slate-200"
          />
          <ViewToggle value={viewMode} onValueChange={setViewMode} />
        </div>
        <SkeletonGrid count={10} />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={t('sharedResources.searchPlaceholder')}
          className="flex-1 rounded-lg border-2 border-slate-200"
        />
        <ViewToggle value={viewMode} onValueChange={setViewMode} />
      </div>

      {filteredData && filteredData.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredData.map((resource) => (
            <SharedResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-muted-foreground mb-2 text-lg">{t('sharedResources.emptyState')}</div>
          <div className="text-muted-foreground/70 text-sm">{t('sharedResources.emptyStateHint')}</div>
        </div>
      )}
    </div>
  );
};

export default SharedResourcesGrid;
