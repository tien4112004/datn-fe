import { ChevronLeft, ChevronRight, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@ui/button';
import { useTranslation } from 'react-i18next';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  parseISO,
} from 'date-fns';
import { getLocaleDateFns } from '@/shared/i18n/helper';
import { useState, useMemo } from 'react';
import { useTeacherCalendar } from '../hooks/useTeacherCalendar';
import type { CalendarEvent, CalendarEventType } from '../api/types';
import { cn } from '@/shared/lib/utils';

const getEventColor = (type: CalendarEventType, status?: string) => {
  if (status === 'overdue') return 'bg-red-500';

  switch (type) {
    case 'DEADLINE':
      return status === 'due-soon' ? 'bg-orange-500' : 'bg-blue-500';
    case 'GRADING_REMINDER':
      return 'bg-orange-500';
    case 'ASSIGNMENT_RETURNED':
      return 'bg-green-500';
    case 'EXAM':
      return 'bg-purple-500';
    case 'CLASS_SESSION':
      return 'bg-cyan-500';
    default:
      return 'bg-gray-500';
  }
};

export const EnhancedCalendar = () => {
  const { t } = useTranslation('dashboard');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get calendar events for the current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const { events, isLoading } = useTeacherCalendar(monthStart, monthEnd);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const firstDayOfWeek = monthStart.getDay();

    // Add previous month days
    const prevMonthDays = Array.from({ length: firstDayOfWeek }, (_, i) => {
      const date = new Date(monthStart);
      date.setDate(date.getDate() - (firstDayOfWeek - i));
      return date;
    });

    // Add next month days to complete the grid
    const totalCells = [...prevMonthDays, ...days].length;
    const nextMonthDays =
      totalCells % 7 === 0
        ? []
        : Array.from({ length: 7 - (totalCells % 7) }, (_, i) => {
            const date = new Date(monthEnd);
            date.setDate(date.getDate() + i + 1);
            return date;
          });

    return [...prevMonthDays, ...days, ...nextMonthDays];
  }, [currentDate]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();
    events.forEach((event) => {
      const dateKey = format(parseISO(event.date), 'yyyy-MM-dd');
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(event);
    });
    return grouped;
  }, [events]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return eventsByDate.get(dateKey) || [];
  }, [selectedDate, eventsByDate]);

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
    setSelectedDate(null);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(isSameDay(date, selectedDate || new Date('1900-01-01')) ? null : date);
  };

  const monthString = format(currentDate, 'MMMM yyyy', { locale: getLocaleDateFns() });

  const weekdays = [
    t('calendar.weekdays.sunday'),
    t('calendar.weekdays.monday'),
    t('calendar.weekdays.tuesday'),
    t('calendar.weekdays.wednesday'),
    t('calendar.weekdays.thursday'),
    t('calendar.weekdays.friday'),
    t('calendar.weekdays.saturday'),
  ];

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold sm:text-lg">{t('calendar.title')}</h3>
      </div>

      <div className="bg-card rounded-lg border p-3 sm:p-4">
        {/* Calendar Header */}
        <div className="mb-3 flex items-center justify-between sm:mb-4">
          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={handlePrevMonth}>
            <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
          <span className="text-xs font-medium sm:text-sm">{monthString}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={handleNextMonth}>
            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-1.5 sm:space-y-2">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-0.5 text-center sm:gap-1">
            {weekdays.map((day) => (
              <div key={day} className="text-muted-foreground text-[10px] font-medium sm:text-xs">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {calendarDays.map((day, index) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayEvents = eventsByDate.get(dateKey) || [];
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    'relative aspect-square rounded-md p-0 text-[10px] transition-colors sm:text-sm',
                    !isCurrentMonth && 'text-muted-foreground/50',
                    isCurrentMonth && 'hover:bg-muted',
                    isSelected && 'bg-primary text-primary-foreground hover:bg-primary/90',
                    isTodayDate && !isSelected && 'border-primary border-2 font-bold'
                  )}
                >
                  <span>{format(day, 'd')}</span>
                  {/* Event indicators */}
                  {dayEvents.length > 0 && (
                    <div className="absolute bottom-0.5 left-1/2 flex -translate-x-1/2 gap-0.5">
                      {dayEvents.slice(0, 3).map((event, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'h-1 w-1 rounded-full',
                            getEventColor(event.type as CalendarEventType, event.status)
                          )}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Events */}
        {selectedDate && (
          <div className="mt-4 border-t pt-4">
            <h4 className="mb-2 text-sm font-semibold">
              {format(selectedDate, 'PPPP', { locale: getLocaleDateFns() })}
            </h4>
            {selectedDateEvents.length === 0 ? (
              <p className="text-muted-foreground text-xs">{t('calendar.noEvents')}</p>
            ) : (
              <div className="space-y-2">
                {selectedDateEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-2 rounded-md border p-2 text-xs">
                    <div
                      className={cn(
                        'mt-0.5 h-2 w-2 flex-shrink-0 rounded-full',
                        getEventColor(event.type as CalendarEventType, event.status)
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{event.title}</p>
                      <p className="text-muted-foreground truncate text-[10px]">{event.className}</p>
                    </div>
                    {event.status === 'overdue' && (
                      <AlertCircle className="h-3 w-3 flex-shrink-0 text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-muted-foreground mt-4 flex items-center justify-center py-2 text-xs">
            <Clock className="mr-2 h-3 w-3 animate-spin" />
            {t('calendar.loading')}
          </div>
        )}
      </div>
    </div>
  );
};
