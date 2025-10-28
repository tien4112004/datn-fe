import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useClassStore } from '../../stores';

const CreateClassControls = () => {
  const { t } = useTranslation('classes', { keyPrefix: 'controls' });
  const { openCreateModal } = useClassStore();

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="text-lg font-medium">{t('welcome')}</h2>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <Button onClick={openCreateModal} className="gap-2">
        <Plus className="h-4 w-4" />
        {t('createClass')}
      </Button>
    </div>
  );
};

export default CreateClassControls;
