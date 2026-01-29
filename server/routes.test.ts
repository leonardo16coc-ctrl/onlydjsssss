import { describe, it, expect } from 'vitest';
import {
  getLanguageFromPath,
  getRouteKeyFromPath,
  getLocalizedPath,
  changeLanguage,
  removeLanguagePrefix,
  ROUTE_TRANSLATIONS,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  type Language,
} from '../client/src/lib/routes';

describe('Localized Routes System', () => {
  describe('Language Detection', () => {
    it('should detect language from URL path', () => {
      expect(getLanguageFromPath('/en/explore')).toBe('en');
      expect(getLanguageFromPath('/es/explorar')).toBe('es');
      expect(getLanguageFromPath('/fr/explorer')).toBe('fr');
      expect(getLanguageFromPath('/de/erkunden')).toBe('de');
      expect(getLanguageFromPath('/pt-BR/explorar')).toBe('pt-BR');
    });

    it('should return default language for paths without language prefix', () => {
      expect(getLanguageFromPath('/explore')).toBe(DEFAULT_LANGUAGE);
      expect(getLanguageFromPath('/')).toBe(DEFAULT_LANGUAGE);
      expect(getLanguageFromPath('/unknown')).toBe(DEFAULT_LANGUAGE);
    });

    it('should handle paths with trailing slashes', () => {
      expect(getLanguageFromPath('/en/')).toBe('en');
      expect(getLanguageFromPath('/es/explorar/')).toBe('es');
    });
  });

  describe('Route Key Extraction', () => {
    it('should extract route key from English path', () => {
      expect(getRouteKeyFromPath('/en/explore', 'en')).toBe('explore');
      expect(getRouteKeyFromPath('/en/upload', 'en')).toBe('upload');
      expect(getRouteKeyFromPath('/en/membership', 'en')).toBe('membership');
      expect(getRouteKeyFromPath('/en', 'en')).toBe('home');
    });

    it('should extract route key from Spanish path', () => {
      expect(getRouteKeyFromPath('/es/explorar', 'es')).toBe('explore');
      expect(getRouteKeyFromPath('/es/subir', 'es')).toBe('upload');
      expect(getRouteKeyFromPath('/es/suscripcion', 'es')).toBe('membership');
      expect(getRouteKeyFromPath('/es', 'es')).toBe('home');
    });

    it('should extract route key from French path', () => {
      expect(getRouteKeyFromPath('/fr/explorer', 'fr')).toBe('explore');
      expect(getRouteKeyFromPath('/fr/telecharger', 'fr')).toBe('upload');
      expect(getRouteKeyFromPath('/fr/abonnement', 'fr')).toBe('membership');
    });

    it('should extract route key from German path', () => {
      expect(getRouteKeyFromPath('/de/erkunden', 'de')).toBe('explore');
      expect(getRouteKeyFromPath('/de/hochladen', 'de')).toBe('upload');
      expect(getRouteKeyFromPath('/de/mitgliedschaft', 'de')).toBe('membership');
    });

    it('should extract route key from Portuguese path', () => {
      expect(getRouteKeyFromPath('/pt-BR/explorar', 'pt-BR')).toBe('explore');
      expect(getRouteKeyFromPath('/pt-BR/enviar', 'pt-BR')).toBe('upload');
      expect(getRouteKeyFromPath('/pt-BR/assinatura', 'pt-BR')).toBe('membership');
    });
  });

  describe('Localized Path Generation', () => {
    it('should generate English localized paths', () => {
      expect(getLocalizedPath('home', 'en')).toBe('/en');
      expect(getLocalizedPath('explore', 'en')).toBe('/en/explore');
      expect(getLocalizedPath('upload', 'en')).toBe('/en/upload');
      expect(getLocalizedPath('membership', 'en')).toBe('/en/membership');
      expect(getLocalizedPath('dj-mode', 'en')).toBe('/en/dj-mode');
    });

    it('should generate Spanish localized paths', () => {
      expect(getLocalizedPath('home', 'es')).toBe('/es');
      expect(getLocalizedPath('explore', 'es')).toBe('/es/explorar');
      expect(getLocalizedPath('upload', 'es')).toBe('/es/subir');
      expect(getLocalizedPath('membership', 'es')).toBe('/es/suscripcion');
      expect(getLocalizedPath('dj-mode', 'es')).toBe('/es/modo-dj');
    });

    it('should generate French localized paths', () => {
      expect(getLocalizedPath('home', 'fr')).toBe('/fr');
      expect(getLocalizedPath('explore', 'fr')).toBe('/fr/explorer');
      expect(getLocalizedPath('upload', 'fr')).toBe('/fr/telecharger');
      expect(getLocalizedPath('membership', 'fr')).toBe('/fr/abonnement');
      expect(getLocalizedPath('dj-mode', 'fr')).toBe('/fr/mode-dj');
    });

    it('should generate German localized paths', () => {
      expect(getLocalizedPath('home', 'de')).toBe('/de');
      expect(getLocalizedPath('explore', 'de')).toBe('/de/erkunden');
      expect(getLocalizedPath('upload', 'de')).toBe('/de/hochladen');
      expect(getLocalizedPath('membership', 'de')).toBe('/de/mitgliedschaft');
      expect(getLocalizedPath('dj-mode', 'de')).toBe('/de/dj-modus');
    });

    it('should generate Portuguese localized paths', () => {
      expect(getLocalizedPath('home', 'pt-BR')).toBe('/pt-BR');
      expect(getLocalizedPath('explore', 'pt-BR')).toBe('/pt-BR/explorar');
      expect(getLocalizedPath('upload', 'pt-BR')).toBe('/pt-BR/enviar');
      expect(getLocalizedPath('membership', 'pt-BR')).toBe('/pt-BR/assinatura');
      expect(getLocalizedPath('dj-mode', 'pt-BR')).toBe('/pt-BR/modo-dj');
    });
  });

  describe('Language Switching', () => {
    it('should change language while preserving route', () => {
      // From English to Spanish
      expect(changeLanguage('/en/explore', 'es')).toBe('/es/explorar');
      expect(changeLanguage('/en/upload', 'es')).toBe('/es/subir');
      expect(changeLanguage('/en/membership', 'es')).toBe('/es/suscripcion');

      // From Spanish to French
      expect(changeLanguage('/es/explorar', 'fr')).toBe('/fr/explorer');
      expect(changeLanguage('/es/subir', 'fr')).toBe('/fr/telecharger');

      // From French to German
      expect(changeLanguage('/fr/explorer', 'de')).toBe('/de/erkunden');
      expect(changeLanguage('/fr/abonnement', 'de')).toBe('/de/mitgliedschaft');

      // From German to Portuguese
      expect(changeLanguage('/de/erkunden', 'pt-BR')).toBe('/pt-BR/explorar');
      expect(changeLanguage('/de/hochladen', 'pt-BR')).toBe('/pt-BR/enviar');
    });

    it('should handle home route when changing language', () => {
      expect(changeLanguage('/en', 'es')).toBe('/es');
      expect(changeLanguage('/es', 'fr')).toBe('/fr');
      expect(changeLanguage('/fr', 'de')).toBe('/de');
      expect(changeLanguage('/de', 'pt-BR')).toBe('/pt-BR');
    });
  });

  describe('Language Prefix Removal', () => {
    it('should remove language prefix from path', () => {
      expect(removeLanguagePrefix('/en/explore')).toBe('/explore');
      expect(removeLanguagePrefix('/es/explorar')).toBe('/explorar');
      expect(removeLanguagePrefix('/fr/explorer')).toBe('/explorer');
      expect(removeLanguagePrefix('/de/erkunden')).toBe('/erkunden');
      expect(removeLanguagePrefix('/pt-BR/explorar')).toBe('/explorar');
    });

    it('should handle paths without language prefix', () => {
      expect(removeLanguagePrefix('/explore')).toBe('/explore');
      expect(removeLanguagePrefix('/')).toBe('/');
    });

    it('should handle home route', () => {
      expect(removeLanguagePrefix('/en')).toBe('/');
      expect(removeLanguagePrefix('/es')).toBe('/');
      expect(removeLanguagePrefix('/fr')).toBe('/');
    });
  });

  describe('Route Translations Completeness', () => {
    it('should have all route keys in all languages', () => {
      const routeKeys = Object.keys(ROUTE_TRANSLATIONS.en);
      
      for (const lang of SUPPORTED_LANGUAGES) {
        const langRoutes = ROUTE_TRANSLATIONS[lang];
        expect(Object.keys(langRoutes)).toEqual(routeKeys);
      }
    });

    it('should have non-empty translations for all routes', () => {
      for (const lang of SUPPORTED_LANGUAGES) {
        const langRoutes = ROUTE_TRANSLATIONS[lang];
        
        for (const [key, value] of Object.entries(langRoutes)) {
          // Home route can be empty string
          if (key !== 'home') {
            expect(value).toBeTruthy();
            expect(value.length).toBeGreaterThan(0);
          }
        }
      }
    });

    it('should have unique translations within each language', () => {
      for (const lang of SUPPORTED_LANGUAGES) {
        const langRoutes = ROUTE_TRANSLATIONS[lang];
        const values = Object.values(langRoutes).filter(v => v !== '');
        const uniqueValues = new Set(values);
        
        expect(uniqueValues.size).toBe(values.length);
      }
    });
  });

  describe('Supported Languages', () => {
    it('should have exactly 5 supported languages', () => {
      expect(SUPPORTED_LANGUAGES.length).toBe(5);
    });

    it('should include all expected languages', () => {
      expect(SUPPORTED_LANGUAGES).toContain('en');
      expect(SUPPORTED_LANGUAGES).toContain('es');
      expect(SUPPORTED_LANGUAGES).toContain('pt-BR');
      expect(SUPPORTED_LANGUAGES).toContain('fr');
      expect(SUPPORTED_LANGUAGES).toContain('de');
    });

    it('should have English as default language', () => {
      expect(DEFAULT_LANGUAGE).toBe('en');
    });
  });
});
