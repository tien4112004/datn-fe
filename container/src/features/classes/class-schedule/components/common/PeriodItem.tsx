import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, parse } from 'date-fns';
import type { SchedulePeriod } from '../../../shared/types';
import { getLocaleDateFns } from '@/shared/i18n/helper';
import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LessonPlanBadge } from '../../../class-lesson';

interface PeriodItemProps {
  period: SchedulePeriod;
  onClick?: () => void;
}

const PeriodItem = ({ period, onClick }: PeriodItemProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'schedule' });
  const periodDate = parse(period.date, 'yyyy-MM-dd', new Date());
  const formattedDate = format(periodDate, 'PPPP', { locale: getLocaleDateFns() });
  const timeRange = period.startTime && period.endTime ? `${period.startTime} - ${period.endTime}` : 'TBD';

  return (
    <Card className="hover:scale-102 cursor-pointer transition-all hover:shadow-md" onClick={onClick}>
      <CardContent>
        <div className="space-y-2">
          {/* Date and Time */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold">{formattedDate}</p>
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <Clock className="h-3 w-3" />
                <span>{timeRange}</span>
              </div>
            </div>
            <Badge variant="secondary">{period.category}</Badge>
          </div>

          {/* Lesson Information */}
          {period.lessonPlan && (
            <div className="border-t pt-3">
              <LessonPlanBadge lessonPlan={period.lessonPlan} variant="detailed" showObjectives />
            </div>
          )}

          {/* Location if available */}
          {period.location && (
            <div className="text-muted-foreground text-xs">
              <span className="font-medium">{t('subjectView.location')}:</span> {period.location}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PeriodItem;
