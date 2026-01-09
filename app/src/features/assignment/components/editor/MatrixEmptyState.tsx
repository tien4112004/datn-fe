import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface MatrixEmptyStateProps {
  onOpenEditor: () => void;
}

export const MatrixEmptyState = ({ onOpenEditor }: MatrixEmptyStateProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.matrix.emptyState' });
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{t('message')}</p>
      <div className="flex gap-2">
        <Button size="sm" onClick={onOpenEditor}>
          <Plus className="mr-2 h-4 w-4" />
          {t('create')}
        </Button>
      </div>
    </div>
  );
};
