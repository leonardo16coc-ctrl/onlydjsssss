import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enCommon from './locales/en/common.json';
import esCommon from './locales/es/common.json';
import ptBRCommon from './locales/pt-BR/common.json';
import frCommon from './locales/fr/common.json';
import deCommon from './locales/de/common.json';

const resources = {
  en: {
    common: enCommon,
  },
  es: {
    common: esCommon,
  },
  'pt-BR': {
    common: ptBRCommon,
  },
  fr: {
    common: frCommon,
  },
  de: {
    common: deCommon,
  },
};

i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources,
    fallbackLng: 'en', // Fallback to English if translation not found
    defaultNS: 'common',
    ns: ['common'],
    
    detection: {
      // Order of language detection (URL first for SEO)
      order: ['path', 'localStorage', 'navigator', 'htmlTag'],
      // Keys to lookup language from
      lookupFromPathIndex: 0, // Language is first segment in URL
      lookupLocalStorage: 'i18nextLng',
      // Cache user language
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    react: {
      useSuspense: false, // Disable suspense for now
    },
  });

export default i18n;
