import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight, MapPin, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SchedulePeriod } from '../../shared/types';
import { getSubjectByCode } from '@aiprimary/core';

interface CurrentNextPeriodProps {
  periods: SchedulePeriod[];
}

interface ClassStatus {
  current: SchedulePeriod | null;
  next: SchedulePeriod | null;
  timeUntilNext: number; // minutes
  isInSession: boolean;
}

export const CurrentNextPeriod = ({ periods }: CurrentNextPeriodProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'schedule.currentNext' });
  const [status, setStatus] = useState<ClassStatus>({
    current: null,
    next: null,
    timeUntilNext: 0,
    isInSession: false,
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  const getCurrentPeriodStatus = (): ClassStatus => {
    const now = new Date();
    const currentTimeStr = now.toTimeString().slice(0, 5); // "HH:MM"
    const todayDateStr = now.toISOString().split('T')[0]; // "YYYY-MM-DD"

    // Filter today's periods by date
    const todayPeriods = periods
      .filter((period) => period.date === todayDateStr && period.isActive)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

    let current: SchedulePeriod | null = null;
    let next: SchedulePeriod | null = null;
    let isInSession = false;

    // Find current period
    for (const period of todayPeriods) {
      if (
        period.startTime &&
        period.endTime &&
        currentTimeStr >= period.startTime &&
        currentTimeStr < period.endTime
      ) {
        current = period;
        isInSession = true;
        break;
      }
    }

    // Find next period
    for (const period of todayPeriods) {
      if (period.startTime && currentTimeStr < period.startTime) {
        next = period;
        break;
      }
    }

    // Calculate time until next
    let timeUntilNext = 0;
    if (next && next.startTime) {
      const nextStart = new Date();
      const [hours, minutes] = next.startTime.split(':').map(Number);
      nextStart.setHours(hours, minutes, 0, 0);
      timeUntilNext = Math.max(0, Math.floor((nextStart.getTime() - now.getTime()) / (1000 * 60)));
    }

    return { current, next, timeUntilNext, isInSession };
  };

  useEffect(() => {
    const updateStatus = () => {
      setCurrentTime(new Date());
      setStatus(getCurrentPeriodStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [periods]);

  const formatTime = (timeStr: string) => {
    return timeStr;
  };

  const formatTimeUntil = (minutes: number) => {
    if (minutes < 60) {
      return t('timeFormat.minutes', { count: minutes });
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return t('timeFormat.hoursMinutes', { hours, minutes: remainingMinutes });
  };

  const getCurrentTimeDisplay = () => {
    return currentTime.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* Current Time Display */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 font-mono text-2xl font-bold">
              <Clock className="h-6 w-6" />
              {getCurrentTimeDisplay()}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Current Class */}
        <Card className={status.isInSession ? 'border-green-500 bg-green-50' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5" />
              {t('currentPeriod')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex h-full flex-col justify-between">
            {status.current ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">
                    {getSubjectByCode(status.current.subject)?.name || status.current.subject}
                  </h3>
                  <Badge variant={status.isInSession ? 'default' : 'secondary'}>
                    {status.isInSession ? t('status.inProgress') : t('status.scheduled')}
                  </Badge>
                </div>

                <div className="text-muted-foreground space-y-2 text-sm">
                  {status.current.startTime && status.current.endTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {formatTime(status.current.startTime)} - {formatTime(status.current.endTime)}
                    </div>
                  )}

                  {status.current.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {status.current.location}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground py-4 text-center">
                <p>{t('noCurrentPeriod')}</p>
              </div>
            )}

            {status.isInSession && (
              <div className="w-full">
                <Button size="sm" className="w-full">
                  {t('actions.viewLesson')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Class */}
        <Card className={status.next && status.timeUntilNext <= 15 ? 'border-orange-500 bg-orange-50' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ArrowRight className="h-5 w-5" />
              {t('nextPeriod')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {status.next ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">
                    {getSubjectByCode(status.next.subject)?.name || status.next.subject}
                  </h3>
                  {status.timeUntilNext <= 15 && <Badge variant="destructive">{t('status.soon')}</Badge>}
                </div>

                <div className="text-muted-foreground space-y-2 text-sm">
                  {status.next.startTime && status.next.endTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {formatTime(status.next.startTime)} - {formatTime(status.next.endTime)}
                    </div>
                  )}

                  {status.next.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {status.next.location}
                    </div>
                  )}
                </div>

                {status.timeUntilNext > 0 && (
                  <div className="rounded bg-blue-50 p-2 text-center">
                    <p className="text-sm font-medium text-blue-700">
                      {t('startsIn')} {formatTimeUntil(status.timeUntilNext)}
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <Button size="sm" variant="outline" className="w-full">
                    {t('actions.prepareLesson')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground py-4 text-center">
                <p>{t('noNextPeriod')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
