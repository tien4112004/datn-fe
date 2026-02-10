import { useTranslation } from 'react-i18next';
import { Grid3x3, Edit } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import { useAssignmentFormStore } from '../../stores/useAssignmentFormStore';
import { MatrixEmptyState } from './MatrixEmptyState';
import { MatrixPreviewSummary } from './MatrixPreviewSummary';
import { CollapsibleSection } from './CollapsibleSection';

export const AssessmentMatrixPanel = () => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.matrix' });
  const setMainView = useAssignmentEditorStore((state) => state.setMainView);

  // Get data from store
  const matrixCells = useAssignmentFormStore((state) => state.matrix);
  const questions = useAssignmentFormStore((state) => state.questions);

  // Show preview if there are questions OR if matrix requirements are defined
  const hasQuestionsOrMatrix = questions.length > 0 || matrixCells.some((cell) => cell.requiredCount > 0);

  return (
    <CollapsibleSection
      title={t('panelTitle')}
      icon={<Grid3x3 className="h-5 w-5" />}
      defaultOpen={true}
      actions={
        <div className="flex gap-1">
          <Button type="button" size="sm" variant="ghost" onClick={() => setMainView('matrix')}>
            <Edit className="mr-1 h-3 w-3" />
          </Button>
        </div>
      }
    >
      {!hasQuestionsOrMatrix ? (
        <MatrixEmptyState onOpenEditor={() => setMainView('matrix')} />
      ) : (
        <MatrixPreviewSummary />
      )}
    </CollapsibleSection>
  );
};
