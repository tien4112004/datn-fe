import { Button } from '@ui/button';
import { Save } from 'lucide-react';
import { useSaveMindmap } from '../../hooks/useSaving';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';

interface SaveMindmapButtonProps {
  mindmapId: string;
  className?: string;
}

function SaveMindmapButton({ mindmapId, className }: SaveMindmapButtonProps) {
  const { t } = useTranslation(I18N_NAMESPACES.MINDMAP);
  const { saveWithThumbnail, isLoading } = useSaveMindmap();

  const handleSave = async () => {
    await saveWithThumbnail(mindmapId);
  };

  return (
    <Button
      variant="outline"
      onClick={handleSave}
      disabled={isLoading}
      className={className}
      title={t('toolbar.tooltips.saveMindmap')}
    >
      <Save size={16} />
      {isLoading ? t('toolbar.save.saving') : t('toolbar.save.save')}
    </Button>
  );
}

export default SaveMindmapButton;
