/**
 * Generate initials from first and last name
 */
export function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.trim() || '';
  const last = lastName?.trim() || '';

  if (!first && !last) return '??';

  const firstInitial = first.charAt(0).toUpperCase();
  const lastInitial = last.charAt(0).toUpperCase();

  return `${firstInitial}${lastInitial}`;
}

/**
 * Format ISO date string to locale date
 */
export function formatDate(dateString?: string | null, locale: string = 'en-US'): string {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return 'Invalid date';
  }
}

/**
 * Format number as percentage
 */
export function formatPercentage(value: number, precision: number = 0): string {
  return `${value.toFixed(precision)}%`;
}
