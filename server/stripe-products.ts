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
