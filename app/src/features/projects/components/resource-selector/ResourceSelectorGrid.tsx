import { useTranslation } from 'react-i18next';
import { ResourceCard } from './ResourceCard';
import type { LinkedResource, LinkedResourceType } from '../../types/resource';
import { Loader2 } from 'lucide-react';

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
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (filteredResources.length === 0) {
    return (
      <div className="text-muted-foreground flex h-48 items-center justify-center text-sm">
        {searchQuery ? t('feed.resourceSelector.noSearchResults') : t('feed.resourceSelector.noResources')}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
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
