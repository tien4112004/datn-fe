import { Loader2 } from 'lucide-react';
import { useLinkedResources } from '../hooks/useLinkedResources';
import type { LinkedResourceResponse } from '@/features/projects/types/resource';
import { ResourceCard } from './ResourceCard';

interface LinkedResourcesPreviewProps {
  resources: LinkedResourceResponse[];
}

export const LinkedResourcesPreview = ({ resources: linkedResources }: LinkedResourcesPreviewProps) => {
  const { data: resources, isLoading } = useLinkedResources({
    linkedResources,
  });

  if (isLoading) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading resources...</span>
      </div>
    );
  }

  if (!resources || resources.length === 0) {
    return null;
  }

  return (
    <div className="grid auto-rows-fr grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-2">
      {resources.map((resource) => (
        <ResourceCard
          key={`${resource.type}:${resource.id}`}
          id={resource.id}
          type={resource.type}
          title={resource.title}
          thumbnail={resource.thumbnail}
          permissionLevel={resource.permissionLevel}
          variant="compact"
        />
      ))}
    </div>
  );
};
