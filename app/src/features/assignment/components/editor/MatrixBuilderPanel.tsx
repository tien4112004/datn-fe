import { useTranslation } from 'react-i18next';
import { Grid3x3 } from 'lucide-react';
import { MatrixGrid } from './MatrixGrid';
import { useAssignmentFormStore } from '../../stores/useAssignmentFormStore';

export const MatrixBuilderPanel = () => {
  const { t } = useTranslation('assignment', {
    keyPrefix: 'assignmentEditor.matrixBuilder',
  });

  const matrixErrors = useAssignmentFormStore((state) => state.validationErrors?.matrix);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-4">
        <Grid3x3 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('panelTitle')}</h2>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400">{t('description')}</p>

      {/* Validation Errors */}
      {matrixErrors && matrixErrors.errors.length > 0 && (
        <div className="border-destructive/50 bg-destructive/5 rounded-lg border p-3">
          <ul className="space-y-1">
            {matrixErrors.errors.map((error, i) => (
              <li key={i} className="text-destructive flex items-start gap-2 text-sm">
                <span className="bg-destructive mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Matrix Grid */}
      <div className="space-y-4">
        <MatrixGrid />
      </div>
    </div>
  );
};
