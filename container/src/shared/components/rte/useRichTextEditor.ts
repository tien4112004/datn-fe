import { useCreateBlockNote } from '@blocknote/react';
import { useTranslation } from 'react-i18next';
import * as locales from '@blocknote/core/locales';

export const useRichTextEditor = (options: Parameters<typeof useCreateBlockNote>[0] = {}) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  return useCreateBlockNote({
    dictionary: {
      ...(locales[currentLanguage as keyof typeof locales] || locales.en),
      ...options.dictionary,
    },
    ...options,
  });
};
