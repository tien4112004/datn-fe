import { Link } from 'react-router-dom';
import { BrainCircuit, Presentation, ClipboardList, Loader2, ExternalLink } from 'lucide-react';
import { useLinkedResources } from '../hooks/useLinkedResources';
import type { LinkedResourceType, LinkedResourceResponse } from '@/features/projects/types/resource';
import { PermissionBadge } from '@/shared/components/common/PermissionBadge';

interface LinkedResourcesPreviewProps {
  resources: LinkedResourceResponse[];
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

const resourceTypeColors: Record<LinkedResourceType, string> = {
  presentation: 'bg-amber-50 border-amber-200 hover:bg-amber-100',
  mindmap: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
  assignment: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
};

const resourceTypeIconColors: Record<LinkedResourceType, string> = {
  presentation: 'text-amber-600',
  mindmap: 'text-purple-600',
  assignment: 'text-blue-600',
};

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
      {resources.map((resource) => {
        const Icon = resourceTypeIcons[resource.type];
        const baseRoute = resourceTypeRoutes[resource.type];
        const colorClasses = resourceTypeColors[resource.type];
        const iconColorClass = resourceTypeIconColors[resource.type];
        // Map 'view' to 'read' for PermissionBadge compatibility
        const badgePermission = resource.permissionLevel === 'view' ? 'read' : resource.permissionLevel;
        // Only show badge for presentation and mindmap (not assignment)
        const showBadge = resource.type === 'presentation' || resource.type === 'mindmap';

        return (
          <Link
            key={`${resource.type}:${resource.id}`}
            to={`${baseRoute}/${resource.id}`}
            className={`group flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm transition-colors ${colorClasses}`}
          >
            <Icon className={`h-4 w-4 flex-shrink-0 ${iconColorClass}`} />
            <span className="min-w-0 flex-1 truncate">{resource.title}</span>
            {showBadge && badgePermission && (
              <PermissionBadge permission={badgePermission as 'read' | 'comment' | 'edit'} />
            )}
            <ExternalLink className="text-muted-foreground h-3 w-3 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        );
      })}
    </div>
  );
};
