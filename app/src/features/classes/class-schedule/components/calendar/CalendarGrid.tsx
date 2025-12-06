/**
 * Calendar Grid Component
 * Renders the monthly calendar grid with custom cells
 * Displays periods in day cells
 */

import { CalendarPeriodCard } from './CalendarPeriodCard';
import { groupEventsByDate, toISODateString, getMonthDays } from '../../utils/calendarHelpers';
import { useScheduleStore } from '../..';
import { cn } from '@/shared/lib/utils';
import { useTranslation } from 'react-i18next';
import type { SchedulePeriod } from '../../../shared/types';
import { useState } from 'react';

interface CalendarGridProps {
  /** Array of periods to display */
  periods: SchedulePeriod[];

  /** Callback when an period is clicked */
  onPeriodClick?: (period: SchedulePeriod) => void;
}

export function CalendarGrid({ periods, onPeriodClick }: CalendarGridProps) {
  const { t } = useTranslation('classes');
  const { selectedDate } = useScheduleStore();
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  // Group periods by date for efficient lookup
  const periodsByDate = groupEventsByDate(periods);

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
            const dayEvents = periodsByDate.get(dateKey) ?? [];
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
                  {(expandedDays.has(dateKey) ? dayEvents : dayEvents.slice(0, 3)).map((period) => (
                    <CalendarPeriodCard key={period.id} period={period} onClick={onPeriodClick} />
                  ))}
                  {dayEvents.length > 3 && (
                    <div
                      className="cursor-pointer px-2 text-xs text-gray-500 hover:text-gray-700"
                      onClick={() => {
                        setExpandedDays((prev) => {
                          const newSet = new Set(prev);
                          if (newSet.has(dateKey)) {
                            newSet.delete(dateKey);
                          } else {
                            newSet.add(dateKey);
                          }
                          return newSet;
                        });
                      }}
                    >
                      {expandedDays.has(dateKey)
                        ? t('calendar.showLess', 'show less')
                        : `+${dayEvents.length - 3} ${t('calendar.more', 'more')}`}
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
