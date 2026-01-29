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

  describe('Explore Page Keys', () => {
    it('should have explore page keys in English', () => {
      expect(enCommon.explore.title).toBe('Explore Music');
      expect(enCommon.explore.subtitle).toBeDefined();
      expect(enCommon.explore.searchingTracks).toBe('Searching tracks...');
      expect(enCommon.explore.tracksFound).toBe('tracks found');
      expect(enCommon.explore.noTracksFound).toBe('No tracks found');
      expect(enCommon.explore.loadMore).toBe('Load More');
    });

    it('should have explore page keys in Spanish', () => {
      expect(esCommon.explore.title).toBe('Explorar Música');
      expect(esCommon.explore.subtitle).toBeDefined();
      expect(esCommon.explore.searchingTracks).toBe('Buscando tracks...');
      expect(esCommon.explore.tracksFound).toBe('tracks encontrados');
      expect(esCommon.explore.noTracksFound).toBe('No se encontraron tracks');
      expect(esCommon.explore.loadMore).toBe('Cargar más');
    });
  });

  describe('Upload Page Keys', () => {
    it('should have upload page keys in English', () => {
      expect(enCommon.upload.title).toBe('Upload Track');
      expect(enCommon.upload.subtitle).toBeDefined();
      expect(enCommon.upload.audioFile).toBe('Audio File');
      expect(enCommon.upload.coverImage).toBe('Cover Image');
      expect(enCommon.upload.trackInfo).toBe('Track Information');
      expect(enCommon.upload.analyzeWithAI).toBe('Analyze with AI');
      expect(enCommon.upload.publish).toBe('Publish Track');
    });

    it('should have upload page keys in Spanish', () => {
      expect(esCommon.upload.title).toBe('Subir Track');
      expect(esCommon.upload.subtitle).toBeDefined();
      expect(esCommon.upload.audioFile).toBe('Archivo de Audio');
      expect(esCommon.upload.coverImage).toBe('Imagen de Portada');
      expect(esCommon.upload.trackInfo).toBe('Información del Track');
      expect(esCommon.upload.analyzeWithAI).toBe('Analizar con IA');
      expect(esCommon.upload.publish).toBe('Publicar Track');
    });
  });

  describe('Membership Page Keys', () => {
    it('should have membership page keys in English', () => {
      expect(enCommon.membership.title).toBe('Choose Your Plan');
      expect(enCommon.membership.subtitle).toBeDefined();
      expect(enCommon.membership.free).toBe('FREE');
      expect(enCommon.membership.pro).toBe('PRO');
      expect(enCommon.membership.popular).toBe('POPULAR');
      expect(enCommon.membership.currentPlan).toBe('Current Plan');
      expect(enCommon.membership.upgradeToPro).toBe('Upgrade to PRO');
    });

    it('should have membership page keys in Spanish', () => {
      expect(esCommon.membership.title).toBe('Elige Tu Plan');
      expect(esCommon.membership.subtitle).toBeDefined();
      expect(esCommon.membership.free).toBe('GRATIS');
      expect(esCommon.membership.pro).toBe('PRO');
      expect(esCommon.membership.popular).toBe('POPULAR');
      expect(esCommon.membership.currentPlan).toBe('Plan Actual');
      expect(esCommon.membership.upgradeToPro).toBe('Actualizar a PRO');
    });
  });

  describe('AudioPlayer Component Keys', () => {
    it('should have player keys in English', () => {
      expect(enCommon.player.preview).toBe('Preview');
      expect(enCommon.player.previewEnded).toBeDefined();
      expect(enCommon.player.subscribe).toBe('Subscribe');
      expect(enCommon.player.subscribeToListen).toBeDefined();
      expect(enCommon.player.previewOneMin).toBe('Preview 1 min');
    });

    it('should have player keys in Spanish', () => {
      expect(esCommon.player.preview).toBe('Preview');
      expect(esCommon.player.previewEnded).toBeDefined();
      expect(esCommon.player.subscribe).toBe('Suscribirse');
      expect(esCommon.player.subscribeToListen).toBeDefined();
      expect(esCommon.player.previewOneMin).toBe('Preview 1 min');
    });

    it('should have player keys in all languages', () => {
      expect(enCommon.player.preview).toBeDefined();
      expect(esCommon.player.preview).toBeDefined();
      expect(ptBRCommon.player.preview).toBeDefined();
      expect(frCommon.player.preview).toBeDefined();
      expect(deCommon.player.preview).toBeDefined();
    });
  });

  describe('DownloadButton Component Keys', () => {
    it('should have download keys in English', () => {
      expect(enCommon.download.downloading).toBe('Downloading...');
      expect(enCommon.download.download).toBe('Download');
      expect(enCommon.download.downloadRequired).toBeDefined();
      expect(enCommon.download.downloadMp3).toBe('Download MP3 320kbps');
      expect(enCommon.download.downloadWav).toBe('Download WAV');
      expect(enCommon.download.loginToDownload).toBeDefined();
      expect(enCommon.download.membershipRequired).toBeDefined();
    });

    it('should have download keys in Spanish', () => {
      expect(esCommon.download.downloading).toBe('Descargando...');
      expect(esCommon.download.download).toBe('Descargar');
      expect(esCommon.download.downloadRequired).toBeDefined();
      expect(esCommon.download.downloadMp3).toBe('Descargar MP3 320kbps');
      expect(esCommon.download.downloadWav).toBe('Descargar WAV');
      expect(esCommon.download.loginToDownload).toBeDefined();
      expect(esCommon.download.membershipRequired).toBeDefined();
    });

    it('should have download keys in all languages', () => {
      expect(enCommon.download.download).toBeDefined();
      expect(esCommon.download.download).toBeDefined();
      expect(ptBRCommon.download.download).toBeDefined();
      expect(frCommon.download.download).toBeDefined();
      expect(deCommon.download.download).toBeDefined();
    });
  });

  describe('Footer Component Keys', () => {
    it('should have footer keys in English', () => {
      expect(enCommon.footer.tagline).toBeDefined();
      expect(enCommon.footer.product).toBe('Product');
      expect(enCommon.footer.company).toBe('Company');
      expect(enCommon.footer.legal).toBe('Legal');
      expect(enCommon.footer.support).toBe('Support');
      expect(enCommon.footer.about).toBe('About');
      expect(enCommon.footer.privacy).toBe('Privacy Policy');
      expect(enCommon.footer.terms).toBe('Terms of Service');
      expect(enCommon.footer.rights).toBe('All rights reserved.');
      expect(enCommon.footer.madeWith).toBe('Made with');
      expect(enCommon.footer.forDJs).toBe('for DJs worldwide');
    });

    it('should have footer keys in Spanish', () => {
      expect(esCommon.footer.tagline).toBeDefined();
      expect(esCommon.footer.product).toBe('Producto');
      expect(esCommon.footer.company).toBe('Empresa');
      expect(esCommon.footer.legal).toBe('Legal');
      expect(esCommon.footer.support).toBe('Soporte');
      expect(esCommon.footer.about).toBe('Acerca de');
      expect(esCommon.footer.privacy).toBe('Política de Privacidad');
      expect(esCommon.footer.terms).toBe('Términos de Servicio');
      expect(esCommon.footer.rights).toBe('Todos los derechos reservados.');
      expect(esCommon.footer.madeWith).toBe('Hecho con');
      expect(esCommon.footer.forDJs).toBe('para DJs de todo el mundo');
    });

    it('should have footer keys in all languages', () => {
      expect(enCommon.footer.product).toBeDefined();
      expect(esCommon.footer.product).toBeDefined();
      expect(ptBRCommon.footer.product).toBeDefined();
      expect(frCommon.footer.product).toBeDefined();
      expect(deCommon.footer.product).toBeDefined();
      
      expect(enCommon.footer.tagline).toBeDefined();
      expect(esCommon.footer.tagline).toBeDefined();
      expect(ptBRCommon.footer.tagline).toBeDefined();
      expect(frCommon.footer.tagline).toBeDefined();
      expect(deCommon.footer.tagline).toBeDefined();
    });
  });

  describe('Premium Pages Keys', () => {
    describe('DJMode Keys', () => {
      it('should have djMode keys in English', () => {
        expect(enCommon.djMode.loading).toBe('Loading DJ MODE...');
        expect(enCommon.djMode.loginTitle).toBe('🎛 DJ MODE');
        expect(enCommon.djMode.tabProfile).toBe('DJ Profile');
        expect(enCommon.djMode.tabSuggestions).toBe('Smart Suggestions');
        expect(enCommon.djMode.tabSetBuilder).toBe('Auto Set Builder');
        expect(enCommon.djMode.tracksDownloaded).toBe('Tracks Downloaded');
        expect(enCommon.djMode.autoSetBuilder).toBe('🎛 Auto Set Builder Pro');
      });

      it('should have djMode keys in Spanish', () => {
        expect(esCommon.djMode.loading).toBe('Cargando DJ MODE...');
        expect(esCommon.djMode.loginTitle).toBe('🎛 DJ MODE');
        expect(esCommon.djMode.tracksDownloaded).toBe('Tracks Descargados');
        expect(esCommon.djMode.autoSetBuilder).toBe('🎛 Auto Set Builder Pro');
      });

      it('should have djMode keys in all languages', () => {
        expect(enCommon.djMode.loading).toBeDefined();
        expect(esCommon.djMode.loading).toBeDefined();
        expect(ptBRCommon.djMode.loading).toBeDefined();
        expect(frCommon.djMode.loading).toBeDefined();
        expect(deCommon.djMode.loading).toBeDefined();
      });
    });

    describe('MainstageMode Keys', () => {
      it('should have mainstage keys in English', () => {
        expect(enCommon.mainstage.loading).toBe('Loading MAINSTAGE MODE...');
        expect(enCommon.mainstage.title).toBe('MAINSTAGE MODE');
        expect(enCommon.mainstage.festivalWeapons).toBe('🔥 Festival Weapons');
        expect(enCommon.mainstage.peakTimeAnthems).toBe('🚀 Peak Time Anthems');
        expect(enCommon.mainstage.mainstageBombs).toBe('🎆 Mainstage Bombs');
      });

      it('should have mainstage keys in Spanish', () => {
        expect(esCommon.mainstage.loading).toBe('Cargando MAINSTAGE MODE...');
        expect(esCommon.mainstage.title).toBe('MAINSTAGE MODE');
        expect(esCommon.mainstage.festivalWeapons).toBe('🔥 Festival Weapons');
      });

      it('should have mainstage keys in all languages', () => {
        expect(enCommon.mainstage.title).toBeDefined();
        expect(esCommon.mainstage.title).toBeDefined();
        expect(ptBRCommon.mainstage.title).toBeDefined();
        expect(frCommon.mainstage.title).toBeDefined();
        expect(deCommon.mainstage.title).toBeDefined();
      });
    });

    describe('Dashboard Keys', () => {
      it('should have dashboard keys in English', () => {
        expect(enCommon.dashboard.title).toBe('Dashboard');
        expect(enCommon.dashboard.loading).toBe('Loading statistics...');
        expect(enCommon.dashboard.totalDownloads).toBe('Total Downloads');
        expect(enCommon.dashboard.wallet).toBe('Wallet');
        expect(enCommon.dashboard.availableBalance).toBe('Available Balance');
      });

      it('should have dashboard keys in Spanish', () => {
        expect(esCommon.dashboard.title).toBe('Dashboard');
        expect(esCommon.dashboard.loading).toBe('Cargando estadísticas...');
        expect(esCommon.dashboard.totalDownloads).toBe('Descargas Totales');
        expect(esCommon.dashboard.wallet).toBe('Wallet');
      });

      it('should have dashboard keys in all languages', () => {
        expect(enCommon.dashboard.title).toBeDefined();
        expect(esCommon.dashboard.title).toBeDefined();
        expect(ptBRCommon.dashboard.title).toBeDefined();
        expect(frCommon.dashboard.title).toBeDefined();
        expect(deCommon.dashboard.title).toBeDefined();
      });
    });
  });

  describe("Modals and Forms Translations", () => {
    const translations = { en: enCommon, es: esCommon, "pt-BR": ptBRCommon, fr: frCommon, de: deCommon };
    const languages = ["en", "es", "pt-BR", "fr", "de"];

    it("should have SetDetailsModal translations in all languages", () => {
      const keys = ["setType", "avgBpm", "compatibility", "energyCurve", "tracksList", "feedback", "rateSet", "mixingGuide", "mixingGuideDesc"];
      
      for (const lang of languages) {
        for (const key of keys) {
          expect(translations[lang].modal[key]).toBeDefined();
          expect(translations[lang].modal[key]).not.toBe("");
        }
      }
    });

    it("should have SetFeedbackForm translations in all languages", () => {
      const keys = ["overallRating", "excellent", "veryGood", "good", "fair", "needsImprovement", 
                    "commentOptional", "commentPlaceholder", "whatWorkedWell", "whatToImprove", 
                    "usedLive", "whereUsed", "sending", "updateFeedback", "sendFeedback", "selectRating",
                    "smoothTransitions", "energyCurve", "harmonicCompatibility", "overallFlow", "perfectTiming",
                    "bpmRange", "keyCompatibility", "trackOrder", "setDuration", "styleVariety",
                    "club", "festival", "bar", "radio", "stream", "other", "errorSending"];
      
      for (const lang of languages) {
        for (const key of keys) {
          expect(translations[lang].feedbackForm[key]).toBeDefined();
          expect(translations[lang].feedbackForm[key]).not.toBe("");
        }
      }
    });

    it("should have ProfileEdit validation translations in all languages", () => {
      const keys = ["invalidFormat", "imageTooLarge", "errorReadingImage", "profileImageUpdated", 
                    "errorUploadingImage", "profileUpdated", "errorUpdatingProfile"];
      
      for (const lang of languages) {
        for (const key of keys) {
          expect(translations[lang].profile[key]).toBeDefined();
          expect(translations[lang].profile[key]).not.toBe("");
        }
      }
    });
  });
});
