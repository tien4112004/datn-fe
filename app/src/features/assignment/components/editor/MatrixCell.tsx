import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import type { MatrixCell as MatrixCellType } from '../../types';
import { validateMatrixCell } from '../../utils';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { useAssignmentFormStore } from '../../stores/useAssignmentFormStore';

interface MatrixCellProps {
  cell: MatrixCellType;
}

export const MatrixCell = ({ cell }: MatrixCellProps) => {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, { keyPrefix: 'assignmentEditor.matrixCell' });
  const { t: tMatrix } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, {
    keyPrefix: 'assignmentEditor.matrixBuilder',
  });
  const updateMatrixCell = useAssignmentFormStore((state) => state.updateMatrixCell);
  const removeMatrixCell = useAssignmentFormStore((state) => state.removeMatrixCell);

  // Validate the cell
  const validation = validateMatrixCell(cell);
  const { status } = validation;

  const statusColors: Record<string, string> = {
    valid: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-200',
    info: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200',
  };

  const handleRequiredCountChange = (value: string) => {
    const numValue = Math.min(128, Math.max(0, parseInt(value, 10) || 0));
    updateMatrixCell(cell.id, { requiredCount: numValue });
  };

  // Compact status display
  const getStatusDisplay = () => {
    const diff = cell.currentCount - cell.requiredCount;
    if (cell.requiredCount === 0 && cell.currentCount === 0) {
      return { text: '0', fullText: t('ok'), compactText: t('ok') };
    }
    if (diff === 0) {
      return { text: `${cell.currentCount}`, fullText: t('ok'), compactText: t('ok') };
    }
    if (diff < 0) {
      const missing = cell.requiredCount - cell.currentCount;
      return {
        text: `${cell.currentCount}`,
        fullText: t('needMore', { count: missing }),
        compactText: t('missing', { count: missing }),
      };
    }
    const surplus = cell.currentCount - cell.requiredCount;
    return {
      text: `${cell.currentCount}`,
      fullText: t('extra', { count: surplus }),
      compactText: t('surplus', { count: surplus }),
    };
  };

  const statusDisplay = getStatusDisplay();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="group relative space-y-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeMatrixCell(cell.id)}
                className="pointer-events-none absolute -right-1 -top-1 z-10 h-4 w-4 rounded-full bg-red-100 p-0 text-red-600 opacity-0 transition-opacity hover:bg-red-200 group-hover:pointer-events-auto group-hover:opacity-100"
              >
                <X className="h-2.5 w-2.5 text-red-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tMatrix('tooltips.removeCell')}</p>
            </TooltipContent>
          </Tooltip>

          <Input
            type="text"
            min="0"
            value={cell.requiredCount}
            onChange={(e) => handleRequiredCountChange(e.target.value)}
            className="h-7 w-full text-center text-xs"
          />

          <div
            className={`overflow-hidden rounded-md border px-1 py-1.5 text-center ${statusColors[status]}`}
          >
            <div className="truncate text-sm font-bold leading-none">{statusDisplay.text}</div>
            <div className="mt-0.5 truncate text-[10px] leading-none">{statusDisplay.compactText}</div>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {statusDisplay.fullText && <p className="mt-1">{statusDisplay.fullText}</p>}
      </TooltipContent>
    </Tooltip>
  );
};
