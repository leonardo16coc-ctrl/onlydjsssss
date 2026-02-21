/**
 * Scout Statistics Router
 * Provides real-time stats for the scout dashboard
 */

import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { discoveredDjs } from "../../drizzle/schema-agents";
import { sql, gte, and, eq } from "drizzle-orm";

export const scoutStatsRouter = router({
  /**
   * Get overall statistics
   */
  getOverallStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    // Total DJs discovered
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(discoveredDjs);
    const total = Number(totalResult[0]?.count || 0);
    
    // DJs discovered today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(discoveredDjs)
      .where(gte(discoveredDjs.discoveryDate, today));
    const todayCount = Number(todayResult[0]?.count || 0);
    
    // DJs by status
    const byStatus = await db
      .select({
        status: discoveredDjs.discoveryStatus,
        count: sql<number>`count(*)`
      })
      .from(discoveredDjs)
      .groupBy(discoveredDjs.discoveryStatus);
    
    return {
      total,
      todayCount,
      byStatus: byStatus.map(s => ({ status: s.status, count: Number(s.count) })),
    };
  }),

  /**
   * Get DJs by platform
   */
  getByPlatform: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const platforms = [
      { name: "SoundCloud", field: discoveredDjs.soundcloudUsername },
      { name: "Instagram", field: discoveredDjs.instagramUsername },
    ];
    
    const results = await Promise.all(
      platforms.map(async (platform) => {
        const result = await db
          .select({ count: sql<number>`count(*)` })
          .from(discoveredDjs)
          .where(sql`${platform.field} IS NOT NULL`);
        return {
          platform: platform.name,
          count: Number(result[0]?.count || 0),
        };
      })
    );
    
    return results;
  }),

  /**
   * Get recent DJs (last 20)
   */
  getRecentDJs: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const recent = await db
      .select()
      .from(discoveredDjs)
      .orderBy(sql`${discoveredDjs.discoveryDate} DESC`)
      .limit(20);
    
    return recent;
  }),

  /**
   * Get DJs discovered per day (last 7 days)
   */
  getDailyStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyStats = await db
      .select({
        date: sql<string>`DATE(${discoveredDjs.discoveryDate})`,
        count: sql<number>`count(*)`
      })
      .from(discoveredDjs)
      .where(gte(discoveredDjs.discoveryDate, sevenDaysAgo))
      .groupBy(sql`DATE(${discoveredDjs.discoveryDate})`)
      .orderBy(sql`DATE(${discoveredDjs.discoveryDate}) ASC`);
    
    return dailyStats.map((d: any) => ({ date: d.date, count: Number(d.count) }));
  }),

  /**
   * Get top genres
   */
  getTopGenres: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const genres = await db
      .select({
        genre: discoveredDjs.primaryGenre,
        count: sql<number>`count(*)`
      })
      .from(discoveredDjs)
      .where(sql`${discoveredDjs.primaryGenre} IS NOT NULL`)
      .groupBy(discoveredDjs.primaryGenre)
      .orderBy(sql`count(*) DESC`)
      .limit(10);
    
    return genres.map((g: any) => ({ genre: g.genre, count: Number(g.count) }));
  }),
});
