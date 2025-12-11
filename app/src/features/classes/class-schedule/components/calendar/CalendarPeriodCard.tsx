/**
 * Calendar Period Card Component
 * Displays an period badge within a calendar day cell
 */

import { PERIOD_CATEGORY_STYLES, type SchedulePeriod } from '../../../shared/types';
import { formatTimeRange } from '../../utils/calendarHelpers';
import { cn } from '@/shared/lib/utils';

interface CalendarPeriodCardProps {
  period: SchedulePeriod;
  onClick?: (period: SchedulePeriod) => void;
}

export function CalendarPeriodCard({ period, onClick }: CalendarPeriodCardProps) {
  const styles = PERIOD_CATEGORY_STYLES[period.category] ?? PERIOD_CATEGORY_STYLES.other;
  const timeRange = formatTimeRange(period.startTime, period.endTime);

  return (
    <button
      type="button"
      onClick={() => onClick?.(period)}
      className={cn(
        'w-full rounded border px-2 py-1 text-left text-xs font-medium transition-colors',
        'hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
        styles.bg,
        styles.text,
        styles.border
      )}
    >
      <div className="truncate">{period.name}</div>
      {timeRange && <div className="truncate text-xs opacity-75">{timeRange}</div>}
    </button>
  );
}
