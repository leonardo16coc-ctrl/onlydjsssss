import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";
import { isStatisticallySignificant } from "../ab-testing/variant-assigner";

export const abTestingRouter = router({
  /**
   * Crear nuevo A/B test con múltiples variantes
   */
  createTest: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        variants: z.array(
          z.object({
            variant_name: z.string().min(1).max(50),
            subject_line: z.string().min(1),
          })
        ).min(2).max(5), // Mínimo 2 variantes (A/B), máximo 5 (A/B/C/D/E)
      })
    )
    .mutation(async ({ input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Crear el A/B test
        const result = await db.execute(sql`
          INSERT INTO ab_tests (name, description, status)
          VALUES (${input.name}, ${input.description || ""}, 'active')
        `);

        const testId = (result as any).insertId;

        // Crear las variantes
        for (const variant of input.variants) {
          await db.execute(sql`
            INSERT INTO ab_test_variants (ab_test_id, variant_name, subject_line)
            VALUES (${testId}, ${variant.variant_name}, ${variant.subject_line})
          `);
        }

        console.log(`[AB Testing] Created test "${input.name}" with ${input.variants.length} variants`);

        return {
          success: true,
          testId,
          message: `A/B test "${input.name}" created with ${input.variants.length} variants`,
        };
      } catch (error) {
        console.error("[AB Testing] Error creating test:", error);
        throw new Error("Failed to create A/B test");
      }
    }),

  /**
   * Obtener todos los A/B tests con sus variantes
   */
  getTests: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      const tests = await db.execute(sql`
        SELECT 
          t.id,
          t.name,
          t.description,
          t.status,
          t.winner_variant_id,
          t.created_at,
          t.completed_at,
          COUNT(v.id) as variant_count,
          SUM(v.emails_sent) as total_emails_sent,
          SUM(v.emails_opened) as total_emails_opened
        FROM ab_tests t
        LEFT JOIN ab_test_variants v ON t.id = v.ab_test_id
        GROUP BY t.id, t.name, t.description, t.status, t.winner_variant_id, t.created_at, t.completed_at
        ORDER BY t.created_at DESC
      `);

      return tests as any[];
    } catch (error) {
      console.error("[AB Testing] Error getting tests:", error);
      throw new Error("Failed to get A/B tests");
    }
  }),

  /**
   * Obtener resultados detallados de un A/B test específico
   */
  getTestResults: protectedProcedure
    .input(z.object({ testId: z.number() }))
    .query(async ({ input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Obtener información del test
        const testInfo = await db.execute(sql`
          SELECT 
            id,
            name,
            description,
            status,
            winner_variant_id,
            created_at,
            completed_at
          FROM ab_tests
          WHERE id = ${input.testId}
        `);

        if (!testInfo || (testInfo as any[]).length === 0) {
          throw new Error("Test not found");
        }

        // Obtener variantes con métricas
        const variants = await db.execute(sql`
          SELECT 
            id,
            ab_test_id,
            variant_name,
            subject_line,
            emails_sent,
            emails_opened,
            open_rate,
            created_at
          FROM ab_test_variants
          WHERE ab_test_id = ${input.testId}
          ORDER BY open_rate DESC
        `);

        // Calcular significancia estadística entre la mejor y segunda mejor
        const variantsArray = variants as any[];
        let isSignificant = false;
        
        if (variantsArray.length >= 2) {
          const best = variantsArray[0];
          const second = variantsArray[1];
          isSignificant = isStatisticallySignificant(
            { emails_sent: best.emails_sent, emails_opened: best.emails_opened },
            { emails_sent: second.emails_sent, emails_opened: second.emails_opened }
          );
        }

        return {
          test: (testInfo as any[])[0],
          variants: variantsArray,
          isSignificant,
          recommendation: isSignificant 
            ? `La variante "${variantsArray[0].variant_name}" es estadísticamente superior (p < 0.05)`
            : "Se necesitan más datos para determinar un ganador con confianza estadística (mínimo 30 emails por variante)",
        };
      } catch (error) {
        console.error("[AB Testing] Error getting test results:", error);
        throw new Error("Failed to get test results");
      }
    }),

  /**
   * Declarar una variante como ganadora y completar el test
   */
  declareWinner: protectedProcedure
    .input(
      z.object({
        testId: z.number(),
        variantId: z.number(),
      })
    )
    .mutation(async ({ input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Actualizar el test con el ganador y marcarlo como completado
        await db.execute(sql`
          UPDATE ab_tests
          SET 
            winner_variant_id = ${input.variantId},
            status = 'completed',
            completed_at = NOW()
          WHERE id = ${input.testId}
        `);

        // Obtener información de la variante ganadora
        const winner = await db.execute(sql`
          SELECT variant_name, subject_line, open_rate
          FROM ab_test_variants
          WHERE id = ${input.variantId}
        `);

        const winnerInfo = (winner as any[])[0];

        console.log(`[AB Testing] Test ${input.testId} completed. Winner: ${winnerInfo.variant_name} (${winnerInfo.open_rate}% open rate)`);

        return {
          success: true,
          message: `Variante "${winnerInfo.variant_name}" declarada ganadora con ${winnerInfo.open_rate}% open rate`,
          winner: winnerInfo,
        };
      } catch (error) {
        console.error("[AB Testing] Error declaring winner:", error);
        throw new Error("Failed to declare winner");
      }
    }),

  /**
   * Pausar o reactivar un A/B test
   */
  updateTestStatus: protectedProcedure
    .input(
      z.object({
        testId: z.number(),
        status: z.enum(["active", "paused", "completed"]),
      })
    )
    .mutation(async ({ input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await db.execute(sql`
          UPDATE ab_tests
          SET status = ${input.status}
          WHERE id = ${input.testId}
        `);

        return {
          success: true,
          message: `Test status updated to ${input.status}`,
        };
      } catch (error) {
        console.error("[AB Testing] Error updating test status:", error);
        throw new Error("Failed to update test status");
      }
    }),

  /**
   * Obtener estadísticas agregadas de todos los A/B tests
   */
  getOverallStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      const stats = await db.execute(sql`
        SELECT 
          COUNT(DISTINCT t.id) as total_tests,
          COUNT(DISTINCT CASE WHEN t.status = 'active' THEN t.id END) as active_tests,
          COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tests,
          SUM(v.emails_sent) as total_emails_sent,
          SUM(v.emails_opened) as total_emails_opened,
          ROUND(
            (SUM(v.emails_opened) * 100.0) / NULLIF(SUM(v.emails_sent), 0),
            2
          ) as overall_open_rate
        FROM ab_tests t
        LEFT JOIN ab_test_variants v ON t.id = v.ab_test_id
      `);

      return (stats as any[])[0] || {
        total_tests: 0,
        active_tests: 0,
        completed_tests: 0,
        total_emails_sent: 0,
        total_emails_opened: 0,
        overall_open_rate: 0,
      };
    } catch (error) {
      console.error("[AB Testing] Error getting overall stats:", error);
      throw new Error("Failed to get overall stats");
    }
  }),
});
