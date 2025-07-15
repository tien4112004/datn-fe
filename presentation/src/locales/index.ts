import { createI18n } from 'vue-i18n';
import en from './en/index';
import vi from './vi/index';

const getDefaultLocale = (): string => {
  const savedLocale = localStorage.getItem('locale');
  if (savedLocale && ['en', 'vi'].includes(savedLocale)) {
    return savedLocale;
  }

  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('vi')) return 'vi';

  return 'en';
};

const saveLocale = (locale: string) => {
  localStorage.setItem('locale', locale);
};

export const availableLocales = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
];

const i18n = createI18n({
  locale: getDefaultLocale(),
  fallbackLocale: 'en',
  messages: {
    en,
    vi,
  },
  legacy: false,
  globalInjection: true,
});

export const changeLocale = (locale: string) => {
  if (availableLocales.some((l) => l.code === locale)) {
    i18n.global.locale.value = locale as Locale;
    saveLocale(locale);
    document.documentElement.lang = locale;
    return true;
  }
  return false;
};

export const getCurrentLocale = () => {
  return i18n.global.locale.value;
};

export const getAvailableLocales = () => {
  return availableLocales;
};

export type Locale = 'en' | 'vi';
export type LocaleInfo = {
  code: Locale;
  name: string;
  flag: string;
};

export default i18n;
