import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { SchedulePeriod } from '../../../shared/types';

interface CreateLessonProps {
  period: SchedulePeriod;
}

export const CreateLesson = ({ period }: CreateLessonProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation('classes', { keyPrefix: 'schedule.createLesson' });

  const handleCreateLesson = () => {
    navigate(`/lessons/create?periodId=${period.id}`);
  };

  return (
    <Card className="border-primary/20 bg-primary/5 border-2 border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="bg-primary/10 rounded-full p-4">
          <FileText className="text-primary h-8 w-8" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">{t('title')}</h3>
        <p className="text-muted-foreground mt-2 max-w-md text-center text-sm">{t('description')}</p>
        <Button onClick={handleCreateLesson} className="mt-6" size="lg">
          <Plus className="mr-2 h-4 w-4" />
          {t('createButton')}
        </Button>
      </CardContent>
    </Card>
  );
};
