import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { tracks, downloads, users, trackEarnings } from "../../drizzle/schema";
import { eq, and, gte, sql, desc } from "drizzle-orm";
import { storageGet } from "../storage";
import { checkDownloadProtection, generateDownloadToken, logSuspiciousActivity } from "../antiHotlink";

/**
 * Downloads Router - Professional download system with tracking and limits
 * 
 * Features:
 * - Download tracking for monetization
 * - Membership-based limits (Free: 5/month, Pro: 50/month, Studio: unlimited)
 * - Signed URLs with expiration
 * - Anti-fraud protection
 * - Download history
 * - Format selection (MP3/WAV)
 */

// Download limits by membership level
const DOWNLOAD_LIMITS = {
  free: 1, // 1 download per month for FREE users
  member: -1, // Unlimited for PRO users ($4.99/mes)
};

// Rate limiting: max downloads per 24h from same IP
const MAX_DOWNLOADS_PER_IP_24H = 100;

/**
 * Get user's download count for current month
 */
async function getUserMonthlyDownloadCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(downloads)
    .where(
      and(
        eq(downloads.userId, userId),
        gte(downloads.downloadedAt, startOfMonth)
      )
    );

  return result[0]?.count || 0;
}

/**
 * Check if user has reached download limit
 */
async function checkDownloadLimit(userId: number, membershipStatus: string): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const limit = DOWNLOAD_LIMITS[membershipStatus as keyof typeof DOWNLOAD_LIMITS] || DOWNLOAD_LIMITS.free;
  
  // Unlimited for verified users
  if (limit === -1) {
    return { allowed: true, remaining: -1, limit: -1 };
  }

  const currentCount = await getUserMonthlyDownloadCount(userId);
  const remaining = Math.max(0, limit - currentCount);
  const allowed = currentCount < limit;

  return { allowed, remaining, limit };
}

/**
 * Check IP rate limit
 */
async function checkIPRateLimit(ipAddress: string): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(downloads)
    .where(
      and(
        eq(downloads.ipAddress, ipAddress),
        gte(downloads.downloadedAt, sql`DATE_SUB(NOW(), INTERVAL 24 HOUR)`)
      )
    );

  const count = result[0]?.count || 0;
  return count < MAX_DOWNLOADS_PER_IP_24H;
}

export const downloadsRouter = router({
  /**
   * Download a track with format selection
   */
  downloadTrack: protectedProcedure
    .input(z.object({
      trackId: z.number().int(),
      format: z.enum(["mp3", "wav"]).default("mp3"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      // Get track info
      const trackResult = await db.select().from(tracks).where(eq(tracks.id, input.trackId)).limit(1);
      if (trackResult.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Track no encontrado" });
      }
      const track = trackResult[0];

      // Check download limit
      const limitCheck = await checkDownloadLimit(ctx.user.id, ctx.user.membershipStatus || "free");
      if (!limitCheck.allowed) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Has alcanzado tu límite de descargas mensuales (${limitCheck.limit}). Actualiza tu membresía para descargar más tracks.`,
        });
      }

      // Check IP rate limit (anti-fraud)
      const ipAddress = (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || 
                        ctx.req.socket.remoteAddress || 
                        "unknown";
      
      const ipAllowed = await checkIPRateLimit(ipAddress);
      if (!ipAllowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Demasiadas descargas desde tu ubicación. Por favor intenta más tarde.",
        });
      }

      // Get user agent and device info
      const userAgent = ctx.req.headers["user-agent"] || "unknown";
      const device = userAgent.includes("Mobile") ? "mobile" : "desktop";

      // Record download for monetization
      await db.insert(downloads).values({
        userId: ctx.user.id,
        trackId: input.trackId,
        artistId: track.userId,
        ipAddress,
        country: "unknown", // TODO: Add GeoIP lookup
        device,
        userAgent,
        isSuspicious: false,
      });

      // Get the download ID we just created
      const downloadRecords = await db
        .select()
        .from(downloads)
        .where(
          and(
            eq(downloads.userId, ctx.user.id),
            eq(downloads.trackId, input.trackId)
          )
        )
        .orderBy(desc(downloads.downloadedAt))
        .limit(1);
      
      const downloadId = downloadRecords[0]?.id || 0;

      // Get artist info to check if PRO
      const artistResult = await db.select().from(users).where(eq(users.id, track.userId)).limit(1);
      const artist = artistResult[0];

      // Create earning record if artist is PRO (member)
      if (artist && artist.membershipStatus === "member") {
        await db.insert(trackEarnings).values({
          trackId: input.trackId,
          artistId: track.userId,
          downloadId,
          downloaderId: ctx.user.id,
          revenuePerDownload: "0.50", // $0.50 per download
          artistShare: "0.30", // 60% = $0.30
          platformShare: "0.20", // 40% = $0.20
        });
      }

      // Increment track download count
      await db
        .update(tracks)
        .set({ downloadCount: sql`${tracks.downloadCount} + 1` })
        .where(eq(tracks.id, input.trackId));

      // Increment user total downloads
      await db
        .update(users)
        .set({ totalDownloads: sql`${users.totalDownloads} + 1` })
        .where(eq(users.id, ctx.user.id));

      // Generate signed URL (URLs from storage are already accessible)
      const fileKey = track.audioFileKey;
      const signedUrl = await storageGet(fileKey);

      // Generate anti-leech token (expires in 5 minutes)
      const downloadToken = generateDownloadToken({
        userId: ctx.user.id,
        trackId: input.trackId,
        ipAddress,
      });

      // Determine filename
      const extension = input.format;
      const filename = `${track.artist} - ${track.title}.${extension}`;

      return {
        success: true,
        downloadUrl: signedUrl.url,
        downloadToken, // Anti-leech token (expires in 5 min)
        filename,
        format: input.format.toUpperCase(),
        remaining: limitCheck.remaining === -1 ? "ilimitado" : limitCheck.remaining.toString(),
      };
    }),

  /**
   * Get download limits for current user
   */
  getDownloadLimits: protectedProcedure.query(async ({ ctx }) => {
    const membershipStatus = ctx.user.membershipStatus || "free";
    const limitCheck = await checkDownloadLimit(ctx.user.id, membershipStatus);

    return {
      membershipStatus,
      limit: limitCheck.limit,
      used: limitCheck.limit === -1 ? 0 : limitCheck.limit - limitCheck.remaining,
      remaining: limitCheck.remaining,
      unlimited: limitCheck.limit === -1,
    };
  }),

  /**
   * Get download history for current user
   */
  getMyDownloadHistory: protectedProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(100).default(20),
      offset: z.number().int().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const results = await db
        .select({
          id: downloads.id,
          trackId: downloads.trackId,
          downloadedAt: downloads.downloadedAt,
          trackTitle: tracks.title,
          trackArtist: tracks.artist,
          trackCoverUrl: tracks.coverImageUrl,
          trackBpm: tracks.bpm,
          trackKey: tracks.musicalKey,
          trackGenre: tracks.genre,
        })
        .from(downloads)
        .innerJoin(tracks, eq(downloads.trackId, tracks.id))
        .where(eq(downloads.userId, ctx.user.id))
        .orderBy(desc(downloads.downloadedAt))
        .limit(input.limit)
        .offset(input.offset);

      // Get total count
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(downloads)
        .where(eq(downloads.userId, ctx.user.id));

      const total = countResult[0]?.count || 0;

      return {
        downloads: results,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  /**
   * Get download statistics for current user
   */
  getMyDownloadStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

    // Total downloads
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(downloads)
      .where(eq(downloads.userId, ctx.user.id));
    const totalDownloads = totalResult[0]?.count || 0;

    // This month downloads
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(downloads)
      .where(
        and(
          eq(downloads.userId, ctx.user.id),
          gte(downloads.downloadedAt, startOfMonth)
        )
      );
    const thisMonthDownloads = monthResult[0]?.count || 0;

    // Top genres downloaded
    const genresResult = await db
      .select({
        genre: tracks.genre,
        count: sql<number>`count(*)`,
      })
      .from(downloads)
      .innerJoin(tracks, eq(downloads.trackId, tracks.id))
      .where(eq(downloads.userId, ctx.user.id))
      .groupBy(tracks.genre)
      .orderBy(desc(sql`count(*)`))
      .limit(5);

    return {
      totalDownloads,
      thisMonthDownloads,
      topGenres: genresResult,
    };
  }),
});
