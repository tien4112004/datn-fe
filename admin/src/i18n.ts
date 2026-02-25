import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { questionsEn } from '@aiprimary/question';
import adminEn from './locales/en';

i18n.use(initReactI18next).init({
  lng: 'en',
  resources: {
    en: {
      questions: questionsEn,
      admin: adminEn,
    },
  },
  defaultNS: 'questions',
  interpolation: { escapeValue: false },
});

export default i18n;
