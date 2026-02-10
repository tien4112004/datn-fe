import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import type { MatrixCell } from '../../types';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';

interface MatrixCellViewProps {
  cell?: MatrixCell;
}

export const MatrixCellView = ({ cell }: MatrixCellViewProps) => {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, { keyPrefix: 'assignmentEditor.matrixCell' });

  if (!cell || cell.requiredCount === 0) {
    return <div className="text-center text-xs text-gray-300 dark:text-gray-600">—</div>;
  }

  const diff = cell.currentCount - cell.requiredCount;

  let statusColor: string;
  let fullText: string;
  if (diff === 0) {
    statusColor = 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200';
    fullText = t('ok');
  } else if (diff < 0) {
    statusColor = 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-200';
    fullText = t('needMore', { count: Math.abs(diff) });
  } else {
    statusColor = 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200';
    fullText = t('extra', { count: diff });
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`overflow-hidden rounded-md border px-1 py-1.5 text-center ${statusColor}`}>
          <div className="text-sm font-bold leading-none">
            {cell.currentCount}/{cell.requiredCount}
          </div>
          {cell.points != null && cell.points > 0 && (
            <div className="mt-0.5 text-[10px] leading-none opacity-75">
              {cell.points % 1 === 0 ? cell.points : cell.points.toFixed(1)}p
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{fullText}</p>
      </TooltipContent>
    </Tooltip>
  );
};
