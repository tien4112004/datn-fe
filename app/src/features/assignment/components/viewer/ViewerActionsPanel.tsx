import { Button } from '@/shared/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ViewerActionsPanelProps {
  onEdit: () => void;
  onDelete: () => void;
}

export const ViewerActionsPanel = ({ onEdit, onDelete }: ViewerActionsPanelProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'viewer.actions' });

  return (
    <div className="space-y-3 rounded-lg border bg-white p-4 dark:bg-gray-900">
      <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t('title')}</div>

      <div className="space-y-2">
        <Button onClick={onEdit} variant="outline" size="sm" className="w-full">
          <Edit className="mr-2 h-4 w-4" />
          {t('edit')}
        </Button>

        <Button onClick={onDelete} variant="outline" size="sm" className="text-destructive w-full">
          <Trash2 className="mr-2 h-4 w-4" />
          {t('delete')}
        </Button>
      </div>
    </div>
  );
};
