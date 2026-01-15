import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Grid3x3, Eye } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import { MatrixEmptyState } from './MatrixEmptyState';
import { MatrixPreviewSummary } from './MatrixPreviewSummary';
import { CollapsibleSection } from './CollapsibleSection';
import type { AssignmentFormData } from '../../types';

export const AssessmentMatrixPanel = () => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.matrix' });
  const { watch } = useFormContext<AssignmentFormData>();
  const setMatrixEditorOpen = useAssignmentEditorStore((state) => state.setMatrixEditorOpen);
  const setMatrixViewOpen = useAssignmentEditorStore((state) => state.setMatrixViewOpen);

  const topics = watch('topics');
  const matrixCells = watch('matrixCells');
  const assignmentQuestions = watch('questions');

  // Extract just the questions from AssignmentQuestionWithTopic for the matrix preview
  const questions = assignmentQuestions.map((aq) => aq.question);

  // Check if matrix is empty (all cells have requiredCount === 0)
  const hasMatrix = matrixCells.some((cell) => cell.requiredCount > 0);

  return (
    <CollapsibleSection
      title={t('panelTitle')}
      icon={<Grid3x3 className="h-5 w-5" />}
      defaultOpen={true}
      actions={
        hasMatrix ? (
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => setMatrixViewOpen(true)}>
              <Eye className="mr-1 h-3 w-3" />
              {t('view')}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setMatrixEditorOpen(true)}>
              {t('edit')}
            </Button>
          </div>
        ) : undefined
      }
    >
      {!hasMatrix ? (
        <MatrixEmptyState onOpenEditor={() => setMatrixEditorOpen(true)} />
      ) : (
        <MatrixPreviewSummary topics={topics} matrixCells={matrixCells} questions={questions} />
      )}
    </CollapsibleSection>
  );
};
