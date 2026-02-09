import { useTranslation } from 'react-i18next';
import { Grid3x3 } from 'lucide-react';
import type { Assignment } from '../../types';
import { MatrixGridView } from './MatrixGridView';

interface MatrixViewPanelProps {
  assignment: Assignment;
}

export const MatrixViewPanel = ({ assignment }: MatrixViewPanelProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'viewer.matrix' });

  const topics = assignment.topics || [];
  const matrixCells = (assignment.matrix as any)?.cells || [];

  return (
    <div className="space-y-6">
      {/* Panel Header */}
      <div className="flex items-center gap-3 border-b pb-4">
        <Grid3x3 className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('panelTitle')}</h2>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400">{t('viewDescription')}</p>

      {/* Matrix Grid */}
      <MatrixGridView topics={topics} matrixCells={matrixCells} />
    </div>
  );
};
