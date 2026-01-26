import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { dnaShareAnalytics } from "../../drizzle/schema";
import { eq, sql, and, gte } from "drizzle-orm";

export const dnaAnalyticsRouter = router({
  /**
   * Track DNA share event
   */
  trackDNAShare: protectedProcedure
    .input(
      z.object({
        format: z.enum(["story", "square", "banner"]),
        platform: z.enum(["download", "twitter", "facebook", "whatsapp", "copy"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(dnaShareAnalytics).values({
        userId: ctx.user.id,
        format: input.format,
        platform: input.platform,
      });

      return { success: true };
    }),

  /**
   * Get DNA share statistics
   */
  getDNAShareStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Total shares por formato
    const formatStats = await db
      .select({
        format: dnaShareAnalytics.format,
        count: sql<number>`COUNT(*)`.as("count"),
      })
      .from(dnaShareAnalytics)
      .groupBy(dnaShareAnalytics.format);

    // Total shares por plataforma
    const platformStats = await db
      .select({
        platform: dnaShareAnalytics.platform,
        count: sql<number>`COUNT(*)`.as("count"),
      })
      .from(dnaShareAnalytics)
      .groupBy(dnaShareAnalytics.platform);

    // Total shares
    const totalShares = await db
      .select({ count: sql<number>`COUNT(*)`.as("count") })
      .from(dnaShareAnalytics)
      .then((rows) => rows[0]?.count || 0);

    // Shares por día (últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await db
      .select({
        date: sql<string>`DATE(${dnaShareAnalytics.createdAt})`.as("date"),
        count: sql<number>`COUNT(*)`.as("count"),
      })
      .from(dnaShareAnalytics)
      .where(gte(dnaShareAnalytics.createdAt, sevenDaysAgo))
      .groupBy(sql`DATE(${dnaShareAnalytics.createdAt})`);

    return {
      totalShares,
      formatStats,
      platformStats,
      dailyStats,
    };
  }),

  /**
   * Get my DNA share history
   */
  getMyDNAShareHistory: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const history = await db
      .select()
      .from(dnaShareAnalytics)
      .where(eq(dnaShareAnalytics.userId, ctx.user.id))
      .orderBy(sql`${dnaShareAnalytics.createdAt} DESC`)
      .limit(50);

    // Stats personales
    const myFormatStats = await db
      .select({
        format: dnaShareAnalytics.format,
        count: sql<number>`COUNT(*)`.as("count"),
      })
      .from(dnaShareAnalytics)
      .where(eq(dnaShareAnalytics.userId, ctx.user.id))
      .groupBy(dnaShareAnalytics.format);

    const myPlatformStats = await db
      .select({
        platform: dnaShareAnalytics.platform,
        count: sql<number>`COUNT(*)`.as("count"),
      })
      .from(dnaShareAnalytics)
      .where(eq(dnaShareAnalytics.userId, ctx.user.id))
      .groupBy(dnaShareAnalytics.platform);

    const myTotalShares = await db
      .select({ count: sql<number>`COUNT(*)`.as("count") })
      .from(dnaShareAnalytics)
      .where(eq(dnaShareAnalytics.userId, ctx.user.id))
      .then((rows) => rows[0]?.count || 0);

    return {
      history,
      stats: {
        totalShares: myTotalShares,
        formatStats: myFormatStats,
        platformStats: myPlatformStats,
      },
    };
  }),
});
