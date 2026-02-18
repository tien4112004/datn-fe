import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronsUpDown, BookOpen } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@ui/command';
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

  // Read assignment-local contexts from the store
  const assignmentContexts = useAssignmentFormStore((state) => state.contexts);

  // Filter by search query
  const filteredContexts = useMemo(() => {
    if (!searchQuery) return assignmentContexts;
    const q = searchQuery.toLowerCase();
    return assignmentContexts.filter(
      (ctx) => ctx.title.toLowerCase().includes(q) || ctx.content.toLowerCase().includes(q)
    );
  }, [assignmentContexts, searchQuery]);

  // Find selected context
  const selectedContext = useMemo(() => {
    if (!value) return null;
    return assignmentContexts.find((ctx) => ctx.id === value) || null;
  }, [value, assignmentContexts]);

  const handleSelect = (contextId: string) => {
    // Toggle: if already selected, deselect
    if (contextId === value) {
      onChange(undefined);
    } else {
      onChange(contextId);
    }
    setOpen(false);
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
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder={t('searchContext')} value={searchQuery} onValueChange={setSearchQuery} />
          <CommandList>
            {filteredContexts.length === 0 ? (
              <CommandEmpty>{t('noContextFound')}</CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredContexts.map((context) => {
                  const isSelected = value === context.id;

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
