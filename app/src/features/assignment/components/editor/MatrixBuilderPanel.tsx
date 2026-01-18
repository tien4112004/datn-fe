import { useTranslation } from 'react-i18next';
import { Grid3x3 } from 'lucide-react';
import { TopicManager } from './TopicManager';
import { MatrixGrid } from './MatrixGrid';

export const MatrixBuilderPanel = () => {
  const { t } = useTranslation('assignment', {
    keyPrefix: 'assignmentEditor.matrixBuilder',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-4">
        <Grid3x3 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('panelTitle')}</h2>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400">{t('description')}</p>

      {/* Topic Management */}
      <div className="space-y-4">
        <TopicManager />
      </div>

      {/* Matrix Grid */}
      <div className="space-y-4">
        <MatrixGrid />
      </div>
    </div>
  );
};
