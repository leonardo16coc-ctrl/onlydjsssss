import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

export const exploreChartsRouter = router({
  // Trending DJs (by followers + plays)
  getTrendingDJs: publicProcedure
    .input(z.object({ limit: z.number().default(12) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const result = await db.execute(sql`
        SELECT 
          u.id, u.username, u.name, u.djName, u.avatarUrl, u.profileImageUrl,
          u.isVerified, u.membershipStatus, u.country,
          (SELECT COUNT(*) FROM followers WHERE following_id = u.id) as followers_count,
          (SELECT COALESCE(SUM(playCount), 0) FROM tracks WHERE userId = u.id AND status = 'approved') as total_plays,
          (SELECT COUNT(*) FROM tracks WHERE userId = u.id AND status = 'approved') as track_count
        FROM users u
        WHERE u.username IS NOT NULL
          AND (SELECT COUNT(*) FROM tracks WHERE userId = u.id AND status = 'approved') > 0
        ORDER BY followers_count DESC, total_plays DESC
        LIMIT ${input.limit}
      `) as any[];

      return (result as any[])[0] || result;
    }),

  // New DJs (recently joined with tracks)
  getNewDJs: publicProcedure
    .input(z.object({ limit: z.number().default(12) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const result = await db.execute(sql`
        SELECT 
          u.id, u.username, u.name, u.djName, u.avatarUrl, u.profileImageUrl,
          u.isVerified, u.membershipStatus, u.country, u.createdAt,
          (SELECT COUNT(*) FROM followers WHERE following_id = u.id) as followers_count,
          (SELECT COUNT(*) FROM tracks WHERE userId = u.id AND status = 'approved') as track_count
        FROM users u
        WHERE u.username IS NOT NULL
          AND (SELECT COUNT(*) FROM tracks WHERE userId = u.id AND status = 'approved') > 0
        ORDER BY u.createdAt DESC
        LIMIT ${input.limit}
      `) as any[];

      return (result as any[])[0] || result;
    }),

  // Latest Edits
  getLatestEdits: publicProcedure
    .input(z.object({ limit: z.number().default(12) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const result = await db.execute(sql`
        SELECT 
          t.id, t.title, t.artist, t.coverImageUrl, t.audioFileUrl, t.previewFileUrl,
          t.genre, t.trackType, t.bpm, t.musicalKey, t.playCount, t.downloadCount,
          t.likeCount, t.createdAt, t.durationSeconds,
          u.username, u.djName, u.avatarUrl
        FROM tracks t
        JOIN users u ON u.id = t.userId
        WHERE t.status = 'approved' AND t.trackType = 'Edit'
        ORDER BY t.createdAt DESC
        LIMIT ${input.limit}
      `) as any[];

      return (result as any[])[0] || result;
    }),

  // Latest Remixes
  getLatestRemixes: publicProcedure
    .input(z.object({ limit: z.number().default(12) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const result = await db.execute(sql`
        SELECT 
          t.id, t.title, t.artist, t.coverImageUrl, t.audioFileUrl, t.previewFileUrl,
          t.genre, t.trackType, t.bpm, t.musicalKey, t.playCount, t.downloadCount,
          t.likeCount, t.createdAt, t.durationSeconds,
          u.username, u.djName, u.avatarUrl
        FROM tracks t
        JOIN users u ON u.id = t.userId
        WHERE t.status = 'approved' AND t.trackType = 'Remix'
        ORDER BY t.createdAt DESC
        LIMIT ${input.limit}
      `) as any[];

      return (result as any[])[0] || result;
    }),

  // Popular Tracks (by plays + likes)
  getPopularTracks: publicProcedure
    .input(z.object({ limit: z.number().default(12) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const result = await db.execute(sql`
        SELECT 
          t.id, t.title, t.artist, t.coverImageUrl, t.audioFileUrl, t.previewFileUrl,
          t.genre, t.trackType, t.bpm, t.musicalKey, t.playCount, t.downloadCount,
          t.likeCount, t.createdAt, t.durationSeconds,
          u.username, u.djName, u.avatarUrl
        FROM tracks t
        JOIN users u ON u.id = t.userId
        WHERE t.status = 'approved'
        ORDER BY (t.playCount + t.likeCount * 3) DESC
        LIMIT ${input.limit}
      `) as any[];

      return (result as any[])[0] || result;
    }),

  // Charts: Top DJs
  getTopDJs: publicProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const result = await db.execute(sql`
        SELECT 
          u.id, u.username, u.name, u.djName, u.avatarUrl, u.profileImageUrl,
          u.isVerified, u.membershipStatus, u.country,
          (SELECT COUNT(*) FROM followers WHERE following_id = u.id) as followers_count,
          (SELECT COALESCE(SUM(playCount), 0) FROM tracks WHERE userId = u.id AND status = 'approved') as total_plays,
          (SELECT COALESCE(SUM(downloadCount), 0) FROM tracks WHERE userId = u.id AND status = 'approved') as total_downloads,
          (SELECT COUNT(*) FROM tracks WHERE userId = u.id AND status = 'approved') as track_count
        FROM users u
        WHERE u.username IS NOT NULL
          AND (SELECT COUNT(*) FROM tracks WHERE userId = u.id AND status = 'approved') > 0
        ORDER BY followers_count DESC, total_plays DESC, total_downloads DESC
        LIMIT ${input.limit}
      `) as any[];

      return (result as any[])[0] || result;
    }),

  // Charts: Top Edits
  getTopEdits: publicProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const result = await db.execute(sql`
        SELECT 
          t.id, t.title, t.artist, t.coverImageUrl, t.audioFileUrl, t.previewFileUrl,
          t.genre, t.trackType, t.bpm, t.musicalKey, t.playCount, t.downloadCount,
          t.likeCount, t.createdAt, t.durationSeconds,
          u.username, u.djName, u.avatarUrl,
          (SELECT COUNT(*) FROM reposts WHERE track_id = t.id) as reposts_count
        FROM tracks t
        JOIN users u ON u.id = t.userId
        WHERE t.status = 'approved' AND t.trackType = 'Edit'
        ORDER BY (t.playCount + t.likeCount * 3 + t.downloadCount * 2) DESC
        LIMIT ${input.limit}
      `) as any[];

      return (result as any[])[0] || result;
    }),

  // Charts: Top Remixes
  getTopRemixes: publicProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const result = await db.execute(sql`
        SELECT 
          t.id, t.title, t.artist, t.coverImageUrl, t.audioFileUrl, t.previewFileUrl,
          t.genre, t.trackType, t.bpm, t.musicalKey, t.playCount, t.downloadCount,
          t.likeCount, t.createdAt, t.durationSeconds,
          u.username, u.djName, u.avatarUrl,
          (SELECT COUNT(*) FROM reposts WHERE track_id = t.id) as reposts_count
        FROM tracks t
        JOIN users u ON u.id = t.userId
        WHERE t.status = 'approved' AND t.trackType = 'Remix'
        ORDER BY (t.playCount + t.likeCount * 3 + t.downloadCount * 2) DESC
        LIMIT ${input.limit}
      `) as any[];

      return (result as any[])[0] || result;
    }),

  // Charts: Trending Tracks (recent activity)
  getTrendingTracks: publicProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const result = await db.execute(sql`
        SELECT 
          t.id, t.title, t.artist, t.coverImageUrl, t.audioFileUrl, t.previewFileUrl,
          t.genre, t.trackType, t.bpm, t.musicalKey, t.playCount, t.downloadCount,
          t.likeCount, t.createdAt, t.durationSeconds,
          u.username, u.djName, u.avatarUrl,
          (SELECT COUNT(*) FROM reposts WHERE track_id = t.id) as reposts_count
        FROM tracks t
        JOIN users u ON u.id = t.userId
        WHERE t.status = 'approved'
          AND t.createdAt > DATE_SUB(NOW(), INTERVAL 30 DAY)
        ORDER BY (t.playCount + t.likeCount * 3 + t.downloadCount * 2) DESC
        LIMIT ${input.limit}
      `) as any[];

      return (result as any[])[0] || result;
    }),
});
