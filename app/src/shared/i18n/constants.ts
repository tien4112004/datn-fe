/**
 * Translation namespace constants
 * Use these constants to ensure type safety and avoid typos
 */

export const I18N_NAMESPACES = {
  COMMON: 'common',
  GLOSSARY: 'glossary',
  ERRORS: 'errors',
  AUTH: 'auth',
  PRESENTATION: 'presentation',
  IMAGE: 'image',
  PROJECTS: 'projects',
  SETTINGS: 'settings',
  MINDMAP: 'mindmap',
  CLASSES: 'classes',
  ASSIGNMENT: 'assignment',
  EXAM_MATRIX: 'assessmentMatrix',
} as const;

export type I18nNamespace = (typeof I18N_NAMESPACES)[keyof typeof I18N_NAMESPACES];

/**
 * Supported languages
 */
export const SUPPORTED_LANGUAGES = {
  EN: 'en',
  VI: 'vi',
} as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[keyof typeof SUPPORTED_LANGUAGES];

/**
 * Language metadata for display in UI
 */
export const LANGUAGE_METADATA = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
  vi: {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
  },
} as const;

/**
 * Get all available language options for UI
 */
export function getLanguageOptions() {
  return Object.values(LANGUAGE_METADATA);
}

/**
 * Example usage in components:
 *
 * import { useTranslation } from 'react-i18next';
 * import { I18N_NAMESPACES } from '@/shared/i18n/constants';
 *
 * function MyComponent() {
 *   const { t } = useTranslation(I18N_NAMESPACES.GLOSSARY);
 *   return <button>{t('actions.save')}</button>;
 * }
 *
 * // For common namespace (navigation, pages, table)
 * function NavComponent() {
 *   const { t } = useTranslation(I18N_NAMESPACES.COMMON);
 *   return <h1>{t('navigation.sidebar.home')}</h1>;
 * }
 */
