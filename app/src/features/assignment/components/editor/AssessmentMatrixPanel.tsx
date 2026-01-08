import { useFormContext } from 'react-hook-form';
import { Grid3x3, Eye } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import { MatrixEmptyState } from './MatrixEmptyState';
import { MatrixPreviewSummary } from './MatrixPreviewSummary';
import type { AssignmentFormData } from '../../types';

export const AssessmentMatrixPanel = () => {
  const { watch } = useFormContext<AssignmentFormData>();
  const setMatrixEditorOpen = useAssignmentEditorStore((state) => state.setMatrixEditorOpen);
  const setMatrixViewOpen = useAssignmentEditorStore((state) => state.setMatrixViewOpen);

  const topics = watch('topics');
  const matrixCells = watch('matrixCells');
  const questions = watch('questions');

  // Check if matrix is empty (all cells have requiredCount === 0)
  const hasMatrix = matrixCells.some((cell) => cell.requiredCount > 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-green-500 p-2 text-white">
            <Grid3x3 className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Assessment Matrix</h2>
        </div>
        {hasMatrix && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setMatrixViewOpen(true)}>
              <Eye className="mr-1 h-3 w-3" />
              View
            </Button>
            <Button size="sm" variant="outline" onClick={() => setMatrixEditorOpen(true)}>
              Edit
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        {!hasMatrix ? (
          <MatrixEmptyState onOpenEditor={() => setMatrixEditorOpen(true)} />
        ) : (
          <MatrixPreviewSummary topics={topics} matrixCells={matrixCells} questions={questions} />
        )}
      </div>
    </div>
  );
};
