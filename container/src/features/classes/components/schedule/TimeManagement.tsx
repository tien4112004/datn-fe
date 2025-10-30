import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Play, Pause, RotateCcw, Timer, Bell, BellOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';
import type { ClassPeriod } from '../../types';

interface TimeManagementProps {
  currentPeriod?: ClassPeriod;
  nextPeriod?: ClassPeriod;
  onPeriodEnd?: () => void;
  onBreakEnd?: () => void;
}

interface TimeStatus {
  currentTime: Date;
  periodProgress: number;
  timeRemaining: number;
  timeElapsed: number;
  totalDuration: number;
  isInBreak: boolean;
  breakTimeRemaining: number;
  phase: 'before' | 'during' | 'break' | 'after';
}

const TimeManagement = ({ currentPeriod, nextPeriod, onPeriodEnd, onBreakEnd }: TimeManagementProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'schedule.timeManagement' });
  const [timeStatus, setTimeStatus] = useState<TimeStatus>({
    currentTime: new Date(),
    periodProgress: 0,
    timeRemaining: 0,
    timeElapsed: 0,
    totalDuration: 0,
    isInBreak: false,
    breakTimeRemaining: 0,
    phase: 'before',
  });
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const calculateTimeStatus = (): TimeStatus => {
    const now = new Date();
    const currentTimeStr = now.toTimeString().slice(0, 5);

    let status: TimeStatus = {
      currentTime: now,
      periodProgress: 0,
      timeRemaining: 0,
      timeElapsed: 0,
      totalDuration: 0,
      isInBreak: false,
      breakTimeRemaining: 0,
      phase: 'before',
    };

    if (currentPeriod) {
      const periodStart = new Date();
      const [startHours, startMinutes] = currentPeriod.startTime.split(':').map(Number);
      periodStart.setHours(startHours, startMinutes, 0, 0);

      const periodEnd = new Date();
      const [endHours, endMinutes] = currentPeriod.endTime.split(':').map(Number);
      periodEnd.setHours(endHours, endMinutes, 0, 0);

      const totalDuration = (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60); // minutes

      if (currentTimeStr >= currentPeriod.startTime && currentTimeStr < currentPeriod.endTime) {
        // During class period
        const elapsed = (now.getTime() - periodStart.getTime()) / (1000 * 60);
        const remaining = Math.max(0, totalDuration - elapsed);
        const progress = Math.min(100, (elapsed / totalDuration) * 100);

        status = {
          ...status,
          periodProgress: progress,
          timeRemaining: remaining,
          timeElapsed: elapsed,
          totalDuration,
          phase: 'during',
        };
      } else if (currentTimeStr >= currentPeriod.endTime) {
        // After period - check if in break
        if (nextPeriod) {
          const nextStart = new Date();
          const [nextHours, nextMinutes] = nextPeriod.startTime.split(':').map(Number);
          nextStart.setHours(nextHours, nextMinutes, 0, 0);

          if (now < nextStart) {
            const breakRemaining = (nextStart.getTime() - now.getTime()) / (1000 * 60);
            status = {
              ...status,
              isInBreak: true,
              breakTimeRemaining: breakRemaining,
              phase: 'break',
              periodProgress: 100,
              timeElapsed: totalDuration,
              totalDuration,
            };
          } else {
            status.phase = 'after';
          }
        } else {
          status.phase = 'after';
        }
      } else {
        // Before period
        status.phase = 'before';
      }
    }

    return status;
  };

  useEffect(() => {
    if (!isTimerActive) return;

    const updateTimer = () => {
      const newStatus = calculateTimeStatus();
      setTimeStatus(newStatus);

      // Trigger notifications
      if (notifications) {
        if (newStatus.phase === 'during' && newStatus.timeRemaining <= 5 && newStatus.timeRemaining > 4) {
          // 5 minutes remaining notification
          // In a real app, this would trigger a notification
          console.log('5 minutes remaining in current period');
        }

        if (newStatus.phase === 'during' && newStatus.timeRemaining <= 1 && newStatus.timeRemaining > 0) {
          // 1 minute remaining notification
          console.log('1 minute remaining in current period');
        }

        if (
          newStatus.phase === 'break' &&
          newStatus.breakTimeRemaining <= 2 &&
          newStatus.breakTimeRemaining > 1
        ) {
          // Break ending soon
          console.log('Break ending in 2 minutes');
        }
      }

      // Trigger callbacks
      if (newStatus.phase === 'break' && newStatus.breakTimeRemaining <= 0) {
        onBreakEnd?.();
      }

      if (newStatus.phase === 'after' && timeStatus.phase === 'during') {
        onPeriodEnd?.();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000); // Update every second

    return () => clearInterval(interval);
  }, [isTimerActive, notifications, currentPeriod, nextPeriod, timeStatus.phase]);

  const formatTime = (minutes: number): string => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((minutes % 1) * 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'before':
        return 'text-blue-600';
      case 'during':
        return 'text-green-600';
      case 'break':
        return 'text-orange-600';
      case 'after':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case 'before':
        return t('phases.before');
      case 'during':
        return t('phases.during');
      case 'break':
        return t('phases.break');
      case 'after':
        return t('phases.after');
      default:
        return '';
    }
  };

  const toggleTimer = () => {
    setIsTimerActive(!isTimerActive);
  };

  const toggleNotifications = () => {
    setNotifications(!notifications);
  };

  const resetTimer = () => {
    setTimeStatus(calculateTimeStatus());
  };

  return (
    <div className="space-y-4">
      {/* Main Timer Display */}
      <Card
        className={cn(
          'transition-all duration-300',
          timeStatus.phase === 'during' && 'border-green-500 bg-green-50',
          timeStatus.phase === 'break' && 'border-orange-500 bg-orange-50',
          timeStatus.timeRemaining <= 5 && timeStatus.phase === 'during' && 'border-red-500 bg-red-50'
        )}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              {t('title')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={getPhaseColor(timeStatus.phase)}>{getPhaseLabel(timeStatus.phase)}</Badge>
              <Button variant="outline" size="sm" onClick={toggleNotifications}>
                {notifications ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Current Time */}
            <div className="text-center">
              <div className="font-mono text-4xl font-bold">
                {timeStatus.currentTime.toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </div>
            </div>

            {/* Period Information */}
            {currentPeriod && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-semibold">{currentPeriod.subject}</h3>
                  <p className="text-muted-foreground">
                    {currentPeriod.startTime} - {currentPeriod.endTime}
                  </p>
                </div>

                {timeStatus.phase === 'during' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>
                        {t('elapsed')}: {formatTime(timeStatus.timeElapsed)}
                      </span>
                      <span>
                        {t('remaining')}: {formatTime(timeStatus.timeRemaining)}
                      </span>
                    </div>
                    <Progress value={timeStatus.periodProgress} className="h-3" />
                    <div className="text-center">
                      <span className="text-2xl font-bold">{formatTime(timeStatus.timeRemaining)}</span>
                      <span className="text-muted-foreground ml-2">{t('remaining')}</span>
                    </div>
                  </div>
                )}

                {timeStatus.phase === 'break' && (
                  <div className="space-y-2 text-center">
                    <p className="text-lg font-semibold text-orange-600">{t('breakTime')}</p>
                    <div className="text-2xl font-bold">{formatTime(timeStatus.breakTimeRemaining)}</div>
                    <p className="text-muted-foreground text-sm">
                      {t('untilNext')}: {nextPeriod?.subject}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" onClick={toggleTimer}>
                {isTimerActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isTimerActive ? t('actions.pause') : t('actions.resume')}
              </Button>

              <Button variant="outline" size="sm" onClick={resetTimer}>
                <RotateCcw className="h-4 w-4" />
                {t('actions.reset')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Period Preview */}
      {nextPeriod && timeStatus.phase !== 'after' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              {t('nextPeriod')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{nextPeriod.subject}</h4>
                <p className="text-muted-foreground text-sm">
                  {nextPeriod.startTime} - {nextPeriod.endTime}
                </p>
              </div>
              {timeStatus.isInBreak && (
                <Badge variant="outline">
                  {t('startsIn')} {formatTime(timeStatus.breakTimeRemaining)}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-lg font-bold">
                {timeStatus.phase === 'during' ? Math.round(timeStatus.periodProgress) : 0}%
              </div>
              <p className="text-muted-foreground text-xs">{t('stats.progress')}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-lg font-bold">
                {currentPeriod ? Math.round(timeStatus.totalDuration) : 0}
              </div>
              <p className="text-muted-foreground text-xs">{t('stats.totalMinutes')}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-lg font-bold">
                {timeStatus.phase === 'during' ? Math.round(timeStatus.timeElapsed) : 0}
              </div>
              <p className="text-muted-foreground text-xs">{t('stats.elapsed')}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-lg font-bold">
                {timeStatus.phase === 'during' ? Math.round(timeStatus.timeRemaining) : 0}
              </div>
              <p className="text-muted-foreground text-xs">{t('stats.remaining')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimeManagement;
