import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { weeklyChallenges, djProfiles, autoSets, downloads, tracks } from "../../drizzle/schema";
import { eq, and, gte, sql } from "drizzle-orm";

/**
 * Weekly Challenges Router
 * Sistema de retos semanales gamificados
 */

export const weeklyChallengesRouter = router({
  /**
   * Obtener retos de la semana actual del usuario
   */
  getMyWeeklyChallenges: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Calcular inicio de semana (lunes)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Si es domingo, retroceder 6 días
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);

    // Buscar retos existentes de esta semana
    let challenges = await db
      .select()
      .from(weeklyChallenges)
      .where(
        and(
          eq(weeklyChallenges.userId, ctx.user.id),
          eq(weeklyChallenges.weekStart, weekStart)
        )
      );

    // Si no hay retos, generar 3 retos aleatorios
    if (challenges.length === 0) {
      challenges = await generateWeeklyChallenges(db, ctx.user.id, weekStart);
    }

    // Actualizar progreso de cada reto
    for (const challenge of challenges) {
      if (!challenge.completed) {
        const currentValue = await calculateChallengeProgress(db, ctx.user.id, challenge.challengeType, weekStart);
        
        // Actualizar si cambió
        if (currentValue !== challenge.currentValue) {
          await db
            .update(weeklyChallenges)
            .set({
              currentValue,
              completed: currentValue >= challenge.targetValue,
              completedAt: currentValue >= challenge.targetValue ? new Date() : null,
            })
            .where(eq(weeklyChallenges.id, challenge.id));

          challenge.currentValue = currentValue;
          challenge.completed = currentValue >= challenge.targetValue;
        }
      }
    }

    return challenges;
  }),
});

/**
 * Generar 3 retos aleatorios para la semana
 */
async function generateWeeklyChallenges(db: any, userId: number, weekStart: Date) {
  const challengeTemplates = [
    { type: "generate_sets", target: 2, badge: "weekly_set_master" },
    { type: "download_tracks", target: 10, badge: "weekly_collector" },
    { type: "play_tracks", target: 20, badge: "weekly_listener" },
    { type: "upload_tracks", target: 3, badge: "weekly_creator" },
    { type: "use_dj_mode", target: 3, badge: "weekly_dj_mode" },
    { type: "genre_specialist", target: 15, badge: "weekly_specialist" },
  ];

  // Seleccionar 3 retos aleatorios
  const shuffled = challengeTemplates.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);

  const challenges = [];
  for (const template of selected) {
    const [challenge] = await db
      .insert(weeklyChallenges)
      .values({
        userId,
        weekStart,
        challengeType: template.type,
        targetValue: template.target,
        currentValue: 0,
        completed: false,
        badgeAwarded: template.badge,
      })
      .$returningId();

    const fullChallenge = await db
      .select()
      .from(weeklyChallenges)
      .where(eq(weeklyChallenges.id, challenge.id))
      .limit(1)
      .then((rows: any[]) => rows[0]);

    challenges.push(fullChallenge);
  }

  return challenges;
}

/**
 * Calcular progreso actual de un reto
 */
async function calculateChallengeProgress(
  db: any,
  userId: number,
  challengeType: string,
  weekStart: Date
): Promise<number> {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  switch (challengeType) {
    case "generate_sets":
      return await db
        .select({ count: sql<number>`count(*)` })
        .from(autoSets)
        .where(
          and(
            eq(autoSets.userId, userId),
            gte(autoSets.createdAt, weekStart),
            sql`${autoSets.createdAt} < ${weekEnd}`
          )
        )
        .then((rows: any[]) => rows[0]?.count || 0);

    case "download_tracks":
      return await db
        .select({ count: sql<number>`count(*)` })
        .from(downloads)
        .where(
          and(
            eq(downloads.userId, userId),
            gte(downloads.downloadedAt, weekStart),
            sql`${downloads.downloadedAt} < ${weekEnd}`
          )
        )
        .then((rows: any[]) => rows[0]?.count || 0);

    case "upload_tracks":
      return await db
        .select({ count: sql<number>`count(*)` })
        .from(tracks)
        .where(
          and(
            eq(tracks.userId, userId),
            gte(tracks.createdAt, weekStart),
            sql`${tracks.createdAt} < ${weekEnd}`
          )
        )
        .then((rows: any[]) => rows[0]?.count || 0);

    case "use_dj_mode":
      // Contar días únicos con actividad en DJ MODE
      return await db
        .select({ count: sql<number>`count(distinct date(${djProfiles.updatedAt}))` })
        .from(djProfiles)
        .where(
          and(
            eq(djProfiles.userId, userId),
            gte(djProfiles.updatedAt, weekStart),
            sql`${djProfiles.updatedAt} < ${weekEnd}`
          )
        )
        .then((rows: any[]) => rows[0]?.count || 0);

    default:
      return 0;
  }
}
