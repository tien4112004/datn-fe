import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import type { MatrixCell } from '@/features/exam-matrix/types';
import { Progress } from '@/shared/components/ui/progress';
import { Badge } from '@/shared/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface MatrixProgressSummaryProps {
  cells: MatrixCell[];
  questionSelections: Record<string, string>; // questionId -> cellId
  targetPoints: number;
}

export const MatrixProgressSummary = ({
  cells,
  questionSelections,
  targetPoints,
}: MatrixProgressSummaryProps) => {
  const { t } = useTranslation(I18N_NAMESPACES.EXAM_MATRIX);

  // Group selections by cell
  const selectionsByCell = new Map<string, string[]>();
  Object.entries(questionSelections).forEach(([questionId, cellId]) => {
    if (!selectionsByCell.has(cellId)) {
      selectionsByCell.set(cellId, []);
    }
    selectionsByCell.get(cellId)!.push(questionId);
  });

  // Calculate cell statuses
  let fulfilledCells = 0;
  let partialCells = 0;
  let emptyCells = 0;
  let totalCurrentPoints = 0;

  cells.forEach((cell) => {
    const selectedCount = selectionsByCell.get(cell.id)?.length || 0;
    const requiredCount = cell.requiredQuestionCount;

    if (requiredCount === 0) return; // Skip empty cell definitions

    totalCurrentPoints += selectedCount * cell.pointsPerQuestion;

    if (selectedCount >= requiredCount) {
      fulfilledCells++;
    } else if (selectedCount > 0) {
      partialCells++;
    } else {
      emptyCells++;
    }
  });

  const totalActiveCells = cells.filter((c) => c.requiredQuestionCount > 0).length;
  const cellsProgress = totalActiveCells > 0 ? (fulfilledCells / totalActiveCells) * 100 : 0;
  const pointsProgress = targetPoints > 0 ? (totalCurrentPoints / targetPoints) * 100 : 0;
  const pointsDifference = totalCurrentPoints - targetPoints;

  const isValid = fulfilledCells === totalActiveCells && Math.abs(pointsDifference) < 0.01;
  const isPartiallyComplete = fulfilledCells > 0 || partialCells > 0;

  const getStatusColor = () => {
    if (isValid) return 'text-green-600';
    if (isPartiallyComplete) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = () => {
    if (isValid) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (isPartiallyComplete) return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusMessage = () => {
    if (isValid) return t('progress.status.valid');
    if (isPartiallyComplete) return t('progress.status.partial');
    return t('progress.status.invalid');
  };

  return (
    <div className="bg-muted/20 space-y-4 rounded-lg border p-4">
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <h3 className="text-lg font-semibold">{t('progress.title')}</h3>
      </div>

      {/* Overall Status */}
      <div className={cn('text-sm font-medium', getStatusColor())}>{getStatusMessage()}</div>

      {/* Cells Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('progress.overall')}</span>
          <span className="font-medium">
            {t('progress.cellsCompleted', { completed: fulfilledCells, total: totalActiveCells })}
          </span>
        </div>
        <Progress value={cellsProgress} className="h-2" />

        <div className="flex gap-2 text-xs">
          <Badge variant="outline" className="text-green-600">
            {fulfilledCells} Fulfilled
          </Badge>
          <Badge variant="outline" className="text-yellow-600">
            {partialCells} Partial
          </Badge>
          <Badge variant="outline" className="text-muted-foreground">
            {emptyCells} Empty
          </Badge>
        </div>
      </div>

      {/* Points Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Points Progress</span>
          <span className="font-medium">
            {t('progress.pointsProgress', {
              current: totalCurrentPoints.toFixed(1),
              target: targetPoints.toFixed(1),
            })}
          </span>
        </div>
        <Progress value={Math.min(pointsProgress, 100)} className="h-2" />

        {pointsDifference !== 0 && (
          <div
            className={cn(
              'text-xs',
              Math.abs(pointsDifference) < 0.01
                ? 'text-green-600'
                : pointsDifference > 0
                  ? 'text-yellow-600'
                  : 'text-red-600'
            )}
          >
            {pointsDifference > 0 ? '+' : ''}
            {pointsDifference.toFixed(1)} pts from target
          </div>
        )}
      </div>
    </div>
  );
};
