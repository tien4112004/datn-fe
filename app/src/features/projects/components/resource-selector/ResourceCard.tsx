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
        'relative flex w-full cursor-pointer flex-col items-start rounded-lg border p-3 text-left',
        'transition-all duration-200',
        'hover:scale-[1.02] hover:shadow-md',
        isSelected && 'border-primary bg-primary/5 ring-primary/20 shadow-sm ring-2'
      )}
    >
      {/* Selection indicator */}
      <div
        className={cn(
          'absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full',
          'border-2 transition-all duration-200',
          isSelected
            ? 'border-primary bg-primary text-primary-foreground shadow-sm'
            : 'border-muted-foreground/40 bg-background'
        )}
      >
        {isSelected && <Check className="h-4 w-4" />}
      </div>

      {/* Thumbnail or icon */}
      <div className="from-muted/50 to-muted mb-3 flex aspect-video w-full items-center justify-center overflow-hidden rounded-md bg-gradient-to-br">
        {resource.thumbnail ? (
          <img
            src={resource.thumbnail}
            alt={resource.title}
            className="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
          />
        ) : (
          <Icon className="text-muted-foreground/60 h-12 w-12" />
        )}
      </div>

      {/* Title */}
      <div className="flex w-full items-center gap-2">
        <Icon className="text-muted-foreground h-4 w-4 flex-shrink-0" />
        <span className="truncate text-sm font-medium">{resource.title}</span>
      </div>
    </button>
  );
};
