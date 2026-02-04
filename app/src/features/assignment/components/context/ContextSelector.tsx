import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronsUpDown, X, BookOpen } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command';
import { useContextList } from '../../hooks/useContextApi';
import { useAssignmentFormStore } from '../../stores/useAssignmentFormStore';

interface ContextSelectorProps {
  value?: string;
  onChange: (contextId: string | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const ContextSelector = ({
  value,
  onChange,
  disabled = false,
  placeholder,
  className,
}: ContextSelectorProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'context' });
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get form store actions for context cloning
  const assignmentContexts = useAssignmentFormStore((state) => state.contexts);
  const addContext = useAssignmentFormStore((state) => state.addContext);
  const getContextBySourceId = useAssignmentFormStore((state) => state.getContextBySourceId);

  const { data, isLoading } = useContextList({
    search: searchQuery || undefined,
    pageSize: 20,
  });

  const contexts = data?.contexts || [];

  // Look up selected context from assignment's cloned contexts first, then from library
  const selectedContext = useMemo(() => {
    if (!value) return null;
    // First check assignment's cloned contexts
    const localContext = assignmentContexts.find((ctx) => ctx.id === value);
    if (localContext) {
      return { id: localContext.id, title: localContext.title, content: localContext.content };
    }
    // Fallback to library contexts (for backwards compatibility)
    return contexts.find((ctx) => ctx.id === value) || null;
  }, [value, assignmentContexts, contexts]);

  const handleSelect = (sourceContextId: string) => {
    // Find the source context from library
    const sourceContext = contexts.find((ctx) => ctx.id === sourceContextId);
    if (!sourceContext) return;

    // Check if this context is already cloned in the assignment
    let localContextId = getContextBySourceId(sourceContextId)?.id;

    if (!localContextId) {
      // Clone the context to the assignment
      localContextId = addContext({
        title: sourceContext.title,
        content: sourceContext.content,
        author: sourceContext.author,
        sourceContextId: sourceContextId,
      });
    }

    // Toggle selection: if already selected, deselect
    if (localContextId === value) {
      onChange(undefined);
    } else {
      onChange(localContextId);
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-between', className)}
        >
          <div className="flex items-center gap-2 truncate">
            {selectedContext ? (
              <>
                <BookOpen className="h-4 w-4 shrink-0 text-blue-600" />
                <span className="truncate">{selectedContext.title}</span>
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder || t('selectContext')}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {value && <X className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100" onClick={handleClear} />}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder={t('searchContext')} value={searchQuery} onValueChange={setSearchQuery} />
          <CommandList>
            {isLoading ? (
              <div className="text-muted-foreground py-6 text-center text-sm">{t('loading')}</div>
            ) : contexts.length === 0 ? (
              <CommandEmpty>{t('noContextFound')}</CommandEmpty>
            ) : (
              <CommandGroup>
                {contexts.map((context) => {
                  // Check if this library context is cloned and currently selected
                  const clonedContext = getContextBySourceId(context.id);
                  const isSelected = value && clonedContext?.id === value;

                  return (
                    <CommandItem
                      key={context.id}
                      value={context.id}
                      onSelect={() => handleSelect(context.id)}
                      className="flex items-start gap-2 py-3"
                    >
                      <Check
                        className={cn('mt-0.5 h-4 w-4 shrink-0', isSelected ? 'opacity-100' : 'opacity-0')}
                      />
                      <div className="flex flex-col gap-1 overflow-hidden">
                        <span className="truncate font-medium">{context.title}</span>
                        <span className="text-muted-foreground line-clamp-2 text-xs">
                          {context.content.substring(0, 100)}
                          {context.content.length > 100 ? '...' : ''}
                        </span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
