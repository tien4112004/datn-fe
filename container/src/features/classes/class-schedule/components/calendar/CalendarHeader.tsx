/**
 * Calendar Header Component
 * Displays month/year and provides navigation controls
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useScheduleStore } from '../../stores/scheduleStore';
import { formatMonthYear } from '../../utils/calendarHelpers';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function CalendarHeader({ goBackLink }: { goBackLink?: string }) {
  const { t } = useTranslation('classes');
  const { selectedDate, nextMonth, prevMonth, goToToday } = useScheduleStore();

  return (
    <div className="flex items-center justify-between border-b bg-white px-6 py-4">
      <div className="flex items-center justify-center gap-2">
        <Link to={goBackLink} className="flex items-center">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-2xl font-semibold text-gray-900">{formatMonthYear(selectedDate)}</h2>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={goToToday} className="hidden sm:flex">
          {t('calendar.today', 'Today')}
        </Button>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevMonth}
            aria-label={t('calendar.previousMonth', 'Previous month')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            aria-label={t('calendar.nextMonth', 'Next month')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
