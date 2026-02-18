import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Calendar, Grid3x3, FileText } from 'lucide-react';
import { debounce } from 'lodash';
import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { Tabs, TabsList, TabsTrigger } from '@ui/tabs';
import { Badge } from '@ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@ui/dialog';
import { cn } from '@/shared/lib/utils';
import { useInfiniteMatrixTemplateList } from '../../hooks/useMatrixTemplateApi';
import type { MatrixTemplate, BankType } from '../../types/matrixTemplate';
import type { Grade } from '@aiprimary/core/assessment/grades.js';
import type { SubjectCode } from '@aiprimary/core';

interface MatrixTemplateLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentGrade: Grade | '';
  currentSubject: SubjectCode | '';
  onImport: (template: MatrixTemplate) => void;
}

export const MatrixTemplateLibraryDialog = ({
  open,
  onOpenChange,
  currentGrade,
  currentSubject,
  onImport,
}: MatrixTemplateLibraryDialogProps) => {
  const { t } = useTranslation('assignment');
  const { t: tCommon } = useTranslation('common');

  const [librarySearch, setLibrarySearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [bankType, setBankType] = useState<BankType>('personal'); // Default to personal

  const observerRef = useRef<IntersectionObserver | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetSearch = useCallback(
    debounce((value: string) => setDebouncedSearch(value), 300),
    []
  );

  useEffect(() => {
    return () => debouncedSetSearch.cancel();
  }, [debouncedSetSearch]);

  // Fetch templates filtered by current grade, subject, and bankType
  const { templates, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteMatrixTemplateList(
      open
        ? {
            search: debouncedSearch || undefined,
            subject: currentSubject || undefined,
            grade: currentGrade || undefined,
            bankType, // Filter by personal or public
          }
        : {}
    );

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setLibrarySearch('');
      setDebouncedSearch('');
      setSelectedTemplateId(null);
      setBankType('personal'); // Reset to personal tab
    }
  }, [open]);

  // Clear selection when search changes
  useEffect(() => {
    setSelectedTemplateId(null);
  }, [debouncedSearch]);

  // Infinite scroll callback ref
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

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };

  const handleImportSelected = () => {
    const template = templates.find((t) => t.id === selectedTemplateId);
    if (template) {
      onImport(template);
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('matrixTemplateLibrary.title')}</DialogTitle>
          <DialogDescription>{t('matrixTemplateLibrary.description')}</DialogDescription>
        </DialogHeader>

        {/* Personal/Public Tabs */}
        <Tabs value={bankType} onValueChange={(value) => setBankType(value as BankType)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal">{t('matrixTemplateLibrary.tabs.personal')}</TabsTrigger>
            <TabsTrigger value="public">{t('matrixTemplateLibrary.tabs.public')}</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search and filters */}
        <div className="space-y-3">
          <Input
            value={librarySearch}
            onChange={handleSearchChange}
            placeholder={t('matrixTemplateLibrary.searchPlaceholder')}
          />

          {/* Filter chips */}
          {(currentGrade || currentSubject) && (
            <div className="flex gap-2 text-xs">
              {currentGrade && (
                <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  {tCommon('grade')}: {String(currentGrade)}
                </span>
              )}
              {currentSubject && (
                <span className="rounded-full bg-green-100 px-2 py-1 text-green-700 dark:bg-green-900 dark:text-green-300">
                  {tCommon('subject')}: {currentSubject}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Template list */}
        <div className="!max-h-[400px] overflow-y-auto">
          {isLoading && templates.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">{t('matrixTemplateLibrary.loading')}</div>
          ) : templates.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">
              {t('matrixTemplateLibrary.noTemplates')}
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((template: any) => {
                const isSelected = selectedTemplateId === template.id;
                const isCompatible =
                  (!currentGrade || template.grade === currentGrade) &&
                  (!currentSubject || template.subject === currentSubject);

                return (
                  <button
                    key={template.id}
                    type="button"
                    disabled={!isCompatible}
                    onClick={() => handleTemplateSelect(template.id)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-all',
                      !isCompatible
                        ? 'cursor-not-allowed border-gray-200 opacity-50'
                        : isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-sm dark:border-blue-600 dark:bg-blue-900/20'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800'
                    )}
                  >
                    {/* Radio indicator */}
                    <div
                      className={cn(
                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                        isSelected ? 'border-blue-600' : 'border-gray-300 dark:border-gray-600'
                      )}
                    >
                      {isSelected && <div className="h-3 w-3 rounded-full bg-blue-600"></div>}
                    </div>

                    {/* Template info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="truncate font-medium text-gray-900 dark:text-gray-100">
                          {template.name}
                        </h4>
                        <div className="flex gap-2">
                          {template.ownerId === null && (
                            <Badge variant="outline" className="shrink-0">
                              {t('matrixTemplateLibrary.badges.public')}
                            </Badge>
                          )}
                          {!isCompatible && (
                            <span className="shrink-0 text-xs text-amber-600">
                              {t('matrixTemplateLibrary.badges.incompatible')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Template metadata */}
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Grid3x3 className="h-3 w-3" />
                          {template.totalTopics} {t('matrixTemplateLibrary.metadata.topics')}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {template.totalQuestions} {t('matrixTemplateLibrary.metadata.questions')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(template.createdAt)}
                        </span>
                      </div>

                      {/* Grade and subject badges */}
                      <div className="mt-2 flex gap-1.5">
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          {template.grade}
                        </span>
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          {template.subject}
                        </span>
                      </div>
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
            {tCommon('table.cancel')}
          </Button>
          <Button type="button" size="sm" onClick={handleImportSelected} disabled={!selectedTemplateId}>
            {t('matrixTemplateLibrary.importTemplate')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
