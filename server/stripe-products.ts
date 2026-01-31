/**
 * Stripe Products Configuration
 * 
 * ONLYDJS PRO - $4.99 USD / mes
 * 
 * Beneficios:
 * - Streaming ilimitado
 * - 20 descargas diarias
 * - Acceso total al catálogo
 * - Acceso completo a DJ Mode, Mainstage y Rankings
 */

export const STRIPE_PRODUCTS = {
  PRO: {
    name: "ONLYDJS PRO",
    description: "Acceso completo a la plataforma con 20 descargas diarias",
    price: 4.99,
    currency: "usd",
    interval: "month" as const,
    features: [
      "Streaming ilimitado",
      "20 descargas diarias",
      "Acceso total al catálogo",
      "DJ Mode completo",
      "Mainstage Mode",
      "Rankings completos",
      "Sin anuncios",
      "Soporte prioritario"
    ],
    // These IDs will be set after creating products in Stripe
    // For now, use test mode IDs or create them via Stripe Dashboard
    priceId: process.env.STRIPE_PRO_PRICE_ID || "", // Set in env after creating
    productId: process.env.STRIPE_PRO_PRODUCT_ID || "", // Set in env after creating
  }
} as const;

// Membership status mapping
export const MEMBERSHIP_STATUS = {
  FREE: "free",
  PRO: "member", // Maps to membershipStatus enum in DB
} as const;

// Download limits by membership
export const DOWNLOAD_LIMITS = {
  FREE: {
    DAILY: 0, // Free users can't download
    PER_TRACK_DAILY: 0,
  },
  PRO: {
    DAILY: 20,
    PER_TRACK_DAILY: 3,
  },
} as const;

// Helper to get download limits by membership status
export function getDownloadLimits(membershipStatus: string) {
  if (membershipStatus === "member" || membershipStatus === "verified") {
    return DOWNLOAD_LIMITS.PRO;
  }
  return DOWNLOAD_LIMITS.FREE;
}


/**
 * Revenue Model Configuration
 * 
 * REPARTO GLOBAL:
 * - 50% para DJs
 * - 50% para Plataforma
 * 
 * DISTRIBUCIÓN DJ (del 50% DJs):
 * - 30% por descargas
 * - 20% por DJ Score (impacto)
 * 
 * FÓRMULA DJ SCORE:
 * - Descargas: 40%
 * - Streams: 30%
 * - Minutos escuchados: 20%
 * - Engagement (favoritos + playlists): 10%
 */

export const REVENUE_MODEL = {
  // Split global
  PLATFORM_SHARE: 0.50, // 50% plataforma
  DJ_SHARE: 0.50,       // 50% DJs
  
  // Distribución del pool de DJs
  DOWNLOADS_POOL: 0.30,  // 30% por descargas
  SCORE_POOL: 0.20,      // 20% por DJ Score
  
  // Pesos del DJ Score
  SCORE_WEIGHTS: {
    DOWNLOADS: 0.40,    // 40%
    STREAMS: 0.30,      // 30%
    MINUTES: 0.20,      // 20%
    ENGAGEMENT: 0.10,   // 10%
  },
  
  // Normalización de métricas para DJ Score
  // Estos valores se ajustan según el crecimiento de la plataforma
  NORMALIZATION: {
    DOWNLOADS_MAX: 1000,  // Máximo esperado de descargas mensuales por DJ
    STREAMS_MAX: 10000,   // Máximo esperado de streams mensuales
    MINUTES_MAX: 100000,  // Máximo esperado de minutos escuchados
    ENGAGEMENT_MAX: 500,  // Máximo esperado de favoritos + playlists
  }
} as const;

/**
 * Calculate DJ Score based on monthly metrics
 * 
 * @param downloads - Total downloads this month
 * @param streams - Total streams this month
 * @param minutes - Total minutes listened this month
 * @param engagement - Total favorites + playlist adds this month
 * @returns DJ Score (0-100)
 */
export function calculateDJScore(
  downloads: number,
  streams: number,
  minutes: number,
  engagement: number
): number {
  const norm = REVENUE_MODEL.NORMALIZATION;
  const weights = REVENUE_MODEL.SCORE_WEIGHTS;
  
  // Normalize each metric to 0-1 range
  const normalizedDownloads = Math.min(downloads / norm.DOWNLOADS_MAX, 1);
  const normalizedStreams = Math.min(streams / norm.STREAMS_MAX, 1);
  const normalizedMinutes = Math.min(minutes / norm.MINUTES_MAX, 1);
  const normalizedEngagement = Math.min(engagement / norm.ENGAGEMENT_MAX, 1);
  
  // Calculate weighted score (0-100)
  const score = (
    normalizedDownloads * weights.DOWNLOADS +
    normalizedStreams * weights.STREAMS +
    normalizedMinutes * weights.MINUTES +
    normalizedEngagement * weights.ENGAGEMENT
  ) * 100;
  
  return Math.round(score * 100) / 100; // Round to 2 decimals
}
