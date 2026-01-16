/**
 * Date utility functions for single-timezone applications
 *
 * Configuration: Set LOCAL_TIMEZONE_OFFSET to match your timezone
 * - UTC+7 (Vietnam, Thailand): 7
 * - UTC+8 (Singapore, China): 8
 * - UTC+0 (London): 0
 */

export const LOCAL_TIMEZONE_OFFSET: number = 7; // UTC+7

/**
 * Parse date string or Date object, returns null if invalid
 */
export function parseDate(date: string | Date | null | undefined): Date | null {
  if (!date) return null;

  if (date instanceof Date) {
    return isValidDate(date) ? date : null;
  }

  const parsed = new Date(date);
  return isValidDate(parsed) ? parsed : null;
}

/**
 * Check if a Date object is valid
 */
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Safely parse date with timezone adjustment
 * Use this for all date parsing from backend
 *
 * @param date - Date string or Date object from backend
 * @returns Valid Date object (never null, falls back to current date)
 */
export function parseDateSafe(date: string | Date | null | undefined): Date {
  const parsed = parseDate(date);
  if (!parsed) return new Date();

  return adjustForLocalTimezone(parsed);
}

/**
 * Adjust date for local timezone offset
 * Backend sends UTC time, we compensate by subtracting offset to convert to local time
 */
function adjustForLocalTimezone(date: Date): Date {
  if (LOCAL_TIMEZONE_OFFSET === 7) return date;

  const offsetMs = LOCAL_TIMEZONE_OFFSET * 60 * 60 * 1000;
  return new Date(date.getTime() - offsetMs);
}
