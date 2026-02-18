import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { questionsEn } from '@aiprimary/question';

i18n.use(initReactI18next).init({
  lng: 'en',
  resources: {
    en: { questions: questionsEn },
  },
  defaultNS: 'questions',
  interpolation: { escapeValue: false },
});

export default i18n;
