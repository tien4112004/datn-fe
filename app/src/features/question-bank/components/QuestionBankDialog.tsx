import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@ui/dialog';
import { Button } from '@ui/button';
import { Tabs, TabsList, TabsTrigger } from '@ui/tabs';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { toast } from 'sonner';
import type { Question } from '@aiprimary/core';
import useQuestionBankStore from '../stores/questionBankStore';
import { useCreateQuestions } from '../hooks/useQuestionBankApi';
import { QuestionBankFilters } from './QuestionBankFilters';
import { QuestionBankGrid } from './QuestionBankGrid';

interface QuestionBankDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddQuestions: (questions: Question[]) => void;
  mode?: 'add-to-assignment' | 'copy-to-personal';
}

export const QuestionBankDialog = ({
  open,
  onOpenChange,
  onAddQuestions,
  mode = 'add-to-assignment',
}: QuestionBankDialogProps) => {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT);
  const { selectedQuestions, clearSelection, filters, setFilters } = useQuestionBankStore();
  const [isCopying, setIsCopying] = useState(false);
  const createQuestionsMutation = useCreateQuestions();

  // Determine dialog behavior based on mode
  const showBothTabs = mode === 'add-to-assignment';

  // Clear selection when dialog closes
  useEffect(() => {
    if (!open) {
      clearSelection();
    }
  }, [open, clearSelection]);

  // Force public bank in copy-to-personal mode
  useEffect(() => {
    if (mode === 'copy-to-personal' && open && filters.bankType !== 'public') {
      setFilters({ bankType: 'public' });
    }
  }, [mode, open, filters.bankType, setFilters]);

  const handleAddSelected = () => {
    if (selectedQuestions.length > 0) {
      onAddQuestions(selectedQuestions);
      onOpenChange(false);
    }
  };

  const handleCopyToPersonal = async () => {
    if (selectedQuestions.length === 0) return;

    setIsCopying(true);
    try {
      // Use selectedQuestions data directly (already fetched from GET all)
      // Strip out id, createdAt, updatedAt - backend will create new personal copies
      const questionsToCreate = selectedQuestions.map((q) => ({
        type: q.type,
        difficulty: q.difficulty,
        title: q.title,
        titleImageUrl: q.titleImageUrl,
        explanation: q.explanation,
        grade: q.grade,
        chapter: q.chapter,
        subject: q.subject,
        data: q.data,
      }));

      // Bulk create questions - backend assigns current user as owner
      await createQuestionsMutation.mutateAsync(questionsToCreate);

      // Show success message
      toast.success(t('questionBank.copyToPersonal.success', { count: selectedQuestions.length }));

      // Clear selection and switch to personal tab
      clearSelection();
      setFilters({ bankType: 'personal' });
    } catch (error) {
      console.error('Failed to copy questions:', error);
      toast.error(t('questionBank.copyToPersonal.error') || 'Failed to copy questions to personal bank');
    } finally {
      setIsCopying(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] !max-w-6xl flex-col overflow-hidden rounded-3xl border-2 shadow-2xl">
        {/* Header */}
        <DialogHeader>
          <DialogTitle>{t('questionBank.title')}</DialogTitle>
          <DialogDescription>{t('questionBank.subtitle')}</DialogDescription>
        </DialogHeader>

        {/* Bank Type Tabs - Only show if in add-to-assignment mode */}
        {showBothTabs && (
          <Tabs
            value={filters.bankType || 'personal'}
            onValueChange={(value) => setFilters({ bankType: value as 'personal' | 'public' })}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal">{t('questionBank.bankTypes.personal')}</TabsTrigger>
              <TabsTrigger value="public">{t('questionBank.bankTypes.application')}</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* Filters */}
        <div className="gap-3 py-2">
          <QuestionBankFilters />
        </div>

        {/* Grid - Scrollable */}
        <div className="flex-1 overflow-y-auto pr-2">
          <QuestionBankGrid />
        </div>

        {/* Footer */}
        <DialogFooter className="flex-row items-center justify-between gap-2 sm:justify-between">
          {/* Selection Count */}
          <div className="text-muted-foreground text-sm">
            {selectedQuestions.length > 0 ? (
              t('questionBank.selection.selected', { count: selectedQuestions.length })
            ) : (
              <span>&nbsp;</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={isCopying}>
              {t('questionBank.selection.cancel')}
            </Button>

            {/* Mode-based button rendering */}
            {mode === 'copy-to-personal' ? (
              // Copy to Personal mode: Always show copy button
              <Button onClick={handleCopyToPersonal} disabled={selectedQuestions.length === 0 || isCopying}>
                {isCopying
                  ? t('questionBank.selection.copying')
                  : t('questionBank.selection.copySelected', { count: selectedQuestions.length })}
              </Button>
            ) : (
              // Add to Assignment mode: Always add to assignment (both personal and public tabs)
              <Button onClick={handleAddSelected} disabled={selectedQuestions.length === 0}>
                {t('questionBank.selection.addSelected', { count: selectedQuestions.length })}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
