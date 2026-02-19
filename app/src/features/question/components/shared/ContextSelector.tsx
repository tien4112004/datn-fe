import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronsUpDown, X, BookOpen } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@ui/command';
import { useContextList, useContext } from '@/features/context';

interface ContextSelectorProps {
  value?: string;
  onChange: (contextId: string | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * A reusable context selector that fetches contexts from the library.
 * Unlike the assignment ContextSelector, this does not clone contexts -
 * it simply returns the library context ID directly.
 */
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

  // Fetch contexts from library with search
  const { data, isLoading } = useContextList({
    search: searchQuery || undefined,
    pageSize: 20,
  });

  const contexts = data?.contexts || [];

  // Fetch the selected context details
  const { data: selectedContext } = useContext(value);

  const handleSelect = (contextId: string) => {
    // Toggle selection: if already selected, deselect
    if (contextId === value) {
      onChange(undefined);
    } else {
      onChange(contextId);
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
                  const isSelected = context.id === value;

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
