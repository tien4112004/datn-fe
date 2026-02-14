import { useTranslation } from 'react-i18next';
import { ResourceCard } from './ResourceCard';
import { Skeleton } from '@/shared/components/ui/skeleton';
import type { LinkedResource, LinkedResourceType } from '../../types/resource';
import { Search } from 'lucide-react';

interface ResourceSelectorGridProps {
  resources: LinkedResource[];
  isLoading: boolean;
  isSelected: (type: LinkedResourceType, id: string) => boolean;
  onToggle: (resource: LinkedResource) => void;
  searchQuery: string;
}

export const ResourceSelectorGrid = ({
  resources,
  isLoading,
  isSelected,
  onToggle,
  searchQuery,
}: ResourceSelectorGridProps) => {
  const { t } = useTranslation('classes');

  // Filter resources by search query
  const filteredResources = searchQuery
    ? resources.filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : resources;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-3 rounded-lg border p-3">
            <Skeleton className="aspect-video w-full rounded-md" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (filteredResources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-muted/50 mb-4 rounded-full p-4">
          <Search className="text-muted-foreground/60 h-8 w-8" />
        </div>
        <p className="text-foreground mb-1 text-sm font-medium">
          {searchQuery ? t('feed.resourceSelector.noSearchResults') : t('feed.resourceSelector.noResources')}
        </p>
        {searchQuery && (
          <p className="text-muted-foreground text-xs">
            {t('feed.resourceSelector.tryDifferentSearch', 'Try a different search term')}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 px-1 sm:grid-cols-3 md:grid-cols-4">
      {filteredResources.map((resource) => (
        <ResourceCard
          key={`${resource.type}:${resource.id}`}
          resource={resource}
          isSelected={isSelected(resource.type, resource.id)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
};
