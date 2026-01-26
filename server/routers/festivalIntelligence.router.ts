import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { tracks, downloads, trackFestivalScores } from "../../drizzle/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";

/**
 * Festival Intelligence Engine Router
 * Sistema de scores inteligentes para MAINSTAGE MODE
 */

// Algoritmo de cálculo de scores basado en metadata y actividad
async function calculateFestivalScores(trackId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  // Obtener track con metadata
  const track = await db.select().from(tracks).where(eq(tracks.id, trackId)).limit(1);
  if (!track || track.length === 0) {
    throw new Error("Track not found");
  }

  const trackData = track[0];

  // Obtener estadísticas de actividad (últimos 30 días)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const downloadStats = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(downloads)
    .where(and(
      eq(downloads.trackId, trackId),
      gte(downloads.downloadedAt, thirtyDaysAgo)
    ));

  const downloadCount = downloadStats[0]?.count || 0;

  // Calcular scores (0-100)
  
  // 1. Festival Score: basado en energía, BPM, tipo de track
  let festivalScore = 0;
  if (trackData.energy) {
    festivalScore += Math.min(trackData.energy, 100) * 0.4; // 40% peso
  }
  if (trackData.bpm && trackData.bpm >= 120 && trackData.bpm <= 140) {
    festivalScore += 30; // BPM ideal para festivales
  } else if (trackData.bpm && trackData.bpm > 100) {
    festivalScore += 15;
  }
  if (trackData.genre && ["EDM", "Big Room", "Electro House", "Progressive House"].includes(trackData.genre)) {
    festivalScore += 20;
  }
  if (downloadCount > 50) {
    festivalScore += 10; // Popularidad
  }
  festivalScore = Math.min(Math.round(festivalScore), 100);

  // 2. Peak Time Score: basado en energía alta + BPM rápido
  let peakTimeScore = 0;
  if (trackData.energy && trackData.energy >= 80) {
    peakTimeScore += 50;
  } else if (trackData.energy && trackData.energy >= 60) {
    peakTimeScore += 30;
  }
  if (trackData.bpm && trackData.bpm >= 128) {
    peakTimeScore += 30;
  }
  if (trackData.genre && ["Big Room", "Electro House", "Bass House", "Hard Techno"].includes(trackData.genre)) {
    peakTimeScore += 20;
  }
  peakTimeScore = Math.min(Math.round(peakTimeScore), 100);

  // 3. Drop Impact Score: basado en energía + estructura
  let dropImpactScore = 0;
  if (trackData.energy) {
    dropImpactScore += Math.min(trackData.energy, 100) * 0.6; // 60% peso
  }
  if (trackData.genre && ["Big Room", "Dubstep", "Trap", "Bass House"].includes(trackData.genre)) {
    dropImpactScore += 30; // Géneros con drops potentes
  }
  if (downloadCount > 100) {
    dropImpactScore += 10; // Validación social
  }
  dropImpactScore = Math.min(Math.round(dropImpactScore), 100);

  // 4. Crowd Energy Score: basado en energía + popularidad
  let crowdEnergyScore = 0;
  if (trackData.energy) {
    crowdEnergyScore += Math.min(trackData.energy, 100) * 0.5; // 50% peso
  }
  crowdEnergyScore += Math.min(downloadCount / 2, 30); // Hasta 30 puntos por popularidad
  if (trackData.genre && ["EDM", "Big Room", "Electro House", "Tech House"].includes(trackData.genre)) {
    crowdEnergyScore += 20;
  }
  crowdEnergyScore = Math.min(Math.round(crowdEnergyScore), 100);

  // 5. Mainstage Compatibility Score: combinación de todos los factores
  let mainstageCompatibilityScore = 0;
  mainstageCompatibilityScore += festivalScore * 0.3;
  mainstageCompatibilityScore += peakTimeScore * 0.25;
  mainstageCompatibilityScore += dropImpactScore * 0.25;
  mainstageCompatibilityScore += crowdEnergyScore * 0.2;
  mainstageCompatibilityScore = Math.min(Math.round(mainstageCompatibilityScore), 100);

  // Crowd Impact Prediction metrics
  const crowdImpactScore = Math.round((festivalScore + crowdEnergyScore) / 2);
  const dropExplosionProbability = Math.min(dropImpactScore + 10, 100);
  const handsUpProbability = Math.min(crowdEnergyScore + 5, 100);
  const energyRetention = Math.min(peakTimeScore, 100);

  return {
    trackId,
    festivalScore,
    peakTimeScore,
    dropImpactScore,
    crowdEnergyScore,
    mainstageCompatibilityScore,
    crowdImpactScore,
    dropExplosionProbability,
    handsUpProbability,
    energyRetention,
  };
}

export const festivalIntelligenceRouter = router({
  // Calcular scores para un track
  calculateScores: protectedProcedure
    .input(z.object({
      trackId: z.number().int().positive(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const scores = await calculateFestivalScores(input.trackId);

      // Verificar si ya existen scores para este track
      const existing = await db
        .select()
        .from(trackFestivalScores)
        .where(eq(trackFestivalScores.trackId, input.trackId))
        .limit(1);

      if (existing && existing.length > 0) {
        // Actualizar scores existentes
        await db
          .update(trackFestivalScores)
          .set({
            ...scores,
            calculatedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(trackFestivalScores.trackId, input.trackId));
      } else {
        // Insertar nuevos scores
        await db.insert(trackFestivalScores).values(scores);
      }

      return {
        success: true,
        scores,
      };
    }),

  // Obtener scores de un track
  getTrackScores: publicProcedure
    .input(z.object({
      trackId: z.number().int().positive(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const scores = await db
        .select()
        .from(trackFestivalScores)
        .where(eq(trackFestivalScores.trackId, input.trackId))
        .limit(1);

      if (!scores || scores.length === 0) {
        return null;
      }

      return scores[0];
    }),

  // Calcular scores para múltiples tracks (batch)
  calculateBatchScores: protectedProcedure
    .input(z.object({
      trackIds: z.array(z.number().int().positive()).min(1).max(50),
    }))
    .mutation(async ({ input }) => {
      const results = [];

      for (const trackId of input.trackIds) {
        try {
          const scores = await calculateFestivalScores(trackId);
          const db = await getDb();
          if (!db) continue;

          // Upsert scores
          const existing = await db
            .select()
            .from(trackFestivalScores)
            .where(eq(trackFestivalScores.trackId, trackId))
            .limit(1);

          if (existing && existing.length > 0) {
            await db
              .update(trackFestivalScores)
              .set({
                ...scores,
                calculatedAt: new Date(),
                updatedAt: new Date(),
              })
              .where(eq(trackFestivalScores.trackId, trackId));
          } else {
            await db.insert(trackFestivalScores).values(scores);
          }

          results.push({ trackId, success: true, scores });
        } catch (error) {
          results.push({ trackId, success: false, error: String(error) });
        }
      }

      return {
        total: input.trackIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results,
      };
    }),

  // Obtener top tracks por un score específico
  getTopByScore: publicProcedure
    .input(z.object({
      scoreType: z.enum(["festival", "peakTime", "dropImpact", "crowdEnergy", "mainstageCompatibility"]),
      limit: z.number().int().min(5).max(100).default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const scoreColumnMap = {
        festival: trackFestivalScores.festivalScore,
        peakTime: trackFestivalScores.peakTimeScore,
        dropImpact: trackFestivalScores.dropImpactScore,
        crowdEnergy: trackFestivalScores.crowdEnergyScore,
        mainstageCompatibility: trackFestivalScores.mainstageCompatibilityScore,
      };

      const scoreColumn = scoreColumnMap[input.scoreType];

      const topTracks = await db
        .select({
          trackId: trackFestivalScores.trackId,
          score: scoreColumn,
          festivalScore: trackFestivalScores.festivalScore,
          peakTimeScore: trackFestivalScores.peakTimeScore,
          dropImpactScore: trackFestivalScores.dropImpactScore,
          crowdEnergyScore: trackFestivalScores.crowdEnergyScore,
          mainstageCompatibilityScore: trackFestivalScores.mainstageCompatibilityScore,
          crowdImpactScore: trackFestivalScores.crowdImpactScore,
          dropExplosionProbability: trackFestivalScores.dropExplosionProbability,
          handsUpProbability: trackFestivalScores.handsUpProbability,
          energyRetention: trackFestivalScores.energyRetention,
          calculatedAt: trackFestivalScores.calculatedAt,
          // Track info
          trackTitle: tracks.title,
          trackArtist: tracks.artist,
          trackGenre: tracks.genre,
          trackBpm: tracks.bpm,
          trackKey: tracks.musicalKey,
          trackEnergy: tracks.energy,
          trackCoverUrl: tracks.coverImageUrl,
        })
        .from(trackFestivalScores)
        .leftJoin(tracks, eq(trackFestivalScores.trackId, tracks.id))
        .orderBy(desc(scoreColumn))
        .limit(input.limit);

      return topTracks;
    }),
});
