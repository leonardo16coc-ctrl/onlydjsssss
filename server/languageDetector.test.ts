import { describe, it, expect } from 'vitest';
import {
  normalizeLanguage,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
} from '../client/src/i18n/languageDetector';

describe('Language Detector System', () => {
  describe('Supported Languages Configuration', () => {
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

    it('should have unique language codes', () => {
      const uniqueLangs = new Set(SUPPORTED_LANGUAGES);
      expect(uniqueLangs.size).toBe(SUPPORTED_LANGUAGES.length);
    });
  });

  describe('Language Normalization - English Variants', () => {
    it('should normalize en to en', () => {
      expect(normalizeLanguage('en')).toBe('en');
    });

    it('should normalize en-US to en', () => {
      expect(normalizeLanguage('en-US')).toBe('en');
    });

    it('should normalize en-GB to en', () => {
      expect(normalizeLanguage('en-GB')).toBe('en');
    });

    it('should normalize en-CA to en', () => {
      expect(normalizeLanguage('en-CA')).toBe('en');
    });

    it('should normalize en-AU to en', () => {
      expect(normalizeLanguage('en-AU')).toBe('en');
    });

    it('should normalize en-NZ to en', () => {
      expect(normalizeLanguage('en-NZ')).toBe('en');
    });
  });

  describe('Language Normalization - Spanish Variants', () => {
    it('should normalize es to es', () => {
      expect(normalizeLanguage('es')).toBe('es');
    });

    it('should normalize es-ES to es', () => {
      expect(normalizeLanguage('es-ES')).toBe('es');
    });

    it('should normalize es-MX (Mexico) to es', () => {
      expect(normalizeLanguage('es-MX')).toBe('es');
    });

    it('should normalize es-AR (Argentina) to es', () => {
      expect(normalizeLanguage('es-AR')).toBe('es');
    });

    it('should normalize es-CO (Colombia) to es', () => {
      expect(normalizeLanguage('es-CO')).toBe('es');
    });

    it('should normalize es-CL (Chile) to es', () => {
      expect(normalizeLanguage('es-CL')).toBe('es');
    });

    it('should normalize es-PE (Peru) to es', () => {
      expect(normalizeLanguage('es-PE')).toBe('es');
    });

    it('should normalize es-VE (Venezuela) to es', () => {
      expect(normalizeLanguage('es-VE')).toBe('es');
    });

    it('should normalize es-UY (Uruguay) to es', () => {
      expect(normalizeLanguage('es-UY')).toBe('es');
    });

    it('should normalize es-419 (Latin America) to es via base language', () => {
      expect(normalizeLanguage('es-419')).toBe('es');
    });
  });

  describe('Language Normalization - Portuguese Variants', () => {
    it('should normalize pt to pt-BR', () => {
      expect(normalizeLanguage('pt')).toBe('pt-BR');
    });

    it('should normalize pt-BR (Brazilian) to pt-BR', () => {
      expect(normalizeLanguage('pt-BR')).toBe('pt-BR');
    });

    it('should normalize pt-PT (European) to pt-BR', () => {
      expect(normalizeLanguage('pt-PT')).toBe('pt-BR');
    });
  });

  describe('Language Normalization - French Variants', () => {
    it('should normalize fr to fr', () => {
      expect(normalizeLanguage('fr')).toBe('fr');
    });

    it('should normalize fr-FR to fr', () => {
      expect(normalizeLanguage('fr-FR')).toBe('fr');
    });

    it('should normalize fr-CA (Canadian) to fr', () => {
      expect(normalizeLanguage('fr-CA')).toBe('fr');
    });

    it('should normalize fr-BE (Belgian) to fr', () => {
      expect(normalizeLanguage('fr-BE')).toBe('fr');
    });

    it('should normalize fr-CH (Swiss) to fr', () => {
      expect(normalizeLanguage('fr-CH')).toBe('fr');
    });
  });

  describe('Language Normalization - German Variants', () => {
    it('should normalize de to de', () => {
      expect(normalizeLanguage('de')).toBe('de');
    });

    it('should normalize de-DE to de', () => {
      expect(normalizeLanguage('de-DE')).toBe('de');
    });

    it('should normalize de-AT (Austrian) to de', () => {
      expect(normalizeLanguage('de-AT')).toBe('de');
    });

    it('should normalize de-CH (Swiss) to de', () => {
      expect(normalizeLanguage('de-CH')).toBe('de');
    });
  });

  describe('Language Normalization - Unsupported Languages', () => {
    it('should return null for Japanese', () => {
      expect(normalizeLanguage('ja')).toBeNull();
      expect(normalizeLanguage('ja-JP')).toBeNull();
    });

    it('should return null for Chinese', () => {
      expect(normalizeLanguage('zh')).toBeNull();
      expect(normalizeLanguage('zh-CN')).toBeNull();
      expect(normalizeLanguage('zh-TW')).toBeNull();
    });

    it('should return null for Russian', () => {
      expect(normalizeLanguage('ru')).toBeNull();
      expect(normalizeLanguage('ru-RU')).toBeNull();
    });

    it('should return null for Italian', () => {
      expect(normalizeLanguage('it')).toBeNull();
      expect(normalizeLanguage('it-IT')).toBeNull();
    });

    it('should return null for Korean', () => {
      expect(normalizeLanguage('ko')).toBeNull();
      expect(normalizeLanguage('ko-KR')).toBeNull();
    });

    it('should return null for Arabic', () => {
      expect(normalizeLanguage('ar')).toBeNull();
      expect(normalizeLanguage('ar-SA')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(normalizeLanguage('')).toBeNull();
    });

    it('should return null for invalid language codes', () => {
      expect(normalizeLanguage('invalid')).toBeNull();
      expect(normalizeLanguage('xx-YY')).toBeNull();
      expect(normalizeLanguage('123')).toBeNull();
    });
  });

  describe('Language Normalization - Edge Cases', () => {
    it('should handle base language fallback for unknown variants', () => {
      // es-419 not in exact map, but "es" base should work
      expect(normalizeLanguage('es-419')).toBe('es');
      
      // en-ZZ not in exact map, but "en" base should work
      expect(normalizeLanguage('en-ZZ')).toBe('en');
    });

    it('should return null for unknown base language with variant', () => {
      expect(normalizeLanguage('ja-XX')).toBeNull();
      expect(normalizeLanguage('zh-XX')).toBeNull();
    });

    it('should handle three-letter language codes', () => {
      expect(normalizeLanguage('eng')).toBeNull(); // ISO 639-2 not supported
    });
  });

  describe('Regional Variant Priority', () => {
    it('should prefer exact match over base language', () => {
      // pt-BR is exact match
      expect(normalizeLanguage('pt-BR')).toBe('pt-BR');
      
      // pt falls back to pt-BR via mapping
      expect(normalizeLanguage('pt')).toBe('pt-BR');
    });

    it('should map European Portuguese to Brazilian Portuguese', () => {
      expect(normalizeLanguage('pt-PT')).toBe('pt-BR');
    });

    it('should map all Spanish variants to base Spanish', () => {
      const spanishVariants = ['es-ES', 'es-MX', 'es-AR', 'es-CO', 'es-CL'];
      
      for (const variant of spanishVariants) {
        expect(normalizeLanguage(variant)).toBe('es');
      }
    });

    it('should map all English variants to base English', () => {
      const englishVariants = ['en-US', 'en-GB', 'en-CA', 'en-AU', 'en-NZ'];
      
      for (const variant of englishVariants) {
        expect(normalizeLanguage(variant)).toBe('en');
      }
    });
  });

  describe('Consistency Checks', () => {
    it('should normalize all supported languages to themselves', () => {
      for (const lang of SUPPORTED_LANGUAGES) {
        const normalized = normalizeLanguage(lang);
        expect(normalized).toBe(lang);
      }
    });

    it('should handle multiple normalizations consistently', () => {
      const testCases = [
        'en-US',
        'es-MX',
        'pt-BR',
        'fr-CA',
        'de-AT',
      ];
      
      for (const testCase of testCases) {
        const first = normalizeLanguage(testCase);
        const second = normalizeLanguage(testCase);
        expect(first).toBe(second);
      }
    });
  });
});
