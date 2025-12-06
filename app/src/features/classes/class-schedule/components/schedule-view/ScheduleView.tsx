import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, CalendarIcon, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import ScheduleStatsDisplay from './ScheduleStats';
import { getLocaleDateFns } from '@/shared/i18n/helper';
import { CalendarGrid } from '../calendar/CalendarGrid';
import { useTranslation } from 'react-i18next';
import useScheduleStore from '../../stores/scheduleStore';
import { useClassSchedules } from '../../hooks/useApi';
import { useScheduleHelpers } from '../../hooks/useScheduleHelpers';
import { useMemo } from 'react';

type ScheduleViewProps = {
  classId: string;
  onAddPeriod?: (date: string) => void;
};

const ScheduleView = ({ classId, onAddPeriod }: ScheduleViewProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'schedule.daily' });

  const { selectedDate, setSelectedDate, nextMonth, prevMonth, openPeriodDetails } = useScheduleStore();
  const selectedDateString = format(selectedDate, 'yyyy-MM-dd');

  const monthStart = format(startOfMonth(selectedDate), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(selectedDate), 'yyyy-MM-dd');

  const { data: schedulesData, isLoading } = useClassSchedules(classId, {
    startDate: monthStart,
    endDate: monthEnd,
  });
  const schedules = schedulesData?.data || [];

  const { getScheduleStats, findScheduleForDate } = useScheduleHelpers();

  // Find the schedule for the selected date from the raw list
  const selectedDateSchedule = useMemo(() => {
    return findScheduleForDate(schedules, selectedDateString, classId);
  }, [schedules, selectedDateString, classId]);

  // Calculate statistics for the selected date
  const stats = getScheduleStats(selectedDateSchedule);

  // Extract all periods from the month's schedules for the calendar
  const periods = useMemo(() => {
    return schedules.flatMap((schedule) => schedule.periods);
  }, [schedules]);

  return (
    <>
      {/* Schedule List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {t('scheduleFor')} {format(selectedDate, 'PPPP', { locale: getLocaleDateFns() })}
            </CardTitle>
            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-fit justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, 'PPPP', { locale: getLocaleDateFns() })}
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
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : selectedDateSchedule.periods.length === 0 ? (
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
            <ScheduleStatsDisplay stats={stats} />
          )}
        </CardContent>
      </Card>
      {!isLoading &&
        (false ? (
          <div className="flex h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {t('scheduleFor')} {format(selectedDate, 'MMMM, yyyy', { locale: getLocaleDateFns() })}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex-1 overflow-auto">
                <CalendarGrid periods={periods} onPeriodClick={(period) => openPeriodDetails(period)} />
              </div>
            </CardContent>
          </Card>
        ))}
    </>
  );
};

export default ScheduleView;
