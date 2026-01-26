import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { tracks, trackFestivalScores, downloads, users } from "../../drizzle/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";

/**
 * Festival Rankings Router
 * Global Festival Rankings - El Billboard del DJ moderno
 */

export const festivalRankingsRouter = router({
  // 🔥 Festival Weapons - Top tracks por Festival Score
  getFestivalWeapons: publicProcedure
    .input(z.object({
      limit: z.number().int().min(5).max(100).default(20),
      country: z.string().optional(),
      month: z.string().regex(/^\d{4}-\d{2}$/).optional(), // YYYY-MM format
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const weapons = await db
        .select({
          trackId: trackFestivalScores.trackId,
          festivalScore: trackFestivalScores.festivalScore,
          crowdImpactScore: trackFestivalScores.crowdImpactScore,
          dropExplosionProbability: trackFestivalScores.dropExplosionProbability,
          // Track info
          title: tracks.title,
          artist: tracks.artist,
          genre: tracks.genre,
          bpm: tracks.bpm,
          musicalKey: tracks.musicalKey,
          energy: tracks.energy,
          coverImageUrl: tracks.coverImageUrl,
          trackType: tracks.trackType,
        })
        .from(trackFestivalScores)
        .leftJoin(tracks, eq(trackFestivalScores.trackId, tracks.id))
        .orderBy(desc(trackFestivalScores.festivalScore))
        .limit(input.limit);

      return weapons.map((w, index) => ({
        ...w,
        position: index + 1,
        trend: "stable" as const, // TODO: Calculate trend based on historical data
      }));
    }),

  // 🚀 Peak Time Anthems - Top tracks por Peak Time Score
  getPeakTimeAnthems: publicProcedure
    .input(z.object({
      limit: z.number().int().min(5).max(100).default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const anthems = await db
        .select({
          trackId: trackFestivalScores.trackId,
          peakTimeScore: trackFestivalScores.peakTimeScore,
          crowdEnergyScore: trackFestivalScores.crowdEnergyScore,
          handsUpProbability: trackFestivalScores.handsUpProbability,
          // Track info
          title: tracks.title,
          artist: tracks.artist,
          genre: tracks.genre,
          bpm: tracks.bpm,
          musicalKey: tracks.musicalKey,
          energy: tracks.energy,
          coverImageUrl: tracks.coverImageUrl,
          trackType: tracks.trackType,
        })
        .from(trackFestivalScores)
        .leftJoin(tracks, eq(trackFestivalScores.trackId, tracks.id))
        .orderBy(desc(trackFestivalScores.peakTimeScore))
        .limit(input.limit);

      return anthems.map((a, index) => ({
        ...a,
        position: index + 1,
        trend: "stable" as const,
      }));
    }),

  // 🎆 Mainstage Bombs - Top tracks por Mainstage Compatibility
  getMainstageBombs: publicProcedure
    .input(z.object({
      limit: z.number().int().min(5).max(100).default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const bombs = await db
        .select({
          trackId: trackFestivalScores.trackId,
          mainstageCompatibilityScore: trackFestivalScores.mainstageCompatibilityScore,
          festivalScore: trackFestivalScores.festivalScore,
          dropImpactScore: trackFestivalScores.dropImpactScore,
          // Track info
          title: tracks.title,
          artist: tracks.artist,
          genre: tracks.genre,
          bpm: tracks.bpm,
          musicalKey: tracks.musicalKey,
          energy: tracks.energy,
          coverImageUrl: tracks.coverImageUrl,
          trackType: tracks.trackType,
        })
        .from(trackFestivalScores)
        .leftJoin(tracks, eq(trackFestivalScores.trackId, tracks.id))
        .orderBy(desc(trackFestivalScores.mainstageCompatibilityScore))
        .limit(input.limit);

      return bombs.map((b, index) => ({
        ...b,
        position: index + 1,
        trend: "stable" as const,
      }));
    }),

  // 🌍 Global Trending - Tracks con mayor crecimiento (últimos 7 días)
  getGlobalTrending: publicProcedure
    .input(z.object({
      limit: z.number().int().min(5).max(100).default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const trending = await db
        .select({
          trackId: downloads.trackId,
          downloadCount: sql<number>`COUNT(*)`,
          // Track info
          title: tracks.title,
          artist: tracks.artist,
          genre: tracks.genre,
          bpm: tracks.bpm,
          musicalKey: tracks.musicalKey,
          energy: tracks.energy,
          coverImageUrl: tracks.coverImageUrl,
          trackType: tracks.trackType,
          // Scores
          festivalScore: trackFestivalScores.festivalScore,
          crowdImpactScore: trackFestivalScores.crowdImpactScore,
        })
        .from(downloads)
        .leftJoin(tracks, eq(downloads.trackId, tracks.id))
        .leftJoin(trackFestivalScores, eq(downloads.trackId, trackFestivalScores.trackId))
        .where(gte(downloads.downloadedAt, sevenDaysAgo))
        .groupBy(downloads.trackId)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(input.limit);

      return trending.map((t, index) => ({
        ...t,
        position: index + 1,
        trend: "up" as const,
      }));
    }),

  // 🏆 Top Festival DJs - DJs con más tracks en rankings
  getTopFestivalDJs: publicProcedure
    .input(z.object({
      limit: z.number().int().min(5).max(50).default(10),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const topDJs = await db
        .select({
          userId: tracks.userId,
          userName: users.name,

          trackCount: sql<number>`COUNT(*)`,
          avgFestivalScore: sql<number>`AVG(${trackFestivalScores.festivalScore})`,
          avgMainstageScore: sql<number>`AVG(${trackFestivalScores.mainstageCompatibilityScore})`,
        })
        .from(trackFestivalScores)
        .leftJoin(tracks, eq(trackFestivalScores.trackId, tracks.id))
        .leftJoin(users, eq(tracks.userId, users.id))
        .where(gte(trackFestivalScores.festivalScore, 70)) // Solo DJs con tracks de alta calidad
        .groupBy(tracks.userId)
        .orderBy(desc(sql`AVG(${trackFestivalScores.festivalScore})`))
        .limit(input.limit);

      return topDJs.map((dj, index) => ({
        ...dj,
        position: index + 1,
        avgFestivalScore: Math.round(dj.avgFestivalScore || 0),
        avgMainstageScore: Math.round(dj.avgMainstageScore || 0),
      }));
    }),

  // 🎵 Top Mainstage Genres - Géneros dominantes
  getTopMainstageGenres: publicProcedure
    .input(z.object({
      limit: z.number().int().min(5).max(20).default(10),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const topGenres = await db
        .select({
          genre: tracks.genre,
          trackCount: sql<number>`COUNT(*)`,
          avgFestivalScore: sql<number>`AVG(${trackFestivalScores.festivalScore})`,
          avgMainstageScore: sql<number>`AVG(${trackFestivalScores.mainstageCompatibilityScore})`,
          avgCrowdImpact: sql<number>`AVG(${trackFestivalScores.crowdImpactScore})`,
        })
        .from(trackFestivalScores)
        .leftJoin(tracks, eq(trackFestivalScores.trackId, tracks.id))
        .where(gte(trackFestivalScores.festivalScore, 60))
        .groupBy(tracks.genre)
        .orderBy(desc(sql`AVG(${trackFestivalScores.festivalScore})`))
        .limit(input.limit);

      return topGenres.map((g, index) => ({
        ...g,
        position: index + 1,
        avgFestivalScore: Math.round(g.avgFestivalScore || 0),
        avgMainstageScore: Math.round(g.avgMainstageScore || 0),
        avgCrowdImpact: Math.round(g.avgCrowdImpact || 0),
      }));
    }),

  // ⚡ Top Energy Drops - Tracks con mayor Drop Impact
  getTopEnergyDrops: publicProcedure
    .input(z.object({
      limit: z.number().int().min(5).max(100).default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const topDrops = await db
        .select({
          trackId: trackFestivalScores.trackId,
          dropImpactScore: trackFestivalScores.dropImpactScore,
          dropExplosionProbability: trackFestivalScores.dropExplosionProbability,
          crowdEnergyScore: trackFestivalScores.crowdEnergyScore,
          // Track info
          title: tracks.title,
          artist: tracks.artist,
          genre: tracks.genre,
          bpm: tracks.bpm,
          musicalKey: tracks.musicalKey,
          energy: tracks.energy,
          coverImageUrl: tracks.coverImageUrl,
          trackType: tracks.trackType,
        })
        .from(trackFestivalScores)
        .leftJoin(tracks, eq(trackFestivalScores.trackId, tracks.id))
        .orderBy(desc(trackFestivalScores.dropImpactScore))
        .limit(input.limit);

      return topDrops.map((d, index) => ({
        ...d,
        position: index + 1,
        trend: "stable" as const,
      }));
    }),

  // Obtener todos los rankings en una sola llamada (para dashboard)
  getAllRankings: publicProcedure
    .input(z.object({
      limit: z.number().int().min(3).max(20).default(10),
      country: z.string().optional(),
      month: z.string().regex(/^\d{4}-\d{2}$/).optional(), // YYYY-MM format
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Ejecutar todas las queries en paralelo
      const [weapons, anthems, bombs, trending, topDJs, topGenres, topDrops] = await Promise.all([
        db.select({
          trackId: trackFestivalScores.trackId,
          festivalScore: trackFestivalScores.festivalScore,
          title: tracks.title,
          artist: tracks.artist,
          genre: tracks.genre,
          coverImageUrl: tracks.coverImageUrl,
        })
        .from(trackFestivalScores)
        .leftJoin(tracks, eq(trackFestivalScores.trackId, tracks.id))
        .orderBy(desc(trackFestivalScores.festivalScore))
        .limit(input.limit),

        db.select({
          trackId: trackFestivalScores.trackId,
          peakTimeScore: trackFestivalScores.peakTimeScore,
          title: tracks.title,
          artist: tracks.artist,
          genre: tracks.genre,
          coverImageUrl: tracks.coverImageUrl,
        })
        .from(trackFestivalScores)
        .leftJoin(tracks, eq(trackFestivalScores.trackId, tracks.id))
        .orderBy(desc(trackFestivalScores.peakTimeScore))
        .limit(input.limit),

        db.select({
          trackId: trackFestivalScores.trackId,
          mainstageCompatibilityScore: trackFestivalScores.mainstageCompatibilityScore,
          title: tracks.title,
          artist: tracks.artist,
          genre: tracks.genre,
          coverImageUrl: tracks.coverImageUrl,
        })
        .from(trackFestivalScores)
        .leftJoin(tracks, eq(trackFestivalScores.trackId, tracks.id))
        .orderBy(desc(trackFestivalScores.mainstageCompatibilityScore))
        .limit(input.limit),

        db.select({
          trackId: downloads.trackId,
          downloadCount: sql<number>`COUNT(*)`,
          title: tracks.title,
          artist: tracks.artist,
          genre: tracks.genre,
          coverImageUrl: tracks.coverImageUrl,
        })
        .from(downloads)
        .leftJoin(tracks, eq(downloads.trackId, tracks.id))
        .where(and(
          gte(downloads.downloadedAt, input.month 
            ? sql`DATE_FORMAT(${downloads.downloadedAt}, '%Y-%m') = ${input.month}`
            : sql`DATE_SUB(NOW(), INTERVAL 7 DAY)`
          ),
          input.country ? eq(downloads.country, input.country) : sql`1=1`
        ))
        .groupBy(downloads.trackId)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(input.limit),

        db.select({
          userId: tracks.userId,
          userName: users.name,
          trackCount: sql<number>`COUNT(*)`,
        })
        .from(trackFestivalScores)
        .leftJoin(tracks, eq(trackFestivalScores.trackId, tracks.id))
        .leftJoin(users, eq(tracks.userId, users.id))
        .where(and(
          gte(trackFestivalScores.festivalScore, 70),
          input.country ? eq(users.country, input.country) : sql`1=1`
        ))
        .groupBy(tracks.userId)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(input.limit),

        db.select({
          genre: tracks.genre,
          trackCount: sql<number>`COUNT(*)`,
        })
        .from(trackFestivalScores)
        .leftJoin(tracks, eq(trackFestivalScores.trackId, tracks.id))
        .where(gte(trackFestivalScores.festivalScore, 60))
        .groupBy(tracks.genre)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(input.limit),

        db.select({
          trackId: trackFestivalScores.trackId,
          dropImpactScore: trackFestivalScores.dropImpactScore,
          title: tracks.title,
          artist: tracks.artist,
          genre: tracks.genre,
          coverImageUrl: tracks.coverImageUrl,
        })
        .from(trackFestivalScores)
        .leftJoin(tracks, eq(trackFestivalScores.trackId, tracks.id))
        .orderBy(desc(trackFestivalScores.dropImpactScore))
        .limit(input.limit),
      ]);

      return {
        festivalWeapons: weapons,
        peakTimeAnthems: anthems,
        mainstageBombs: bombs,
        globalTrending: trending,
        topFestivalDJs: topDJs,
        topMainstageGenres: topGenres,
        topEnergyDrops: topDrops,
      };
    }),
});
