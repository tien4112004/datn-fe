import type { MatrixCell } from '../../types';

interface MatrixCellViewProps {
  cell?: MatrixCell;
}

export const MatrixCellView = ({ cell }: MatrixCellViewProps) => {
  if (!cell || cell.requiredCount === 0) {
    return <div className="text-center text-xs text-gray-300 dark:text-gray-600">—</div>;
  }

  const diff = cell.currentCount - cell.requiredCount;

  // Status color matching the editor's MatrixCell
  let statusColor: string;
  let statusText: string;

  if (diff === 0) {
    statusColor = 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200';
    statusText = `${cell.currentCount}`;
  } else if (diff < 0) {
    statusColor = 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-200';
    statusText = `${cell.currentCount}`;
  } else {
    statusColor = 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200';
    statusText = `${cell.currentCount}`;
  }

  return (
    <div className={`overflow-hidden rounded-md border px-1 py-1.5 text-center ${statusColor}`}>
      <div className="truncate text-sm font-bold leading-none">{statusText}</div>
      <div className="mt-0.5 truncate text-[10px] leading-none">
        {diff === 0 ? 'OK' : diff < 0 ? `-${Math.abs(diff)}` : `+${diff}`}
      </div>
    </div>
  );
};
