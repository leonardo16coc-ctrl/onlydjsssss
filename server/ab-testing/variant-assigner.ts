import { getDb } from "../db";
import { sql } from "drizzle-orm";

/**
 * Sistema de asignación aleatoria de variantes A/B
 * Distribuye emails equitativamente entre todas las variantes activas
 */

export interface ABTestVariant {
  id: number;
  ab_test_id: number;
  variant_name: string;
  subject_line: string;
  emails_sent: number;
  emails_opened: number;
  open_rate: number;
}

export interface ABTest {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  winner_variant_id: number | null;
  created_at: Date;
  completed_at: Date | null;
}

/**
 * Obtiene una variante aleatoria de un A/B test activo
 * Usa distribución uniforme para asegurar que todas las variantes reciban emails similares
 */
export async function getRandomVariant(abTestId: number): Promise<ABTestVariant | null> {
  const db = await getDb();
  if (!db) {
    console.error("[AB Testing] Database not available");
    return null;
  }

  try {
    // Obtener todas las variantes del test
    const variants = await db.execute(sql`
      SELECT 
        v.id,
        v.ab_test_id,
        v.variant_name,
        v.subject_line,
        v.emails_sent,
        v.emails_opened,
        v.open_rate
      FROM ab_test_variants v
      INNER JOIN ab_tests t ON v.ab_test_id = t.id
      WHERE v.ab_test_id = ${abTestId}
        AND t.status = 'active'
      ORDER BY v.emails_sent ASC, RAND()
      LIMIT 1
    `);

    if (!variants || (variants as any[]).length === 0) {
      console.log(`[AB Testing] No active variants found for test ${abTestId}`);
      return null;
    }

    return variants[0] as any as ABTestVariant;
  } catch (error) {
    console.error("[AB Testing] Error getting random variant:", error);
    return null;
  }
}

/**
 * Obtiene el A/B test activo más reciente
 * Útil para aplicar automáticamente el test actual a nuevas campañas
 */
export async function getActiveABTest(): Promise<ABTest | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const tests = await db.execute(sql`
      SELECT 
        id,
        name,
        description,
        status,
        winner_variant_id,
        created_at,
        completed_at
      FROM ab_tests
      WHERE status = 'active'
      ORDER BY created_at DESC
      LIMIT 1
    `);

    if (!tests || (tests as any[]).length === 0) {
      return null;
    }

    return tests[0] as any as ABTest;
  } catch (error) {
    console.error("[AB Testing] Error getting active test:", error);
    return null;
  }
}

/**
 * Incrementa el contador de emails enviados para una variante
 */
export async function incrementVariantSent(variantId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.execute(sql`
      UPDATE ab_test_variants
      SET emails_sent = emails_sent + 1
      WHERE id = ${variantId}
    `);
  } catch (error) {
    console.error("[AB Testing] Error incrementing sent count:", error);
  }
}

/**
 * Actualiza las métricas de una variante cuando se abre un email
 */
export async function updateVariantOpened(variantId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.execute(sql`
      UPDATE ab_test_variants
      SET 
        emails_opened = emails_opened + 1,
        open_rate = ROUND((emails_opened + 1) * 100.0 / NULLIF(emails_sent, 0), 2)
      WHERE id = ${variantId}
    `);
  } catch (error) {
    console.error("[AB Testing] Error updating opened count:", error);
  }
}

/**
 * Calcula la significancia estadística entre dos variantes usando test Z
 * Retorna true si la diferencia es estadísticamente significativa (p < 0.05)
 */
export function isStatisticallySignificant(
  variant1: { emails_sent: number; emails_opened: number },
  variant2: { emails_sent: number; emails_opened: number }
): boolean {
  const n1 = variant1.emails_sent;
  const n2 = variant2.emails_sent;
  const p1 = n1 > 0 ? variant1.emails_opened / n1 : 0;
  const p2 = n2 > 0 ? variant2.emails_opened / n2 : 0;

  // Necesitamos al menos 30 muestras por variante para test Z
  if (n1 < 30 || n2 < 30) {
    return false;
  }

  // Pooled proportion
  const p = (variant1.emails_opened + variant2.emails_opened) / (n1 + n2);
  
  // Standard error
  const se = Math.sqrt(p * (1 - p) * (1/n1 + 1/n2));
  
  if (se === 0) return false;
  
  // Z-score
  const z = Math.abs(p1 - p2) / se;
  
  // Z-score > 1.96 significa p < 0.05 (95% confianza)
  return z > 1.96;
}
