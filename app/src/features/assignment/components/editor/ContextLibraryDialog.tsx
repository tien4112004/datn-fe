import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Loader2 } from 'lucide-react';
import { debounce } from 'lodash';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { cn } from '@/shared/lib/utils';
import { useInfiniteContextList } from '@/features/context';
import type { Context } from '@/features/context';

interface ContextLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingTitles: Set<string>;
  onImport: (contexts: Context[]) => void;
  defaultSubject?: string;
  defaultGrade?: string;
}

export const ContextLibraryDialog = ({
  open,
  onOpenChange,
  existingTitles,
  onImport,
  defaultSubject,
  defaultGrade,
}: ContextLibraryDialogProps) => {
  const { t } = useTranslation('assignment', {
    keyPrefix: 'assignmentEditor.contextsPanel',
  });

  const [librarySearch, setLibrarySearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedLibraryIds, setSelectedLibraryIds] = useState<Set<string>>(new Set());

  const observerRef = useRef<IntersectionObserver | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetSearch = useCallback(
    debounce((value: string) => setDebouncedSearch(value), 300),
    []
  );

  useEffect(() => {
    return () => debouncedSetSearch.cancel();
  }, [debouncedSetSearch]);

  const { contexts, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteContextList(
    open
      ? {
          search: debouncedSearch || undefined,
          ...(defaultSubject ? { subject: [defaultSubject] } : {}),
          ...(defaultGrade ? { grade: [defaultGrade] } : {}),
        }
      : {}
  );

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setLibrarySearch('');
      setDebouncedSearch('');
      setSelectedLibraryIds(new Set());
    }
  }, [open]);

  // Clear selections when search changes
  useEffect(() => {
    setSelectedLibraryIds(new Set());
  }, [debouncedSearch]);

  // Callback ref for infinite scroll sentinel — fires when the element mounts/unmounts.
  // Uses root: null (viewport) because Radix Dialog renders via portal,
  // and IntersectionObserver still respects overflow clipping from ancestor elements.
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (!node) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(node);
      observerRef.current = observer;
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLibrarySearch(e.target.value);
    debouncedSetSearch(e.target.value);
  };

  const toggleLibrarySelection = (id: string) => {
    setSelectedLibraryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleImportSelected = () => {
    const toImport = contexts.filter((ctx) => selectedLibraryIds.has(ctx.id));
    onImport(toImport);
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('fromLibraryTitle')}</DialogTitle>
          <DialogDescription>{t('fromLibraryDescription')}</DialogDescription>
        </DialogHeader>

        <Input value={librarySearch} onChange={handleSearchChange} placeholder={t('searchLibrary')} />

        <div className="!max-h-[400px] overflow-y-auto">
          {isLoading && contexts.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">{t('loadingLibrary')}</div>
          ) : contexts.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">{t('noLibraryContextFound')}</div>
          ) : (
            <div className="space-y-1">
              {contexts.map((ctx) => {
                const alreadyExists = existingTitles.has(ctx.title.toLowerCase());
                const isSelected = selectedLibraryIds.has(ctx.id);

                return (
                  <button
                    key={ctx.id}
                    type="button"
                    disabled={alreadyExists}
                    onClick={() => toggleLibrarySelection(ctx.id)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-md px-3 py-3 text-left transition-colors',
                      alreadyExists
                        ? 'cursor-not-allowed opacity-50'
                        : isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                  >
                    <div
                      className={cn(
                        'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 dark:border-gray-600'
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{ctx.title}</span>
                        {alreadyExists && (
                          <span className="shrink-0 text-xs text-gray-400">{t('alreadyAdded')}</span>
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                        {ctx.content.substring(0, 120)}
                        {ctx.content.length > 120 ? '...' : ''}
                      </p>
                    </div>
                  </button>
                );
              })}

              {/* Infinite scroll sentinel */}
              <div ref={loadMoreRef} className="py-2 text-center">
                {isFetchingNextPage && <Loader2 className="mx-auto h-5 w-5 animate-spin text-gray-400" />}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
            {t('cancel')}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleImportSelected}
            disabled={selectedLibraryIds.size === 0}
          >
            {t('importSelected', { count: selectedLibraryIds.size })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
