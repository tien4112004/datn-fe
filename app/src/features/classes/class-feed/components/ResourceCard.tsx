import { Link } from 'react-router-dom';
import { BrainCircuit, Presentation, ClipboardList, ExternalLink } from 'lucide-react';
import type { LinkedResourceType } from '@/features/projects/types/resource';
import { PermissionBadge } from '@/shared/components/common/PermissionBadge';

interface ResourceCardProps {
  id: string;
  type: LinkedResourceType;
  title: string;
  thumbnail?: string;
  permissionLevel?: string;
  variant?: 'card' | 'compact';
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

export const ResourceCard = ({
  id,
  type,
  title,
  thumbnail,
  permissionLevel,
  variant = 'card',
}: ResourceCardProps) => {
  let baseRoute = resourceTypeRoutes[type];

  // If we are in student view, prepend /student to the route
  if (window.location.pathname.startsWith('/student')) {
    baseRoute = `/student${baseRoute}`;
  }

  const Icon = resourceTypeIcons[type];
  const colorClasses = resourceTypeColors[type];
  const iconColorClass = resourceTypeIconColors[type];

  // Map 'view' to 'read' for PermissionBadge compatibility
  const badgePermission = permissionLevel === 'view' ? 'read' : permissionLevel;
  // Only show badge for presentation and mindmap (not assignment)
  const showBadge = (type === 'presentation' || type === 'mindmap') && badgePermission;

  // Compact variant - inline horizontal layout (for posts)
  if (variant === 'compact') {
    return (
      <Link
        to={`${baseRoute}/${id}`}
        className={`group flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm transition-colors ${colorClasses}`}
      >
        <Icon className={`h-4 w-4 flex-shrink-0 ${iconColorClass}`} />
        <span className="min-w-0 flex-1 truncate">{title}</span>
        {showBadge && <PermissionBadge permission={badgePermission as 'read' | 'comment' | 'edit'} />}
        <ExternalLink className="text-muted-foreground h-3 w-3 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
      </Link>
    );
  }

  // Card variant - vertical card layout (for resources tab)
  return (
    <Link
      to={`${baseRoute}/${id}`}
      className="hover:bg-muted/50 bg-card group flex flex-col rounded-lg border p-3 transition-colors sm:p-4"
    >
      <div className="bg-muted mb-2 aspect-video w-full overflow-hidden rounded-md sm:mb-3">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Icon className="text-muted-foreground h-8 w-8 sm:h-12 sm:w-12" />
          </div>
        )}
      </div>
      <h3 className="mb-1 line-clamp-2 text-xs font-medium sm:text-sm">{title}</h3>
      {showBadge && (
        <div className="mt-1">
          <PermissionBadge permission={badgePermission as 'read' | 'comment' | 'edit'} />
        </div>
      )}
    </Link>
  );
};
