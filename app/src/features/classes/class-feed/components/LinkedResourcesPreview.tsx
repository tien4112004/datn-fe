import { Link } from 'react-router-dom';
import { BrainCircuit, Presentation, ClipboardList, Loader2 } from 'lucide-react';
import { useLinkedResources } from '../hooks/useLinkedResources';
import type { LinkedResourceType } from '../types/resource';

interface LinkedResourcesPreviewProps {
  resourceIds: string[];
}

const resourceTypeIcons: Record<LinkedResourceType, React.ElementType> = {
  mindmap: BrainCircuit,
  presentation: Presentation,
  assignment: ClipboardList,
};

const resourceTypeRoutes: Record<LinkedResourceType, string> = {
  mindmap: '/mindmap',
  presentation: '/presentation',
  assignment: '/assignment',
};

export const LinkedResourcesPreview = ({ resourceIds }: LinkedResourcesPreviewProps) => {
  const { data: resources, isLoading } = useLinkedResources({
    compositeIds: resourceIds,
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
    <div className="flex flex-wrap gap-2">
      {resources.map((resource) => {
        const Icon = resourceTypeIcons[resource.type];
        const baseRoute = resourceTypeRoutes[resource.type];

        return (
          <Link
            key={`${resource.type}:${resource.id}`}
            to={`${baseRoute}/${resource.id}`}
            className="bg-muted/30 hover:bg-muted/60 flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm transition-colors"
          >
            <Icon className="text-muted-foreground h-4 w-4" />
            <span className="max-w-[200px] truncate">{resource.title}</span>
          </Link>
        );
      })}
    </div>
  );
};
