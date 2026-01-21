import { Check, BrainCircuit, Presentation, ClipboardList } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { LinkedResource, LinkedResourceType } from '../../types/resource';

interface ResourceCardProps {
  resource: LinkedResource;
  isSelected: boolean;
  onToggle: (resource: LinkedResource) => void;
}

const resourceTypeIcons: Record<LinkedResourceType, React.ElementType> = {
  mindmap: BrainCircuit,
  presentation: Presentation,
  assignment: ClipboardList,
};

export const ResourceCard = ({ resource, isSelected, onToggle }: ResourceCardProps) => {
  const Icon = resourceTypeIcons[resource.type];

  return (
    <button
      type="button"
      onClick={() => onToggle(resource)}
      className={cn(
        'relative flex w-full flex-col items-start rounded-lg border p-3 text-left transition-colors',
        'hover:bg-muted/50 focus:ring-ring focus:outline-none focus:ring-2 focus:ring-offset-2',
        isSelected && 'border-primary bg-primary/5'
      )}
    >
      {/* Selection indicator */}
      <div
        className={cn(
          'absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full border',
          isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'
        )}
      >
        {isSelected && <Check className="h-3 w-3" />}
      </div>

      {/* Thumbnail or icon */}
      <div className="bg-muted/50 mb-2 flex h-16 w-full items-center justify-center rounded">
        {resource.thumbnail ? (
          <img src={resource.thumbnail} alt={resource.title} className="h-full w-full rounded object-cover" />
        ) : (
          <Icon className="text-muted-foreground h-8 w-8" />
        )}
      </div>

      {/* Title */}
      <div className="flex w-full items-center gap-1.5">
        <Icon className="text-muted-foreground h-3.5 w-3.5 flex-shrink-0" />
        <span className="truncate text-sm font-medium">{resource.title}</span>
      </div>
    </button>
  );
};
