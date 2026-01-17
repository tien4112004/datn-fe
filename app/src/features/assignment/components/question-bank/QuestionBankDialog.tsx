import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import type { Question } from '../../types';
import useQuestionBankStore from '../../stores/questionBankStore';
import { QuestionBankFilters } from './QuestionBankFilters';
import { QuestionBankGrid } from './QuestionBankGrid';

interface QuestionBankDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddQuestions: (questions: Question[]) => void;
}

export const QuestionBankDialog = ({ open, onOpenChange, onAddQuestions }: QuestionBankDialogProps) => {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT);
  const { selectedQuestions, clearSelection, filters, setFilters } = useQuestionBankStore();

  // Detect if we're in public bank mode
  const isApplicationBank = filters.bankType === 'public';

  // Clear selection when dialog closes
  useEffect(() => {
    if (!open) {
      clearSelection();
    }
  }, [open, clearSelection]);

  const handleAddSelected = () => {
    if (selectedQuestions.length > 0) {
      onAddQuestions(selectedQuestions);
      onOpenChange(false);
    }
  };

  const handleCopyToPersonal = () => {
    if (selectedQuestions.length === 0) return;

    // TODO: When backend is ready, call API to copy questions to personal bank
    // For now, just show success message
    // const duplicatedQuestions = selectedQuestions.map((q) => ({
    //   ...q,
    //   id: `copied-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    //   bankType: 'personal' as const,
    //   createdAt: new Date().toISOString(),
    //   updatedAt: new Date().toISOString(),
    // }));

    // Show success message
    alert(t('questionBank.copyToPersonal.success', { count: selectedQuestions.length }));

    // Clear selection and switch to personal tab
    clearSelection();
    setFilters({ bankType: 'personal' });
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

        {/* Bank Type Tabs */}
        <Tabs
          value={filters.bankType || 'personal'}
          onValueChange={(value) => setFilters({ bankType: value as 'personal' | 'public' })}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal">{t('questionBank.bankTypes.personal')}</TabsTrigger>
            <TabsTrigger value="public">{t('questionBank.bankTypes.application')}</TabsTrigger>
          </TabsList>
        </Tabs>

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
            <Button variant="outline" onClick={handleCancel}>
              {t('questionBank.selection.cancel')}
            </Button>
            {isApplicationBank ? (
              <Button onClick={handleCopyToPersonal} disabled={selectedQuestions.length === 0}>
                {t('questionBank.selection.copyToPersonal', { count: selectedQuestions.length })}
              </Button>
            ) : (
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
