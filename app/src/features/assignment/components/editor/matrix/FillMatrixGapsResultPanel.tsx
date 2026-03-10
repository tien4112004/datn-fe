import { useTranslation } from 'react-i18next';
import { Button } from '@ui/button';
import { ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react';
import type { Question } from '@aiprimary/core';
import type { QuestionBankItem } from '@/features/question-bank/types';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { GeneratedQuestionsResultList } from '@aiprimary/question/shared';
import { QuestionRenderer } from '@/features/question/components/QuestionRenderer';
import { VIEW_MODE } from '@/features/assignment/types';
import { AiDisclaimer } from '@/shared/components/common/AiDisclaimer';

interface FillMatrixGapsResultPanelProps {
  questions: QuestionBankItem[];
  filledGapsCount: number;
  onBack: () => void;
  onDone: () => void;
}

export function FillMatrixGapsResultPanel({
  questions,
  filledGapsCount,
  onBack,
  onDone,
}: FillMatrixGapsResultPanelProps) {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, {
    keyPrefix: 'assignmentEditor.fillMatrixGaps',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-4">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {String(t('resultPanel.title'))}
          </h2>
          <p className="text-muted-foreground text-sm">
            {String(t('resultPanel.successMessage', { count: questions.length, gaps: filledGapsCount }))}
          </p>
        </div>
      </div>

      <AiDisclaimer />

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
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {String(t('resultPanel.backToGenerate'))}
          </Button>
          <Button onClick={onDone} className="gap-2">
            {String(t('resultPanel.done'))}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
