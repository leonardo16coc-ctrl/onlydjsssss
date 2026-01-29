import { describe, it, expect } from 'vitest';
import enCommon from '../client/src/i18n/locales/en/common.json';
import esCommon from '../client/src/i18n/locales/es/common.json';
import ptBRCommon from '../client/src/i18n/locales/pt-BR/common.json';
import frCommon from '../client/src/i18n/locales/fr/common.json';
import deCommon from '../client/src/i18n/locales/de/common.json';

describe('i18n Translation System', () => {
  describe('Translation Files Exist', () => {
    it('should have English translations', () => {
      expect(enCommon).toBeDefined();
      expect(enCommon.nav).toBeDefined();
      expect(enCommon.home).toBeDefined();
    });

    it('should have Spanish translations', () => {
      expect(esCommon).toBeDefined();
      expect(esCommon.nav).toBeDefined();
      expect(esCommon.home).toBeDefined();
    });

    it('should have Portuguese translations', () => {
      expect(ptBRCommon).toBeDefined();
      expect(ptBRCommon.nav).toBeDefined();
      expect(ptBRCommon.home).toBeDefined();
    });

    it('should have French translations', () => {
      expect(frCommon).toBeDefined();
      expect(frCommon.nav).toBeDefined();
      expect(frCommon.home).toBeDefined();
    });

    it('should have German translations', () => {
      expect(deCommon).toBeDefined();
      expect(deCommon.nav).toBeDefined();
      expect(deCommon.home).toBeDefined();
    });
  });

  describe('Navigation Keys', () => {
    it('should have all navigation keys in English', () => {
      expect(enCommon.nav.explore).toBe('Explore');
      expect(enCommon.nav.djMode).toBe('DJ MODE');
      expect(enCommon.nav.mainstage).toBe('MAINSTAGE');
      expect(enCommon.nav.rankings).toBe('Rankings');
      expect(enCommon.nav.dashboard).toBe('Dashboard');
      expect(enCommon.nav.upload).toBe('Upload');
      expect(enCommon.nav.membership).toBe('Subscribe');
      expect(enCommon.nav.login).toBe('Log In');
      expect(enCommon.nav.logout).toBe('Log Out');
    });

    it('should have all navigation keys in Spanish', () => {
      expect(esCommon.nav.explore).toBe('Explorar');
      expect(esCommon.nav.djMode).toBe('MODO DJ');
      expect(esCommon.nav.mainstage).toBe('MAINSTAGE');
      expect(esCommon.nav.rankings).toBe('Rankings');
      expect(esCommon.nav.dashboard).toBe('Panel');
      expect(esCommon.nav.upload).toBe('Subir');
      expect(esCommon.nav.membership).toBe('Suscribirse');
      expect(esCommon.nav.login).toBe('Iniciar Sesión');
      expect(esCommon.nav.logout).toBe('Cerrar Sesión');
    });
  });

  describe('Home Page Keys', () => {
    it('should have home hero keys in English', () => {
      expect(enCommon.home.hero.title).toBe('The #1 Platform for DJs');
      expect(enCommon.home.hero.subtitle).toContain('Download, upload and monetize');
      expect(enCommon.home.hero.aiTagline).toContain('AI + Music');
      expect(enCommon.home.hero.exploreMusic).toBe('Explore Music');
      expect(enCommon.home.hero.uploadFiles).toBe('Upload Your Files');
    });

    it('should have home hero keys in Spanish', () => {
      expect(esCommon.home.hero.title).toBe('La Plataforma #1 para DJs');
      expect(esCommon.home.hero.subtitle).toContain('Descarga, sube y monetiza');
      expect(esCommon.home.hero.aiTagline).toContain('IA + Música');
      expect(esCommon.home.hero.exploreMusic).toBe('Explorar Música');
      expect(esCommon.home.hero.uploadFiles).toContain('Subir');
    });

    it('should have whySection keys in all languages', () => {
      expect(enCommon.home.whySection.title).toBe('Why ONLYDJS?');
      expect(esCommon.home.whySection.title).toBe('¿Por qué ONLYDJS?');
      expect(ptBRCommon.home.whySection.title).toBe('Por que ONLYDJS?');
      expect(frCommon.home.whySection.title).toBe('Pourquoi ONLYDJS?');
      expect(deCommon.home.whySection.title).toBe('Warum ONLYDJS?');
    });
  });

  describe('Translation Completeness', () => {
    it('should have same structure across all languages', () => {
      const enKeys = Object.keys(enCommon);
      const esKeys = Object.keys(esCommon);
      const ptKeys = Object.keys(ptBRCommon);
      const frKeys = Object.keys(frCommon);
      const deKeys = Object.keys(deCommon);

      expect(esKeys).toEqual(enKeys);
      expect(ptKeys).toEqual(enKeys);
      expect(frKeys).toEqual(enKeys);
      expect(deKeys).toEqual(enKeys);
    });

    it('should have whySection with 6 features in all languages', () => {
      const languages = [enCommon, esCommon, ptBRCommon, frCommon, deCommon];
      
      languages.forEach((lang) => {
        expect(lang.home.whySection.professionalMusic).toBeDefined();
        expect(lang.home.whySection.mainstageEdits).toBeDefined();
        expect(lang.home.whySection.monetization).toBeDefined();
        expect(lang.home.whySection.rankings).toBeDefined();
        expect(lang.home.whySection.aiMusic).toBeDefined();
        expect(lang.home.whySection.protection).toBeDefined();
      });
    });
  });

  describe('Footer Keys', () => {
    it('should have footer copyright in all languages', () => {
      expect(enCommon.home.footer.copyright).toContain('2026 ONLYDJS');
      expect(esCommon.home.footer.copyright).toContain('2026 ONLYDJS');
      expect(ptBRCommon.home.footer.copyright).toContain('2026 ONLYDJS');
      expect(frCommon.home.footer.copyright).toContain('2026 ONLYDJS');
      expect(deCommon.home.footer.copyright).toContain('2026 ONLYDJS');
    });
  });
});
