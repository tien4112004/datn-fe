import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@ui/alert-dialog';
import { ArrowLeft, CheckCircle2, Plus, Sparkles, X } from 'lucide-react';
import type { QuestionBankItem } from '@/features/question-bank/types';
import type { Question } from '@aiprimary/core';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { GeneratedQuestionsResultList } from '@aiprimary/question/shared';
import { QuestionRenderer } from '@/features/question/components/QuestionRenderer';
import { VIEW_MODE } from '@/features/assignment/types';

interface QuestionGenerateResultPanelProps {
  questions: QuestionBankItem[];
  totalGenerated: number;
  generationParams: {
    prompt: string;
    grade: string;
    subject: string;
    chapter?: string;
  };
  onBack: () => void;
  onNewGeneration: () => void;
  onClose?: () => void;
  onApply?: (questions: QuestionBankItem[]) => void;
}

export function QuestionGenerateResultPanel({
  questions,
  totalGenerated,
  onBack,
  onNewGeneration,
  onClose,
  onApply,
}: QuestionGenerateResultPanelProps) {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, { keyPrefix: 'generatedQuestions' });

  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [showNewGenerationConfirm, setShowNewGenerationConfirm] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('resultPanel.generationComplete')}
            </h2>
            <p className="text-muted-foreground text-sm">
              {t('resultPanel.successMessage', { count: totalGenerated })}
            </p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Questions List */}
      <GeneratedQuestionsResultList
        questions={questions}
        className="px-2"
        renderQuestion={(question) => (
          <QuestionRenderer question={question as Question} viewMode={VIEW_MODE.VIEWING} />
        )}
      />

      {/* Footer Actions */}
      <div className="border-t px-2 pt-4">
        <div className="flex justify-between gap-2">
          <Button variant="outline" onClick={() => setShowBackConfirm(true)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t('resultPanel.backToForm')}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowNewGenerationConfirm(true)} className="gap-2">
              <Sparkles className="h-4 w-4" />
              {t('resultPanel.newGeneration')}
            </Button>
            {onApply && (
              <Button
                onClick={() => {
                  onApply(questions);
                  onClose?.();
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                {t('resultPanel.addToAssignment')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Back to Form Confirmation */}
      <AlertDialog open={showBackConfirm} onOpenChange={setShowBackConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('resultPanel.backToFormConfirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('resultPanel.backToFormConfirm.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('resultPanel.confirmDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={onBack}>{t('resultPanel.confirmDialog.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New Generation Confirmation */}
      <AlertDialog open={showNewGenerationConfirm} onOpenChange={setShowNewGenerationConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('resultPanel.newGenerationConfirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('resultPanel.newGenerationConfirm.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('resultPanel.confirmDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={onNewGeneration}>
              {t('resultPanel.confirmDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
