import { Input } from '@/shared/components/ui/input';
import { useFormContext, useWatch } from 'react-hook-form';
import type { AssignmentFormData, MatrixCell as MatrixCellType } from '../../types';
import { validateMatrixCell } from '../../utils';

interface MatrixCellProps {
  cell: MatrixCellType;
}

export const MatrixCell = ({ cell }: MatrixCellProps) => {
  const { control, setValue } = useFormContext<AssignmentFormData>();
  const matrixCells = useWatch({ control, name: 'matrixCells' });

  // Find the index of this cell in the array
  const cellIndex = matrixCells?.findIndex((c) => c.id === cell.id) ?? -1;

  // Validate the cell
  const validation = validateMatrixCell(cell);
  const { status, message } = validation;

  const statusColors: Record<string, string> = {
    valid: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-200',
    info: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200',
  };

  const handleRequiredCountChange = (value: string) => {
    const numValue = parseInt(value, 10) || 0;
    if (cellIndex !== -1) {
      setValue(`matrixCells.${cellIndex}.requiredCount`, numValue);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500">Required:</span>
        <Input
          type="number"
          min="0"
          value={cell.requiredCount}
          onChange={(e) => handleRequiredCountChange(e.target.value)}
          className="h-7 w-16 text-xs"
        />
      </div>

      <div className={`rounded-md border-2 p-2 text-center ${statusColors[status]}`}>
        <div className="text-lg font-bold">{cell.currentCount}</div>
        <div className="text-xs">{message || 'OK'}</div>
      </div>
    </div>
  );
};
