/**
 * Calendar Event Card Component
 * Displays an event badge within a calendar day cell
 */

import { EVENT_CATEGORY_STYLES } from '../../types/constants/eventCategories';
import type { CalendarEvent } from '../../types/entities/calendarEvent';
import { formatTimeRange } from '../../utils/calendarHelpers';
import { cn } from '@/shared/lib/utils';

interface CalendarEventCardProps {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
}

export function CalendarEventCard({ event, onClick }: CalendarEventCardProps) {
  const styles = EVENT_CATEGORY_STYLES[event.category] ?? EVENT_CATEGORY_STYLES.other;
  const timeRange = formatTimeRange(event.startTime, event.endTime);

  return (
    <button
      type="button"
      onClick={() => onClick?.(event)}
      className={cn(
        'w-full rounded border px-2 py-1 text-left text-xs font-medium transition-colors',
        'hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
        styles.bg,
        styles.text,
        styles.border
      )}
    >
      <div className="truncate">{event.name}</div>
      {timeRange && <div className="truncate text-xs opacity-75">{timeRange}</div>}
    </button>
  );
}
