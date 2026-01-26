import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "../db";
import { setFeedback, autoSets } from "../../drizzle/schema";
import { protectedProcedure, router } from "../_core/trpc";

export const setFeedbackRouter = router({
  /**
   * Enviar feedback de un set generado
   */
  submitFeedback: protectedProcedure
    .input(
      z.object({
        setId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
        workedWell: z.array(z.string()).optional(),
        needsImprovement: z.array(z.string()).optional(),
        usedInLive: z.boolean().default(false),
        venueType: z.enum(["club", "festival", "bar", "radio", "stream", "other"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      // Verificar que el set existe y pertenece al usuario
      const set = await db
        .select()
        .from(autoSets)
        .where(and(
          eq(autoSets.id, input.setId),
          eq(autoSets.userId, ctx.user.id)
        ))
        .limit(1)
        .then(rows => rows[0]);

      if (!set) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Set no encontrado o no tienes permiso para calificarlo",
        });
      }

      // Verificar si ya existe feedback para este set
      const existingFeedback = await db
        .select()
        .from(setFeedback)
        .where(and(
          eq(setFeedback.setId, input.setId),
          eq(setFeedback.userId, ctx.user.id)
        ))
        .limit(1)
        .then(rows => rows[0]);

      if (existingFeedback) {
        // Actualizar feedback existente
        await db
          .update(setFeedback)
          .set({
            rating: input.rating,
            comment: input.comment,
            workedWell: input.workedWell,
            needsImprovement: input.needsImprovement,
            usedInLive: input.usedInLive,
            venueType: input.venueType,
            updatedAt: new Date(),
          })
          .where(eq(setFeedback.id, existingFeedback.id));

        return {
          success: true,
          message: "Feedback actualizado exitosamente",
          feedbackId: existingFeedback.id,
        };
      } else {
        // Crear nuevo feedback
        const [result] = await db.insert(setFeedback).values({
          setId: input.setId,
          userId: ctx.user.id,
          rating: input.rating,
          comment: input.comment,
          workedWell: input.workedWell,
          needsImprovement: input.needsImprovement,
          usedInLive: input.usedInLive,
          venueType: input.venueType,
        });

        return {
          success: true,
          message: "¡Gracias por tu feedback! Nos ayuda a mejorar.",
          feedbackId: result.insertId,
        };
      }
    }),

  /**
   * Obtener feedback de un set específico
   */
  getSetFeedback: protectedProcedure
    .input(z.object({ setId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      // Verificar que el set pertenece al usuario
      const set = await db
        .select()
        .from(autoSets)
        .where(and(
          eq(autoSets.id, input.setId),
          eq(autoSets.userId, ctx.user.id)
        ))
        .limit(1)
        .then(rows => rows[0]);

      if (!set) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Set no encontrado",
        });
      }

      // Obtener feedback del usuario para este set
      const feedback = await db
        .select()
        .from(setFeedback)
        .where(and(
          eq(setFeedback.setId, input.setId),
          eq(setFeedback.userId, ctx.user.id)
        ))
        .limit(1)
        .then(rows => rows[0]);

      return feedback || null;
    }),

  /**
   * Obtener historial de feedback del usuario
   */
  getMyFeedbackHistory: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const feedbacks = await db
      .select({
        id: setFeedback.id,
        setId: setFeedback.setId,
        setName: autoSets.name,
        rating: setFeedback.rating,
        comment: setFeedback.comment,
        workedWell: setFeedback.workedWell,
        needsImprovement: setFeedback.needsImprovement,
        usedInLive: setFeedback.usedInLive,
        venueType: setFeedback.venueType,
        createdAt: setFeedback.createdAt,
        updatedAt: setFeedback.updatedAt,
      })
      .from(setFeedback)
      .innerJoin(autoSets, eq(setFeedback.setId, autoSets.id))
      .where(eq(setFeedback.userId, ctx.user.id))
      .orderBy(desc(setFeedback.createdAt));

    return feedbacks;
  }),

  /**
   * Obtener estadísticas de feedback del usuario
   */
  getMyFeedbackStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const stats = await db
      .select({
        totalFeedbacks: sql<number>`COUNT(*)`,
        avgRating: sql<number>`AVG(${setFeedback.rating})`,
        totalUsedInLive: sql<number>`SUM(CASE WHEN ${setFeedback.usedInLive} = 1 THEN 1 ELSE 0 END)`,
      })
      .from(setFeedback)
      .where(eq(setFeedback.userId, ctx.user.id));

    return stats[0] || { totalFeedbacks: 0, avgRating: 0, totalUsedInLive: 0 };
  }),
});
