import { cn } from '@/shared/lib/utils';
import type { MatrixCell } from '../../types';

interface MatrixCellViewProps {
  cell?: MatrixCell;
}

export const MatrixCellView = ({ cell }: MatrixCellViewProps) => {
  if (!cell) {
    return <div className="text-center text-xs text-gray-300 dark:text-gray-600">—</div>;
  }

  const isMet = cell.currentCount >= cell.requiredCount;
  const isEmpty = cell.requiredCount === 0;

  if (isEmpty) {
    return <div className="text-center text-xs text-gray-300 dark:text-gray-600">—</div>;
  }

  return (
    <div className="space-y-1 text-center text-xs">
      <div className="text-gray-600 dark:text-gray-400">
        <span className="text-xs font-medium">Required:</span> {cell.requiredCount}
      </div>
      <div
        className={cn(
          'font-medium',
          isMet ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        )}
      >
        <span className="text-xs">Current:</span> {cell.currentCount}
      </div>
    </div>
  );
};
