import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import type { ScheduleStats } from '../../hooks/useScheduleHelpers';

interface ScheduleStatsProps {
  stats: ScheduleStats;
}

const ScheduleStatsDisplay = ({ stats }: ScheduleStatsProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'schedule.daily' });

  return (
    <div className="ml-4 w-48 space-y-3">
      <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100">
        <CardContent className="px-6 py-2">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs font-medium">{t('stats.totalPeriods')}</p>
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100">
        <CardContent className="px-6 py-2">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs font-medium">{t('stats.completed')}</p>
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100">
        <CardContent className="px-6 py-2">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs font-medium">{t('stats.remaining')}</p>
            <div className="text-3xl font-bold text-orange-600">{stats.remaining}</div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100">
        <CardContent className="px-6 py-2">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs font-medium">{t('stats.withLesson')}</p>
            <div className="text-3xl font-bold text-purple-600">{stats.withLesson}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleStatsDisplay;
