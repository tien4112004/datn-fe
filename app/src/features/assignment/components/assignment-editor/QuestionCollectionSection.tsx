import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Plus } from 'lucide-react';
import useAssignmentEditorStore from '@/features/assignment/stores/assignmentEditorStore';
import { QuestionCollectionManager } from '@/features/assignment/components/QuestionCollectionManager';
import { QuestionBankDialog } from '@/features/assignment/components/question-bank/QuestionBankDialog';
import type { Question } from '@/features/assignment/types';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { duplicateQuestion } from '@/features/assignment/utils/questionHelpers';

export function QuestionCollectionSection() {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, {
    keyPrefix: 'assignmentEditor.questions',
  });

  const {
    questions,
    isQuestionBankDialogOpen,
    addQuestions,
    reorderQuestions,
    openQuestionBankDialog,
    closeQuestionBankDialog,
  } = useAssignmentEditorStore();

  const totalPoints = questions.reduce((sum, q) => sum + ((q as any).points || 0), 0);

  const handleAddFromBank = (selectedQuestions: Question[]) => {
    // Deep copy questions with new IDs (same pattern as demo)
    const duplicated = selectedQuestions.map(duplicateQuestion);
    addQuestions(duplicated);
    closeQuestionBankDialog();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('title')}</CardTitle>
              {questions.length > 0 && (
                <p className="text-muted-foreground mt-1 text-sm">
                  {t('stats', { count: questions.length, points: totalPoints })}
                </p>
              )}
            </div>
            <Button onClick={openQuestionBankDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('addFromBank')}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {questions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground text-lg font-medium">{t('emptyState.title')}</p>
              <p className="text-muted-foreground mt-2 text-sm">{t('emptyState.description')}</p>
              <Button onClick={openQuestionBankDialog} variant="outline" className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                {t('addFromBank')}
              </Button>
            </div>
          ) : (
            <QuestionCollectionManager questions={questions} onChange={reorderQuestions} viewMode="editing" />
          )}
        </CardContent>
      </Card>

      <QuestionBankDialog
        open={isQuestionBankDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeQuestionBankDialog();
        }}
        onAddQuestions={handleAddFromBank}
      />
    </>
  );
}
