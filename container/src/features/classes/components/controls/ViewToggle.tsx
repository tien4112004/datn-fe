import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Grid3X3, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type ViewMode = 'list' | 'grid';

interface ViewToggleProps {
  value: ViewMode;
  onValueChange: (value: ViewMode) => void;
}

const ViewToggle = ({ value, onValueChange }: ViewToggleProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'controls.viewToggle' });

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(val) => val && onValueChange(val as ViewMode)}
      className="justify-start"
    >
      <ToggleGroupItem value="list" aria-label={t('listView')}>
        <List className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="grid" aria-label={t('gridView')}>
        <Grid3X3 className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default ViewToggle;
