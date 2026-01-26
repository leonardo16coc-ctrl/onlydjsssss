/**
 * Stripe Products and Prices Configuration
 * 
 * ONLYDJS Membership: $4.99 USD/month
 */

export const MEMBERSHIP_PRICE_ID = "price_dj_membership_monthly";

export const PRODUCTS = {
  DJ_MEMBERSHIP: {
    name: "ONLYDJS DJ Membership",
    description: "Acceso completo a subida, descarga y monetización de tracks",
    price: 4.99,
    currency: "usd",
    interval: "month" as const,
    priceId: MEMBERSHIP_PRICE_ID,
    features: [
      "Subir tracks ilimitados",
      "Descargar música sin límites",
      "Acceso a MAINSTAGE EDITS",
      "Análisis con IA",
      "Monetización automática",
      "Dashboard de estadísticas",
    ],
  },
} as const;

export const REVENUE_SPLIT = {
  DJ_PERCENTAGE: 0.60, // 60% para DJs
  PLATFORM_PERCENTAGE: 0.40, // 40% para plataforma
} as const;

export const MEMBERSHIP_CONFIG = {
  PRICE_USD: 4.99,
  PREVIEW_DURATION_SECONDS: 90,
  ALLOWED_FORMATS: ["mp3", "wav"] as const,
  MP3_MIN_BITRATE: 320,
} as const;
