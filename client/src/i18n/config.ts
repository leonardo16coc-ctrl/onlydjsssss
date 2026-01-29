import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { customLanguageDetector, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './languageDetector';

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

// Configure language detector with custom detector
const languageDetector = new LanguageDetector();
languageDetector.addDetector(customLanguageDetector);

i18n
  .use(languageDetector) // Use custom language detector
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    defaultNS: 'common',
    ns: ['common'],
    
    detection: {
      // Order: custom detector (includes localStorage + browser detection)
      order: ['customBrowserDetector'],
      caches: [], // Caching handled by custom detector
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    react: {
      useSuspense: false, // Disable suspense for now
    },
  });

export default i18n;
