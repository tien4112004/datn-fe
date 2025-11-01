import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, BookOpen, Plus, CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';
import type { ScheduleEvent, DailySchedule } from '../../types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useCalendarStore } from '../../stores/calendarStore';
import { useCalendarEvents } from '../../hooks';
import { CalendarGrid, EventDetailsDialog } from '../calendar';

interface DailyScheduleViewProps {
  classId: string;
  schedules: DailySchedule[];
  onAddPeriod?: (date: string) => void;
  onEditPeriod?: (event: ScheduleEvent) => void;
}

const ScheduleView = ({ classId, schedules, onAddPeriod, onEditPeriod }: DailyScheduleViewProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'schedule.daily' });
  const { selectedDate, setSelectedDate, selectedEventId, openEventDetails, closeEventDetails } =
    useCalendarStore();

  const { events, isLoading, error } = useCalendarEvents(classId!, selectedDate);

  const selectedEvent = events.find((e) => e.id === selectedEventId) ?? null;

  const selectedDateString = format(selectedDate, 'yyyy-MM-dd');

  const todaySchedule = useMemo(() => {
    return schedules.find((schedule) => schedule.date === selectedDateString);
  }, [schedules, selectedDateString]);

  const sortedPeriods = useMemo(() => {
    if (!todaySchedule) return [];
    return [...todaySchedule.events].sort((a, b) => a.startTime!.localeCompare(b.startTime!));
  }, [todaySchedule]);

  const isToday = selectedDateString === format(new Date(), 'yyyy-MM-dd');
  const currentTime = new Date().toTimeString().slice(0, 5);

  const getPeriodStatus = (event: ScheduleEvent) => {
    if (!isToday) return 'scheduled';
    if (event.startTime && event.endTime && currentTime >= event.startTime && currentTime < event.endTime) {
      return 'current';
    }
    if (event.endTime && currentTime >= event.endTime) {
      return 'completed';
    }
    return 'upcoming';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'current':
        return <Badge className="bg-green-500">{t('status.current')}</Badge>;
      case 'completed':
        return <Badge variant="secondary">{t('status.completed')}</Badge>;
      case 'upcoming':
        return <Badge variant="outline">{t('status.upcoming')}</Badge>;
      default:
        return <Badge variant="outline">{t('status.scheduled')}</Badge>;
    }
  };

  const formatTime = (timeStr: string) => {
    return timeStr;
  };

  return (
    <div className="space-y-6">
      {/* Schedule Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {t('scheduleFor')} {format(selectedDate, 'PPPP', { locale: vi })}
            </CardTitle>
            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-fit justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, 'PPPP', { locale: vi })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                  />
                </PopoverContent>
              </Popover>
              {onAddPeriod && (
                <Button onClick={() => onAddPeriod(selectedDateString)} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('actions.addPeriod')}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedPeriods.length === 0 ? (
            <div className="text-muted-foreground py-4 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>{t('noClassesToday')}</p>
              {onAddPeriod && (
                <Button variant="outline" className="mt-4" onClick={() => onAddPeriod(selectedDateString)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('actions.addFirstPeriod')}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {sortedPeriods.map((period) => {
                const status = getPeriodStatus(period);
                return (
                  <Card
                    key={period.id}
                    className={cn(
                      'cursor-pointer transition-all duration-200 hover:shadow-md',
                      status === 'current' && 'border-green-500 bg-green-50',
                      status === 'completed' && 'opacity-75'
                    )}
                    onClick={() => onEditPeriod?.(period)}
                  >
                    <CardContent className="px-4 py-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">{period.subject}</h3>
                            {getStatusBadge(status)}
                          </div>

                          <div className="text-muted-foreground grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {period.startTime &&
                                period.endTime &&
                                `${formatTime(period.startTime)} - ${formatTime(period.endTime)}`}
                            </div>

                            {period.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {t('room')} {period.location}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="text-right">
                            <div className="text-sm font-medium">{period.subjectCode}</div>
                            {period.lessonPlanId && (
                              <div className="text-xs text-green-600">{t('hasLessonPlan')}</div>
                            )}
                          </div>

                          {status === 'current' && <Button size="sm">{t('actions.viewCurrent')}</Button>}

                          {status === 'upcoming' && isToday && (
                            <Button size="sm" variant="outline">
                              {t('actions.prepare')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Quick Stats */}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{sortedPeriods.length}</div>
                  <p className="text-muted-foreground text-xs">{t('stats.totalPeriods')}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {sortedPeriods.filter((p) => getPeriodStatus(p) === 'completed').length}
                  </div>
                  <p className="text-muted-foreground text-xs">{t('stats.completed')}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {sortedPeriods.filter((p) => ['current', 'upcoming'].includes(getPeriodStatus(p))).length}
                  </div>
                  <p className="text-muted-foreground text-xs">{t('stats.remaining')}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {sortedPeriods.filter((p) => p.lessonPlanId).length}
                  </div>
                  <p className="text-muted-foreground text-xs">{t('stats.withLessonPlan')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      {!error &&
        (isLoading ? (
          <div className="flex h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>DIT ME</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex-1 overflow-auto">
                <CalendarGrid events={events} onEventClick={(event) => openEventDetails(event.id)} />
              </div>

              <EventDetailsDialog
                event={selectedEvent}
                open={!!selectedEventId}
                onClose={closeEventDetails}
              />
            </CardContent>
          </Card>
        ))}
    </div>
  );
};

export default ScheduleView;
