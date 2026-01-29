/**
 * Custom Language Detector for i18next
 * Provides intelligent language detection with regional variant mapping
 */

import type { CustomDetector } from 'i18next-browser-languagedetector';

/**
 * Supported languages in the application
 */
export const SUPPORTED_LANGUAGES = ['en', 'es', 'pt-BR', 'fr', 'de'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

/**
 * Default fallback language
 */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

/**
 * Mapping of regional variants to supported languages
 * This allows us to handle language codes like es-MX, pt-PT, en-GB, etc.
 */
const LANGUAGE_VARIANT_MAP: Record<string, SupportedLanguage> = {
  // English variants
  'en': 'en',
  'en-US': 'en',
  'en-GB': 'en',
  'en-CA': 'en',
  'en-AU': 'en',
  'en-NZ': 'en',
  
  // Spanish variants
  'es': 'es',
  'es-ES': 'es',
  'es-MX': 'es',
  'es-AR': 'es',
  'es-CO': 'es',
  'es-CL': 'es',
  'es-PE': 'es',
  'es-VE': 'es',
  'es-UY': 'es',
  
  // Portuguese variants (map to Brazilian Portuguese)
  'pt': 'pt-BR',
  'pt-BR': 'pt-BR',
  'pt-PT': 'pt-BR', // Map European Portuguese to Brazilian
  
  // French variants
  'fr': 'fr',
  'fr-FR': 'fr',
  'fr-CA': 'fr',
  'fr-BE': 'fr',
  'fr-CH': 'fr',
  
  // German variants
  'de': 'de',
  'de-DE': 'de',
  'de-AT': 'de',
  'de-CH': 'de',
};

/**
 * Normalize language code to supported language
 * @param langCode - Language code from browser or other source
 * @returns Normalized supported language or null if not supported
 */
export function normalizeLanguage(langCode: string): SupportedLanguage | null {
  if (!langCode) return null;
  
  // Try exact match first
  const exactMatch = LANGUAGE_VARIANT_MAP[langCode];
  if (exactMatch) return exactMatch;
  
  // Try base language (e.g., "es" from "es-419")
  const baseLanguage = langCode.split('-')[0];
  const baseMatch = LANGUAGE_VARIANT_MAP[baseLanguage];
  if (baseMatch) return baseMatch;
  
  return null;
}

/**
 * Get browser languages in order of preference
 * @returns Array of language codes from navigator
 */
function getBrowserLanguages(): string[] {
  const languages: string[] = [];
  
  // Modern browsers support navigator.languages (array of preferred languages)
  if (navigator.languages && navigator.languages.length > 0) {
    languages.push(...navigator.languages);
  }
  
  // Fallback to single language
  if (navigator.language) {
    languages.push(navigator.language);
  }
  
  // Legacy fallback
  const userLanguage = (navigator as any).userLanguage;
  if (userLanguage) {
    languages.push(userLanguage);
  }
  
  return languages;
}

/**
 * Detect language from browser with intelligent fallback
 * @returns Detected supported language or default language
 */
export function detectBrowserLanguage(): SupportedLanguage {
  const browserLanguages = getBrowserLanguages();
  
  // Try each browser language in order of preference
  for (const langCode of browserLanguages) {
    const normalized = normalizeLanguage(langCode);
    if (normalized) {
      console.log(`[i18n] Detected browser language: ${langCode} → ${normalized}`);
      return normalized;
    }
  }
  
  console.log(`[i18n] No supported language found, using default: ${DEFAULT_LANGUAGE}`);
  return DEFAULT_LANGUAGE;
}

/**
 * Custom detector for i18next-browser-languagedetector
 */
export const customLanguageDetector: CustomDetector = {
  name: 'customBrowserDetector',
  
  lookup(): string | undefined {
    // Check if user has manually selected a language (stored in localStorage)
    const storedLanguage = localStorage.getItem('i18nextLng');
    if (storedLanguage && SUPPORTED_LANGUAGES.includes(storedLanguage as any)) {
      console.log(`[i18n] Using stored language: ${storedLanguage}`);
      return storedLanguage;
    }
    
    // Detect from browser
    const detected = detectBrowserLanguage();
    console.log(`[i18n] Auto-detected language: ${detected}`);
    
    // Store the detected language for future visits (only if no manual selection exists)
    if (!storedLanguage) {
      localStorage.setItem('i18nextLng', detected);
    }
    
    return detected;
  },
  
  cacheUserLanguage(lng: string): void {
    // Cache the user's language selection
    if (lng && SUPPORTED_LANGUAGES.includes(lng as any)) {
      console.log(`[i18n] Caching user language: ${lng}`);
      localStorage.setItem('i18nextLng', lng);
    }
  },
};
