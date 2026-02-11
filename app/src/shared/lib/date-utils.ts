import { formatDistanceToNow as dateFnsFormatDistanceToNow } from 'date-fns';
import { getLocaleDateFns } from '@/shared/i18n/helper';

/**
 * Custom hook that provides a locale-aware formatDistanceToNow function
 * Automatically uses the appropriate locale based on current i18n language
 * Uses the existing getLocaleDateFns() helper for consistency
 */
export const useFormattedDistance = () => {
  const formatDistanceToNow = (
    date: Date | number,
    options?: {
      addSuffix?: boolean;
      includeSeconds?: boolean;
    }
  ) => {
    return dateFnsFormatDistanceToNow(date, {
      ...options,
      locale: getLocaleDateFns(),
    });
  };

  return { formatDistanceToNow };
};
