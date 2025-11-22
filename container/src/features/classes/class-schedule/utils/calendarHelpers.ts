/**
 * Calendar Helper Utilities
 * Common functions for calendar date manipulation and formatting
 */

import {
  format,
  isToday as isTodayFns,
  isPast as isPastFns,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from 'date-fns';
import type { SchedulePeriod } from '../types';

/**
 * Group periods by date for efficient calendar rendering
 *
 * @param periods - Array of calendar periods
 * @returns Map with date strings (YYYY-MM-DD) as keys and event arrays as values
 *
 * @example
 * ```ts
 * const grouped = groupEventsByDate(periods);
 * const periodsForOct20 = grouped.get('2025-10-20') ?? [];
 * ```
 */
export function groupEventsByDate(periods: SchedulePeriod[]): Map<string, SchedulePeriod[]> {
  return periods.reduce((acc, event) => {
    const dateKey = event.date;
    if (!acc.has(dateKey)) {
      acc.set(dateKey, []);
    }
    acc.get(dateKey)!.push(event);
    return acc;
  }, new Map<string, SchedulePeriod[]>());
}

/**
 * Format a date as "Month YYYY" for calendar header
 *
 * @param date - Date to format
 * @returns Formatted month/year string (e.g., "October 2025")
 *
 * @example
 * ```ts
 * formatMonthYear(new Date(2025, 9, 1)) // "October 2025"
 * ```
 */
export function formatMonthYear(date: Date): string {
  // For i18n support, this will be handled by i18next in the UI components
  return format(date, 'MMMM yyyy');
}

/**
 * Check if a date is today
 *
 * @param date - Date to check (can be Date object or ISO string)
 * @returns True if date is today
 *
 * @example
 * ```ts
 * isToday(new Date()) // true
 * isToday('2025-10-20') // false (unless today is Oct 20, 2025)
 * ```
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isTodayFns(dateObj);
}

/**
 * Check if a date is in the past
 *
 * @param date - Date to check (can be Date object or ISO string)
 * @returns True if date is before today
 *
 * @example
 * ```ts
 * isPast('2025-10-20') // true (if today is after Oct 20, 2025)
 * isPast(new Date()) // false
 * ```
 */
export function isPast(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isPastFns(dateObj);
}

/**
 * Format event time range for display
 *
 * @param startTime - Start time (HH:mm:ss format)
 * @param endTime - End time (HH:mm:ss format)
 * @returns Formatted time range (e.g., "8:00 AM - 3:00 PM") or null if no times
 *
 * @example
 * ```ts
 * formatTimeRange('08:00:00', '15:00:00') // "8:00 AM - 3:00 PM"
 * formatTimeRange(null, null) // null
 * ```
 */
export function formatTimeRange(
  startTime: string | null | undefined,
  endTime: string | null | undefined
): string | null {
  if (!startTime) return null;

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const start = formatTime(startTime);
  if (!endTime) return start;

  const end = formatTime(endTime);
  return `${start} - ${end}`;
}

/**
 * Format date as ISO string (YYYY-MM-DD)
 *
 * @param date - Date to format
 * @returns ISO date string
 *
 * @example
 * ```ts
 * toISODateString(new Date(2025, 9, 20)) // "2025-10-20"
 * ```
 */
export function toISODateString(date: Date): string {
  // Validate date before formatting
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.error('Invalid date passed to toISODateString:', date);
    return format(new Date(), 'yyyy-MM-dd'); // Fallback to today
  }
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get all days to display in a calendar month view
 * Includes days from previous/next months to fill the grid
 *
 * @param date - Any date within the target month
 * @returns Array of Date objects for the full calendar grid
 *
 * @example
 * ```ts
 * const days = getMonthDays(new Date(2025, 9, 20)); // October 2025
 * // Returns array starting from Sunday of first week to Saturday of last week
 * ```
 */
export function getMonthDays(date: Date): Date[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
}
