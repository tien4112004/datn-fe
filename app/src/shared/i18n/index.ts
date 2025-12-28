import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from './locales/en';
import viTranslation from './locales/vi';

/**
 * i18n configuration with namespace support
 *
 * Available namespaces:
 * - common: Navigation, pages, and table translations
 * - glossary: Shared UI elements, actions, and states
 * - errors: Error messages, boundaries, and validation
 * - presentation: Presentation creation and management
 * - image: Image generation features
 * - projects: Project management page
 * - settings: Settings page
 * - mindmaps: Mindmap creation and management
 * - auth: Authentication and user management
 * - classes: Class management and details
 *
 * Usage:
 * const { t } = useTranslation('namespace');
 * t('key.path')
 *
 * Or access multiple namespaces:
 * const { t } = useTranslation(['common', 'glossary']);
 * t('common:navigation.sidebar.home')
 * t('glossary:actions.save')
 */
i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize
  .init({
    resources: {
      en: enTranslation,
      vi: viTranslation,
    },
    fallbackLng: 'en',
    // Default namespace if none specified
    defaultNS: 'common',
    // Namespaces to load by default
    ns: [
      'common',
      'glossary',
      'errors',
      'presentation',
      'image',
      'projects',
      'settings',
      'mindmap',
      'auth',
      'classes',
      'assignment',
      'admin',
      'examMatrix',
    ],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    // Return key if translation is missing
    returnNull: false,
    // Keep translation key if missing
    saveMissing: false,
  });

export default i18n;
