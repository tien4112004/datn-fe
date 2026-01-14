import { formatDistanceToNow } from 'date-fns';
import { getLocaleDateFns } from '@/shared/i18n/helper';
import { parseDateSafe } from '@/shared/utils/date';
import { useTranslation } from 'react-i18next';

export function useCommentDate() {
  const { i18n } = useTranslation();

  const formatRelative = (date: Date | string): string => {
    try {
      const parsedDate = typeof date === 'string' ? parseDateSafe(date) : date;
      if (isNaN(parsedDate.getTime())) {
        return i18n.language === 'vi' ? 'gần đây' : 'recently';
      }
      return formatDistanceToNow(parsedDate, {
        addSuffix: true,
        locale: getLocaleDateFns(),
      });
    } catch {
      return i18n.language === 'vi' ? 'gần đây' : 'recently';
    }
  };

  return { formatRelative };
}
