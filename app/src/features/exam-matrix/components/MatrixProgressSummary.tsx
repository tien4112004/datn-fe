import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import type { MatrixCell } from '@/features/exam-matrix/types';
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
    if (isValid) return 'text-green-600 dark:text-green-400';
    if (isPartiallyComplete) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
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
    <div className="space-y-4">
      <div className={cn('flex items-center gap-2', !isValid && 'animate-pulse')}>
        {getStatusIcon()}
        <h3 className="text-base font-semibold">{t('progress.title')}</h3>
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
        <div className="bg-muted relative h-2 overflow-hidden rounded-full">
          <div
            className="from-primary to-primary/80 h-full rounded-full bg-gradient-to-r shadow-sm transition-all duration-500 ease-out"
            style={{ width: `${cellsProgress}%` }}
          />
        </div>

        <div className="flex gap-2 text-xs">
          <Badge variant="outline" className="text-green-600 shadow-sm dark:text-green-400">
            {fulfilledCells} {t('cellStatus.fulfilled')}
          </Badge>
          <Badge variant="outline" className="text-yellow-600 shadow-sm dark:text-yellow-400">
            {partialCells} {t('cellStatus.partial')}
          </Badge>
          <Badge variant="outline" className="text-muted-foreground shadow-sm">
            {emptyCells} {t('cellStatus.empty')}
          </Badge>
        </div>
      </div>

      {/* Points Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('labels.pointsProgress')}</span>
          <span className="font-medium">
            {t('progress.pointsProgress', {
              current: totalCurrentPoints.toFixed(1),
              target: targetPoints.toFixed(1),
            })}
          </span>
        </div>
        <div className="bg-muted relative h-2 overflow-hidden rounded-full">
          <div
            className={cn(
              'h-full rounded-full shadow-sm transition-all duration-500 ease-out',
              pointsDifference > 0
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                : pointsDifference < 0
                  ? 'bg-gradient-to-r from-red-500 to-red-400'
                  : 'bg-gradient-to-r from-green-500 to-green-400'
            )}
            style={{ width: `${Math.min(pointsProgress, 100)}%` }}
          />
        </div>

        {pointsDifference !== 0 && (
          <div
            className={cn(
              'text-xs',
              Math.abs(pointsDifference) < 0.01
                ? 'text-green-600 dark:text-green-400'
                : pointsDifference > 0
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-red-600 dark:text-red-400'
            )}
          >
            {pointsDifference > 0 ? '+' : ''}
            {pointsDifference.toFixed(1)} {t('labels.ptsFromTarget')}
          </div>
        )}
      </div>
    </div>
  );
};
