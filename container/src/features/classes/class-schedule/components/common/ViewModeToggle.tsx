import { Button } from '@/components/ui/button';
import { Calendar, ListTodo } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type ViewMode = 'day' | 'subject';

interface ViewModeToggleProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export const ViewModeToggle = ({ currentMode, onModeChange }: ViewModeToggleProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'schedule' });

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={currentMode === 'day' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onModeChange('day')}
        className="gap-2"
      >
        <Calendar className="h-4 w-4" />
        {t('views.day')}
      </Button>
      <Button
        variant={currentMode === 'subject' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onModeChange('subject')}
        className="gap-2"
      >
        <ListTodo className="h-4 w-4" />
        {t('views.subject')}
      </Button>
    </div>
  );
};
