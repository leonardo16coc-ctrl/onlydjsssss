import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { trackEarnings, tracks, artistPayouts } from "../../drizzle/schema";
import { eq, and, gte, sql, desc, lte } from "drizzle-orm";

/**
 * Earnings Router - Monetization system for PRO artists
 * 
 * Features:
 * - Total earnings calculation
 * - Earnings by track
 * - Monthly stats
 * - Earnings history
 * - Payout management
 */

export const earningsRouter = router({
  /**
   * Get total earnings for current artist
   */
  getTotalEarnings: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

    // Only PRO artists can have earnings
    if (ctx.user.membershipStatus !== "member") {
      return {
        totalEarnings: "0.00",
        totalDownloads: 0,
        averagePerDownload: "0.00",
        isPro: false,
      };
    }

    const result = await db
      .select({
        totalEarnings: sql<string>`COALESCE(SUM(${trackEarnings.artistShare}), 0)`,
        totalDownloads: sql<number>`COUNT(*)`,
      })
      .from(trackEarnings)
      .where(eq(trackEarnings.artistId, ctx.user.id));

    const totalEarnings = result[0]?.totalEarnings || "0.00";
    const totalDownloads = result[0]?.totalDownloads || 0;
    const averagePerDownload = totalDownloads > 0 
      ? (parseFloat(totalEarnings) / totalDownloads).toFixed(2)
      : "0.00";

    return {
      totalEarnings,
      totalDownloads,
      averagePerDownload,
      isPro: true,
    };
  }),

  /**
   * Get earnings by track
   */
  getEarningsByTrack: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

    if (ctx.user.membershipStatus !== "member") {
      return [];
    }

    const result = await db
      .select({
        trackId: trackEarnings.trackId,
        trackTitle: tracks.title,
        trackArtist: tracks.artist,
        totalEarnings: sql<string>`SUM(${trackEarnings.artistShare})`,
        totalDownloads: sql<number>`COUNT(*)`,
        averagePerDownload: sql<string>`AVG(${trackEarnings.artistShare})`,
      })
      .from(trackEarnings)
      .leftJoin(tracks, eq(trackEarnings.trackId, tracks.id))
      .where(eq(trackEarnings.artistId, ctx.user.id))
      .groupBy(trackEarnings.trackId, tracks.title, tracks.artist)
      .orderBy(desc(sql`SUM(${trackEarnings.artistShare})`));

    return result.map((row) => ({
      trackId: row.trackId,
      trackTitle: row.trackTitle || "Unknown",
      trackArtist: row.trackArtist || "Unknown",
      totalEarnings: parseFloat(row.totalEarnings || "0").toFixed(2),
      totalDownloads: row.totalDownloads,
      averagePerDownload: parseFloat(row.averagePerDownload || "0").toFixed(2),
    }));
  }),

  /**
   * Get earnings history (paginated)
   */
  getEarningsHistory: protectedProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(100).default(20),
      offset: z.number().int().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      if (ctx.user.membershipStatus !== "member") {
        return { earnings: [], total: 0 };
      }

      const result = await db
        .select({
          id: trackEarnings.id,
          trackId: trackEarnings.trackId,
          trackTitle: tracks.title,
          trackArtist: tracks.artist,
          downloaderId: trackEarnings.downloaderId,
          artistShare: trackEarnings.artistShare,
          createdAt: trackEarnings.createdAt,
        })
        .from(trackEarnings)
        .leftJoin(tracks, eq(trackEarnings.trackId, tracks.id))
        .where(eq(trackEarnings.artistId, ctx.user.id))
        .orderBy(desc(trackEarnings.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const countResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(trackEarnings)
        .where(eq(trackEarnings.artistId, ctx.user.id));

      return {
        earnings: result.map((row) => ({
          id: row.id,
          trackId: row.trackId,
          trackTitle: row.trackTitle || "Unknown",
          trackArtist: row.trackArtist || "Unknown",
          downloaderId: row.downloaderId,
          amount: parseFloat(row.artistShare || "0").toFixed(2),
          createdAt: row.createdAt,
        })),
        total: countResult[0]?.count || 0,
      };
    }),

  /**
   * Get monthly earnings stats
   */
  getMonthlyStats: protectedProcedure
    .input(z.object({
      months: z.number().int().min(1).max(12).default(6), // Last N months
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      if (ctx.user.membershipStatus !== "member") {
        return [];
      }

      // Calculate start date (N months ago)
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - input.months);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);

      const result = await db
        .select({
          month: sql<string>`DATE_FORMAT(${trackEarnings.createdAt}, '%Y-%m')`,
          totalEarnings: sql<string>`SUM(${trackEarnings.artistShare})`,
          totalDownloads: sql<number>`COUNT(*)`,
        })
        .from(trackEarnings)
        .where(
          and(
            eq(trackEarnings.artistId, ctx.user.id),
            gte(trackEarnings.createdAt, startDate)
          )
        )
        .groupBy(sql`DATE_FORMAT(${trackEarnings.createdAt}, '%Y-%m')`)
        .orderBy(sql`DATE_FORMAT(${trackEarnings.createdAt}, '%Y-%m')`);

      return result.map((row) => ({
        month: row.month,
        totalEarnings: parseFloat(row.totalEarnings || "0").toFixed(2),
        totalDownloads: row.totalDownloads,
      }));
    }),

  /**
   * Get payout history
   */
  getPayoutHistory: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

    if (ctx.user.membershipStatus !== "member") {
      return [];
    }

    const result = await db
      .select()
      .from(artistPayouts)
      .where(eq(artistPayouts.artistId, ctx.user.id))
      .orderBy(desc(artistPayouts.createdAt));

    return result.map((payout) => ({
      id: payout.id,
      amount: parseFloat(payout.amount).toFixed(2),
      currency: payout.currency,
      status: payout.status,
      paymentMethod: payout.paymentMethod,
      periodStart: payout.periodStart,
      periodEnd: payout.periodEnd,
      totalDownloads: payout.totalDownloads,
      requestedAt: payout.requestedAt,
      completedAt: payout.completedAt,
    }));
  }),

  /**
   * Get DJ Score and metrics (NEW HYBRID MODEL)
   */
  getDJScore: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

    if (ctx.user.membershipStatus !== "member") {
      return {
        isPro: false,
        djScore: 0,
        metrics: {
          downloads: 0,
          streams: 0,
          minutesListened: 0,
          favoritesPlaylists: 0,
        },
        breakdown: {
          fromDownloads: 0,
          fromStreams: 0,
          fromMinutes: 0,
          fromFavoritesPlaylists: 0,
        },
      };
    }

    // Get DJ's tracks
    const djTracks = await db
      .select({
        downloads: sql<number>`SUM(${tracks.downloadCount})`,
        streams: sql<number>`SUM(${tracks.streamCount})`,
        minutesListened: sql<number>`SUM(${tracks.minutesListened})`,
        favorites: sql<number>`SUM(${tracks.favoritesCount})`,
        playlists: sql<number>`SUM(${tracks.playlistsCount})`,
      })
      .from(tracks)
      .where(eq(tracks.userId, ctx.user.id));

    const metrics = {
      downloads: djTracks[0]?.downloads || 0,
      streams: djTracks[0]?.streams || 0,
      minutesListened: djTracks[0]?.minutesListened || 0,
      favoritesPlaylists: (djTracks[0]?.favorites || 0) + (djTracks[0]?.playlists || 0),
    };

    // Calculate DJ Score: (DOWNLOADS × 40%) + (STREAMS × 30%) + (MINUTES × 20%) + (FAVORITES+PLAYLISTS × 10%)
    const breakdown = {
      fromDownloads: metrics.downloads * 0.40,
      fromStreams: metrics.streams * 0.30,
      fromMinutes: metrics.minutesListened * 0.20,
      fromFavoritesPlaylists: metrics.favoritesPlaylists * 0.10,
    };

    const djScore = 
      breakdown.fromDownloads +
      breakdown.fromStreams +
      breakdown.fromMinutes +
      breakdown.fromFavoritesPlaylists;

    return {
      isPro: true,
      djScore: parseFloat(djScore.toFixed(2)),
      metrics,
      breakdown: {
        fromDownloads: parseFloat(breakdown.fromDownloads.toFixed(2)),
        fromStreams: parseFloat(breakdown.fromStreams.toFixed(2)),
        fromMinutes: parseFloat(breakdown.fromMinutes.toFixed(2)),
        fromFavoritesPlaylists: parseFloat(breakdown.fromFavoritesPlaylists.toFixed(2)),
      },
    };
  }),

  /**
   * Get dashboard stats (overview)
   */
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

    if (ctx.user.membershipStatus !== "member") {
      return {
        isPro: false,
        totalEarnings: "0.00",
        totalDownloads: 0,
        thisMonthEarnings: "0.00",
        thisMonthDownloads: 0,
        topTrack: null,
        pendingPayout: "0.00",
      };
    }

    // Total earnings
    const totalResult = await db
      .select({
        totalEarnings: sql<string>`COALESCE(SUM(${trackEarnings.artistShare}), 0)`,
        totalDownloads: sql<number>`COUNT(*)`,
      })
      .from(trackEarnings)
      .where(eq(trackEarnings.artistId, ctx.user.id));

    // This month earnings
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthResult = await db
      .select({
        thisMonthEarnings: sql<string>`COALESCE(SUM(${trackEarnings.artistShare}), 0)`,
        thisMonthDownloads: sql<number>`COUNT(*)`,
      })
      .from(trackEarnings)
      .where(
        and(
          eq(trackEarnings.artistId, ctx.user.id),
          gte(trackEarnings.createdAt, startOfMonth)
        )
      );

    // Top earning track
    const topTrackResult = await db
      .select({
        trackId: trackEarnings.trackId,
        trackTitle: tracks.title,
        totalEarnings: sql<string>`SUM(${trackEarnings.artistShare})`,
        totalDownloads: sql<number>`COUNT(*)`,
      })
      .from(trackEarnings)
      .leftJoin(tracks, eq(trackEarnings.trackId, tracks.id))
      .where(eq(trackEarnings.artistId, ctx.user.id))
      .groupBy(trackEarnings.trackId, tracks.title)
      .orderBy(desc(sql`SUM(${trackEarnings.artistShare})`))
      .limit(1);

    // Pending payout (total earnings - paid earnings)
    const paidResult = await db
      .select({
        paidAmount: sql<string>`COALESCE(SUM(${artistPayouts.amount}), 0)`,
      })
      .from(artistPayouts)
      .where(
        and(
          eq(artistPayouts.artistId, ctx.user.id),
          eq(artistPayouts.status, "completed")
        )
      );

    const totalEarnings = parseFloat(totalResult[0]?.totalEarnings || "0");
    const paidAmount = parseFloat(paidResult[0]?.paidAmount || "0");
    const pendingPayout = (totalEarnings - paidAmount).toFixed(2);

    return {
      isPro: true,
      totalEarnings: totalResult[0]?.totalEarnings || "0.00",
      totalDownloads: totalResult[0]?.totalDownloads || 0,
      thisMonthEarnings: monthResult[0]?.thisMonthEarnings || "0.00",
      thisMonthDownloads: monthResult[0]?.thisMonthDownloads || 0,
      topTrack: topTrackResult[0] ? {
        trackId: topTrackResult[0].trackId,
        trackTitle: topTrackResult[0].trackTitle || "Unknown",
        totalEarnings: parseFloat(topTrackResult[0].totalEarnings || "0").toFixed(2),
        totalDownloads: topTrackResult[0].totalDownloads,
      } : null,
      pendingPayout,
    };
  }),
});
