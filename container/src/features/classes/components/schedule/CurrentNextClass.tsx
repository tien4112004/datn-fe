import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight, User, MapPin, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ClassPeriod } from '../../types';

interface CurrentNextClassProps {
  classId: string;
  periods: ClassPeriod[];
}

interface ClassStatus {
  current: ClassPeriod | null;
  next: ClassPeriod | null;
  timeUntilNext: number; // minutes
  isInSession: boolean;
}

const CurrentNextClass = ({ classId, periods }: CurrentNextClassProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'schedule.currentNext' });
  const [status, setStatus] = useState<ClassStatus>({
    current: null,
    next: null,
    timeUntilNext: 0,
    isInSession: false,
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  const getCurrentClassStatus = (): ClassStatus => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTimeStr = now.toTimeString().slice(0, 5); // "HH:MM"

    // Filter today's periods
    const todayPeriods = periods
      .filter((period) => period.dayOfWeek === currentDay && period.isActive)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    let current: ClassPeriod | null = null;
    let next: ClassPeriod | null = null;
    let isInSession = false;

    // Find current period
    for (const period of todayPeriods) {
      if (currentTimeStr >= period.startTime && currentTimeStr < period.endTime) {
        current = period;
        isInSession = true;
        break;
      }
    }

    // Find next period
    for (const period of todayPeriods) {
      if (currentTimeStr < period.startTime) {
        next = period;
        break;
      }
    }

    // Calculate time until next
    let timeUntilNext = 0;
    if (next) {
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
      setStatus(getCurrentClassStatus());
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
        <CardContent className="pt-6">
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
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5" />
              {t('currentClass')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {status.current ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{status.current.subject}</h3>
                  <Badge variant={status.isInSession ? 'default' : 'secondary'}>
                    {status.isInSession ? t('status.inProgress') : t('status.scheduled')}
                  </Badge>
                </div>

                <div className="text-muted-foreground space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {formatTime(status.current.startTime)} - {formatTime(status.current.endTime)}
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {status.current.teacher.fullName}
                  </div>

                  {status.current.room && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {t('room')} {status.current.room}
                    </div>
                  )}
                </div>

                {status.isInSession && (
                  <div className="pt-2">
                    <Button size="sm" className="w-full">
                      {t('actions.viewLesson')}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground py-4 text-center">
                <p>{t('noCurrentClass')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Class */}
        <Card className={status.next && status.timeUntilNext <= 15 ? 'border-orange-500 bg-orange-50' : ''}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ArrowRight className="h-5 w-5" />
              {t('nextClass')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {status.next ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{status.next.subject}</h3>
                  {status.timeUntilNext <= 15 && <Badge variant="destructive">{t('status.soon')}</Badge>}
                </div>

                <div className="text-muted-foreground space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {formatTime(status.next.startTime)} - {formatTime(status.next.endTime)}
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {status.next.teacher.fullName}
                  </div>

                  {status.next.room && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {t('room')} {status.next.room}
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
                <p>{t('noNextClass')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CurrentNextClass;
