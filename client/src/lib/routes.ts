/**
 * Localized Routes System
 * Provides translated URLs for better SEO and UX
 */

export type Language = "en" | "es" | "pt-BR" | "fr" | "de";

export const SUPPORTED_LANGUAGES: Language[] = ["en", "es", "pt-BR", "fr", "de"];

export const DEFAULT_LANGUAGE: Language = "en";

/**
 * Route translations for each language
 */
export const ROUTE_TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    home: "",
    explore: "explore",
    upload: "upload",
    membership: "membership",
    "dj-mode": "dj-mode",
    mainstage: "mainstage",
    dashboard: "dashboard",
    profile: "profile",
    "profile-edit": "profile/edit",
  },
  es: {
    home: "",
    explore: "explorar",
    upload: "subir",
    membership: "suscripcion",
    "dj-mode": "modo-dj",
    mainstage: "escenario-principal",
    dashboard: "panel",
    profile: "perfil",
    "profile-edit": "perfil/editar",
  },
  "pt-BR": {
    home: "",
    explore: "explorar",
    upload: "enviar",
    membership: "assinatura",
    "dj-mode": "modo-dj",
    mainstage: "palco-principal",
    dashboard: "painel",
    profile: "perfil",
    "profile-edit": "perfil/editar",
  },
  fr: {
    home: "",
    explore: "explorer",
    upload: "telecharger",
    membership: "abonnement",
    "dj-mode": "mode-dj",
    mainstage: "scene-principale",
    dashboard: "tableau-de-bord",
    profile: "profil",
    "profile-edit": "profil/modifier",
  },
  de: {
    home: "",
    explore: "erkunden",
    upload: "hochladen",
    membership: "mitgliedschaft",
    "dj-mode": "dj-modus",
    mainstage: "hauptbuehne",
    dashboard: "dashboard",
    profile: "profil",
    "profile-edit": "profil/bearbeiten",
  },
};

/**
 * Reverse mapping: translated route → route key
 */
export const ROUTE_KEYS: Record<Language, Record<string, string>> = Object.entries(
  ROUTE_TRANSLATIONS
).reduce((acc, [lang, routes]) => {
  acc[lang as Language] = Object.entries(routes).reduce((routeAcc, [key, value]) => {
    routeAcc[value || "/"] = key;
    return routeAcc;
  }, {} as Record<string, string>);
  return acc;
}, {} as Record<Language, Record<string, string>>);

/**
 * Extract language from URL path
 * @param pathname - Current URL pathname
 * @returns Language code or default language
 */
export function getLanguageFromPath(pathname: string): Language {
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  
  if (SUPPORTED_LANGUAGES.includes(firstSegment as Language)) {
    return firstSegment as Language;
  }
  
  return DEFAULT_LANGUAGE;
}

/**
 * Get route key from translated path
 * @param pathname - Current URL pathname
 * @param lang - Current language
 * @returns Route key (e.g., "explore", "upload")
 */
export function getRouteKeyFromPath(pathname: string, lang: Language): string {
  const segments = pathname.split("/").filter(Boolean);
  
  // Remove language prefix if present
  if (SUPPORTED_LANGUAGES.includes(segments[0] as Language)) {
    segments.shift();
  }
  
  const translatedRoute = segments.join("/") || "/";
  return ROUTE_KEYS[lang][translatedRoute] || "home";
}

/**
 * Generate localized URL
 * @param routeKey - Route key (e.g., "explore", "upload")
 * @param lang - Target language
 * @returns Localized URL path
 */
export function getLocalizedPath(routeKey: string, lang: Language): string {
  const translatedRoute = ROUTE_TRANSLATIONS[lang][routeKey];
  
  if (translatedRoute === undefined) {
    console.warn(`Route key "${routeKey}" not found for language "${lang}"`);
    return `/${lang}`;
  }
  
  return `/${lang}${translatedRoute ? `/${translatedRoute}` : ""}`;
}

/**
 * Change language while preserving current route
 * @param currentPath - Current URL pathname
 * @param newLang - Target language
 * @returns New localized URL path
 */
export function changeLanguage(currentPath: string, newLang: Language): string {
  const currentLang = getLanguageFromPath(currentPath);
  const routeKey = getRouteKeyFromPath(currentPath, currentLang);
  return getLocalizedPath(routeKey, newLang);
}

/**
 * Remove language prefix from path
 * @param pathname - Current URL pathname
 * @returns Path without language prefix
 */
export function removeLanguagePrefix(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  
  if (SUPPORTED_LANGUAGES.includes(segments[0] as Language)) {
    segments.shift();
  }
  
  return `/${segments.join("/")}`;
}
