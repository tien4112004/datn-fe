import { useCreateBlockNote } from '@blocknote/react';
import { useTranslation } from 'react-i18next';
import * as locales from '@blocknote/core/locales';
import type { BlockNoteEditorOptions, BlockSchema, InlineContentSchema, StyleSchema } from '@blocknote/core';

export const useRichTextEditor = (
  options: Partial<BlockNoteEditorOptions<BlockSchema | any, InlineContentSchema, StyleSchema>> = {}
) => {
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
