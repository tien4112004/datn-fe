/**
 * Calendar Grid Component
 * Renders the monthly calendar grid with custom cells
 * Displays events in day cells
 */

import { CalendarEventCard } from './CalendarEventCard';
import { groupEventsByDate, toISODateString, getMonthDays } from '../../utils/calendarHelpers';
import { useCalendarStore } from '../../stores/calendarStore';
import { cn } from '@/shared/lib/utils';
import { useTranslation } from 'react-i18next';
import type { ScheduleEvent } from '../../types';

interface CalendarGridProps {
  /** Array of events to display */
  events: ScheduleEvent[];

  /** Callback when an event is clicked */
  onEventClick?: (event: ScheduleEvent) => void;
}

export function CalendarGrid({ events, onEventClick }: CalendarGridProps) {
  const { t } = useTranslation('classes');
  const { selectedDate } = useCalendarStore();

  // Group events by date for efficient lookup
  const eventsByDate = groupEventsByDate(events);

  // Get all days in the current month (including surrounding days to fill grid)
  const monthDays = getMonthDays(selectedDate);

  // Weekday labels
  const weekDays = [
    t('calendar.weekdays.sunday', 'Sun'),
    t('calendar.weekdays.monday', 'Mon'),
    t('calendar.weekdays.tuesday', 'Tue'),
    t('calendar.weekdays.wednesday', 'Wed'),
    t('calendar.weekdays.thursday', 'Thu'),
    t('calendar.weekdays.friday', 'Fri'),
    t('calendar.weekdays.saturday', 'Sat'),
  ];

  return (
    <div className="calendar-grid-container bg-white p-4">
      {/* Custom calendar grid */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        {/* Week days header */}
        <div className="grid grid-cols-7 bg-gray-50">
          {weekDays.map((day) => (
            <div
              key={day}
              className="border-b border-gray-200 p-2 text-center text-sm font-medium text-gray-600"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days grid */}
        <div className="grid grid-cols-7">
          {monthDays.map((date: Date, index: number) => {
            const dateKey = toISODateString(date);
            const dayEvents = eventsByDate.get(dateKey) ?? [];
            const isToday =
              date.getDate() === new Date().getDate() &&
              date.getMonth() === new Date().getMonth() &&
              date.getFullYear() === new Date().getFullYear();
            const isCurrentMonth = date.getMonth() === selectedDate.getMonth();

            return (
              <div
                key={index}
                className={cn(
                  'min-h-[100px] border-b border-r border-gray-200 p-2',
                  index % 7 === 6 && 'border-r-0',
                  isToday && 'bg-blue-50',
                  !isCurrentMonth && 'bg-gray-50 text-gray-400'
                )}
              >
                {/* Day number */}
                <div className={cn('mb-1 text-sm font-medium', isToday && 'text-blue-600')}>
                  {date.getDate()}
                </div>

                {/* Events */}
                <div className="flex flex-col gap-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <CalendarEventCard key={event.id} event={event} onClick={onEventClick} />
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="px-2 text-xs text-gray-500">
                      +{dayEvents.length - 3} {t('calendar.more', 'more')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
