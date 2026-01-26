import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { dnaShareAnalytics, users } from "../../drizzle/schema";
import { eq, sql, and, gte, desc } from "drizzle-orm";

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

  /**
   * Get Top DJs Sharers leaderboard
   */
  getTopSharers: publicProcedure
    .input(
      z.object({
        period: z.enum(["month", "week", "all-time"]).default("month"),
        limit: z.number().min(5).max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Calcular fecha de inicio según período
      let startDate: Date | null = null;
      if (input.period === "month") {
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
      } else if (input.period === "week") {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
      }

      // Query base
      const whereClause = startDate ? gte(dnaShareAnalytics.createdAt, startDate) : undefined;

      // Obtener top sharers con información del usuario
      const topSharers = await db
        .select({
          userId: dnaShareAnalytics.userId,
          totalShares: sql<number>`COUNT(*)`.as("totalShares"),
          userName: users.name,
          userAvatar: users.avatarUrl,
          membershipStatus: users.membershipStatus,
        })
        .from(dnaShareAnalytics)
        .innerJoin(users, eq(dnaShareAnalytics.userId, users.id))
        .where(whereClause)
        .groupBy(dnaShareAnalytics.userId, users.name, users.avatarUrl, users.membershipStatus)
        .orderBy(desc(sql`COUNT(*)`), users.name)
        .limit(input.limit);

      // Obtener formato favorito de cada top sharer
      const topSharersWithFavoriteFormat = await Promise.all(
        topSharers.map(async (sharer) => {
          const favoriteFormat = await db
            .select({
              format: dnaShareAnalytics.format,
              count: sql<number>`COUNT(*)`.as("count"),
            })
            .from(dnaShareAnalytics)
            .where(
              whereClause
                ? and(eq(dnaShareAnalytics.userId, sharer.userId), whereClause)
                : eq(dnaShareAnalytics.userId, sharer.userId)
            )
            .groupBy(dnaShareAnalytics.format)
            .orderBy(desc(sql`COUNT(*)`), dnaShareAnalytics.format)
            .limit(1)
            .then((rows) => rows[0]?.format || "square");

          return {
            ...sharer,
            favoriteFormat,
          };
        })
      );

      // Agregar ranking position
      const leaderboard = topSharersWithFavoriteFormat.map((sharer, index) => ({
        position: index + 1,
        ...sharer,
      }));

      return {
        period: input.period,
        leaderboard,
      };
    }),
});
