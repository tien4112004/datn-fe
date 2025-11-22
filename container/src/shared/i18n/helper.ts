import { vi } from 'date-fns/locale';
import i18n from '.';

export const getLocaleDateFns = () => {
  const locale = i18n.language;
  switch (locale) {
    case 'vi':
      return vi;
    default:
      return undefined;
  }
};
