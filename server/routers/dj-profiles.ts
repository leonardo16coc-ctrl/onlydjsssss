import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

export const djProfilesRouter = router({
  // Get public DJ profile by username
  getByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.execute(sql`
        SELECT 
          u.id, u.username, u.name, u.djName, u.bio, u.avatarUrl, u.profileImageUrl,
          u.socialLinks, u.country, u.isVerified, u.membershipStatus, u.createdAt,
          u.totalDownloads, u.totalUploads,
          (SELECT COUNT(*) FROM dj_followers WHERE followingId = u.id) as followers_count,
          (SELECT COUNT(*) FROM dj_followers WHERE followerId = u.id) as following_count,
          (SELECT COUNT(*) FROM tracks WHERE userId = u.id AND status = 'approved') as track_count,
          (SELECT COALESCE(SUM(playCount), 0) FROM tracks WHERE userId = u.id) as total_plays
        FROM users u
        WHERE u.username = ${input.username}
        LIMIT 1
      `);
      const rows = result as any[];
      const profile = Array.isArray(rows[0]) ? rows[0][0] : rows[0];
      if (!profile) return null;
      return profile;
    }),

  // Get tracks by username and optional type filter
  getTracksByUsername: publicProcedure
    .input(z.object({
      username: z.string(),
      type: z.enum(["all", "edit", "remix", "track", "mashup"]).default("all"),
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const offset = (input.page - 1) * input.limit;

      // Get user id first
      const userRes = await db.execute(sql`
        SELECT id FROM users WHERE username = ${input.username} LIMIT 1
      `);
      const userRows = userRes as any[];
      const userRow = Array.isArray(userRows[0]) ? userRows[0][0] : userRows[0];
      if (!userRow) return { tracks: [], total: 0 };
      const userId = userRow.id;

      let typeFilter = sql``;
      if (input.type !== "all") {
        // Map type to trackType values
        const typeMap: Record<string, string[]> = {
          edit: ["Edit"],
          remix: ["Remix"],
          track: ["Extended Mix", "Rework"],
          mashup: ["Mashup"],
        };
        const types = typeMap[input.type] || [];
        if (types.length > 0) {
          typeFilter = sql` AND t.trackType IN (${sql.join(types.map(t => sql`${t}`), sql`, `)})`;
        }
      }

      const tracksResult = await db.execute(sql`
        SELECT 
          t.id, t.title, t.artist, t.coverImageUrl, t.audioFileUrl, t.previewFileUrl,
          t.genre, t.trackType, t.bpm, t.musicalKey, t.playCount, t.downloadCount,
          t.likeCount, t.createdAt, t.durationSeconds,
          (SELECT COUNT(*) FROM likes WHERE trackId = t.id) as likes_count,
          (SELECT COUNT(*) FROM track_reposts WHERE trackId = t.id) as reposts_count
        FROM tracks t
        WHERE t.userId = ${userId} AND t.status = 'approved'
        ${typeFilter}
        ORDER BY t.createdAt DESC
        LIMIT ${input.limit} OFFSET ${offset}
      `) as any[];

      const [countResult] = await db.execute(sql`
        SELECT COUNT(*) as total FROM tracks t
        WHERE t.userId = ${userId} AND t.status = 'approved'
        ${typeFilter}
      `) as any[];

      const tracksRows = tracksResult as any[];
      const countRows = countResult as any[];
      return {
        tracks: Array.isArray(tracksRows[0]) ? tracksRows[0] : tracksRows,
        total: (Array.isArray(countRows[0]) ? countRows[0][0] : countRows[0])?.total || 0,
      };
    }),

  // Follow a DJ
  follow: protectedProcedure
    .input(z.object({ targetUserId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      if (ctx.user.id === input.targetUserId) {
        throw new Error("Cannot follow yourself");
      }

      // Check if already following
      const checkRes = await db.execute(sql`
        SELECT id FROM dj_followers 
        WHERE followerId = ${ctx.user.id} AND followingId = ${input.targetUserId}
        LIMIT 1
      `);
      const checkRows = checkRes as any[];
      const existingRow = Array.isArray(checkRows[0]) ? checkRows[0][0] : checkRows[0];
      if (existingRow) {
        return { following: true, message: "Already following" };
      }
      await db.execute(sql`
        INSERT INTO dj_followers (followerId, followingId, createdAt)
        VALUES (${ctx.user.id}, ${input.targetUserId}, NOW())
      `);
      return { following: true };
    }),

  // Unfollow a DJ
  unfollow: protectedProcedure
    .input(z.object({ targetUserId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.execute(sql`
        DELETE FROM dj_followers 
        WHERE followerId = ${ctx.user.id} AND followingId = ${input.targetUserId}
      `);
      return { following: false };
    }),

  // Check if current user follows a DJ
  isFollowing: protectedProcedure
    .input(z.object({ targetUserId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { following: false };

      const result = await db.execute(sql`
        SELECT id FROM dj_followers 
        WHERE followerId = ${ctx.user.id} AND followingId = ${input.targetUserId}
        LIMIT 1
      `);
      const rows = result as any[];
      const row = Array.isArray(rows[0]) ? rows[0][0] : rows[0];
      return { following: !!row };
    }),

  // Like a track
  likeTrack: protectedProcedure
    .input(z.object({ trackId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const likeCheck = await db.execute(sql`
        SELECT id FROM likes WHERE userId = ${ctx.user.id} AND trackId = ${input.trackId} LIMIT 1
      `);
      const likeRows = likeCheck as any[];
      const existingLike = Array.isArray(likeRows[0]) ? likeRows[0][0] : likeRows[0];
      if (existingLike) {
        await db.execute(sql`DELETE FROM likes WHERE userId = ${ctx.user.id} AND trackId = ${input.trackId}`);
        await db.execute(sql`UPDATE tracks SET likeCount = GREATEST(likeCount - 1, 0) WHERE id = ${input.trackId}`);
        return { liked: false };
      }
      await db.execute(sql`INSERT INTO likes (userId, trackId, likedAt) VALUES (${ctx.user.id}, ${input.trackId}, NOW())`);
      await db.execute(sql`UPDATE tracks SET likeCount = likeCount + 1 WHERE id = ${input.trackId}`);
      return { liked: true };
    }),

  // Repost a track
  repostTrack: protectedProcedure
    .input(z.object({ trackId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const repostCheck = await db.execute(sql`
        SELECT id FROM track_reposts WHERE userId = ${ctx.user.id} AND trackId = ${input.trackId} LIMIT 1
      `);
      const repostRows = repostCheck as any[];
      const existingRepost = Array.isArray(repostRows[0]) ? repostRows[0][0] : repostRows[0];
      if (existingRepost) {
        await db.execute(sql`DELETE FROM track_reposts WHERE userId = ${ctx.user.id} AND trackId = ${input.trackId}`);
        return { reposted: false };
      }
      await db.execute(sql`INSERT INTO track_reposts (userId, trackId, createdAt) VALUES (${ctx.user.id}, ${input.trackId}, NOW())`);
      return { reposted: true };
    }),

  // Check if user liked/reposted a track
  getTrackInteractions: protectedProcedure
    .input(z.object({ trackId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { liked: false, reposted: false };
      const likeRes = await db.execute(sql`SELECT id FROM likes WHERE userId = ${ctx.user.id} AND trackId = ${input.trackId} LIMIT 1`);
      const repostRes = await db.execute(sql`SELECT id FROM track_reposts WHERE userId = ${ctx.user.id} AND trackId = ${input.trackId} LIMIT 1`);
      const likeRows = likeRes as any[];
      const repostRows = repostRes as any[];
      return {
        liked: !!(Array.isArray(likeRows[0]) ? likeRows[0][0] : likeRows[0]),
        reposted: !!(Array.isArray(repostRows[0]) ? repostRows[0][0] : repostRows[0]),
      };
    }),

  // Get followers list for a user
  getFollowers: publicProcedure
    .input(z.object({ userId: z.number(), page: z.number().default(1), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { followers: [], total: 0 };

      const offset = (input.page - 1) * input.limit;

      const result = await db.execute(sql`
        SELECT u.id, u.username, u.name, u.djName, u.avatarUrl, u.profileImageUrl, u.isVerified,
               f.createdAt as followed_at
        FROM dj_followers f
        JOIN users u ON u.id = f.followerId
        WHERE f.followingId = ${input.userId}
        ORDER BY f.createdAt DESC
        LIMIT ${input.limit} OFFSET ${offset}
      `);
      const countResult = await db.execute(sql`
        SELECT COUNT(*) as total FROM dj_followers WHERE followingId = ${input.userId}
      `);
      const fRows = result as any[];
      const cRows = countResult as any[];
      return {
        followers: Array.isArray(fRows[0]) ? fRows[0] : fRows,
        total: (Array.isArray(cRows[0]) ? cRows[0][0] : cRows[0])?.total || 0,
      };
    }),

  // Update own profile
  updateProfile: protectedProcedure
    .input(z.object({
      username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/).optional(),
      djName: z.string().max(100).optional(),
      bio: z.string().max(500).optional(),
      website: z.string().url().optional().or(z.literal("")),
      socialLinks: z.object({
        instagram: z.string().optional(),
        twitter: z.string().optional(),
        soundcloud: z.string().optional(),
        youtube: z.string().optional(),
        facebook: z.string().optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check username uniqueness if provided
      if (input.username) {
        const [existing] = await db.execute(sql`
          SELECT id FROM users WHERE username = ${input.username} AND id != ${ctx.user.id} LIMIT 1
        `) as any[];
        if ((existing as any[])[0]) {
          throw new Error("Username already taken");
        }
      }

      const socialLinksJson = input.socialLinks ? JSON.stringify(input.socialLinks) : undefined;

      await db.execute(sql`
        UPDATE users SET
          ${input.username !== undefined ? sql`username = ${input.username},` : sql``}
          ${input.djName !== undefined ? sql`djName = ${input.djName},` : sql``}
          ${input.bio !== undefined ? sql`bio = ${input.bio},` : sql``}
          ${socialLinksJson !== undefined ? sql`socialLinks = ${socialLinksJson},` : sql``}
          updatedAt = NOW()
        WHERE id = ${ctx.user.id}
      `);

      return { success: true };
    }),

  // Get own profile for dashboard
  getMyProfile: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.execute(sql`
        SELECT 
          u.id, u.username, u.name, u.djName, u.bio, u.avatarUrl, u.profileImageUrl,
          u.socialLinks, u.country, u.isVerified, u.membershipStatus, u.createdAt,
          u.totalDownloads, u.totalUploads,
          (SELECT COUNT(*) FROM dj_followers WHERE followingId = u.id) as followers_count,
          (SELECT COUNT(*) FROM dj_followers WHERE followerId = u.id) as following_count,
          (SELECT COUNT(*) FROM tracks WHERE userId = u.id AND status = 'approved') as track_count,
          (SELECT COALESCE(SUM(playCount), 0) FROM tracks WHERE userId = u.id) as total_plays,
          (SELECT COALESCE(SUM(likeCount), 0) FROM tracks WHERE userId = u.id) as total_likes
        FROM users u
        WHERE u.id = ${ctx.user.id}
        LIMIT 1
      `);
      const rows = result as any[];
      return Array.isArray(rows[0]) ? rows[0][0] : rows[0] || null;
    }),

  // Get dashboard stats
  getDashboardStats: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const statsResult = await db.execute(sql`
        SELECT
          (SELECT COUNT(*) FROM tracks WHERE userId = ${ctx.user.id} AND status = 'approved') as total_tracks,
          (SELECT COUNT(*) FROM tracks WHERE userId = ${ctx.user.id} AND status = 'approved' AND trackType = 'Edit') as total_edits,
          (SELECT COUNT(*) FROM tracks WHERE userId = ${ctx.user.id} AND status = 'approved' AND trackType = 'Remix') as total_remixes,
          (SELECT COALESCE(SUM(playCount), 0) FROM tracks WHERE userId = ${ctx.user.id}) as total_plays,
          (SELECT COALESCE(SUM(downloadCount), 0) FROM tracks WHERE userId = ${ctx.user.id}) as total_downloads,
          (SELECT COALESCE(SUM(likeCount), 0) FROM tracks WHERE userId = ${ctx.user.id}) as total_likes,
          (SELECT COUNT(*) FROM dj_followers WHERE followingId = ${ctx.user.id}) as followers_count,
          (SELECT COUNT(*) FROM track_reposts r JOIN tracks t ON t.id = r.trackId WHERE t.userId = ${ctx.user.id}) as total_reposts
      `);
      const statsRows = statsResult as any[];
      return Array.isArray(statsRows[0]) ? statsRows[0][0] : statsRows[0] || {};
    }),
  // Get featured DJs for explore page
  getFeaturedDJs: publicProcedure
    .input(z.object({
      limit: z.number().default(12),
      sortBy: z.enum(["followers", "tracks", "plays", "recent"]).default("followers"),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { djs: [] };
      let orderClause = sql`followers_count DESC`;
      if (input.sortBy === "tracks") orderClause = sql`track_count DESC`;
      else if (input.sortBy === "plays") orderClause = sql`total_plays DESC`;
      else if (input.sortBy === "recent") orderClause = sql`u.createdAt DESC`;
      const result = await db.execute(sql`
        SELECT 
          u.id, u.username, u.name, u.djName, u.bio, u.avatarUrl, u.profileImageUrl,
          u.country, u.isVerified, u.membershipStatus,
          (SELECT COUNT(*) FROM dj_followers WHERE followingId = u.id) as followers_count,
          (SELECT COUNT(*) FROM tracks WHERE userId = u.id AND status = 'approved') as track_count,
          (SELECT COALESCE(SUM(playCount), 0) FROM tracks WHERE userId = u.id) as total_plays
        FROM users u
        WHERE u.totalUploads > 0
        ORDER BY ${orderClause}
        LIMIT ${input.limit}
      `);
      const rows = result as any[];
      return { djs: Array.isArray(rows[0]) ? rows[0] : rows };
    }),

  // Get trending tracks for explore/charts
  getTrendingTracks: publicProcedure
    .input(z.object({
      limit: z.number().default(20),
      type: z.enum(["all", "edit", "remix", "track", "mashup"]).default("all"),
      genre: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { tracks: [] };
      let typeFilter = sql``;
      if (input.type === "edit") typeFilter = sql`AND t.trackType = 'Edit'`;
      else if (input.type === "remix") typeFilter = sql`AND t.trackType = 'Remix'`;
      else if (input.type === "track") typeFilter = sql`AND t.trackType IN ('Extended Mix', 'Rework')`;
      let genreFilter = sql``;
      if (input.genre) genreFilter = sql`AND t.genre = ${input.genre}`;
      const result = await db.execute(sql`
        SELECT 
          t.id, t.title, t.artist, t.genre, t.trackType, t.bpm, t.musicalKey,
          t.coverImageUrl, t.audioFileUrl, t.durationSeconds, t.createdAt,
          t.downloadCount, t.playCount, t.likeCount,
          u.username, u.djName, u.name, u.avatarUrl, u.profileImageUrl, u.isVerified
        FROM tracks t
        JOIN users u ON u.id = t.userId
        WHERE t.status = 'approved'
        ${typeFilter}
        ${genreFilter}
        ORDER BY (t.playCount * 2 + t.likeCount * 3 + t.downloadCount) DESC, t.createdAt DESC
        LIMIT ${input.limit}
      `);
      const rows = result as any[];
      return { tracks: Array.isArray(rows[0]) ? rows[0] : rows };
    }),

  // Get track counts per type for a username (for tab badges)
  getTrackCountsByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userRes = await db.execute(sql`
        SELECT id FROM users WHERE username = ${input.username} LIMIT 1
      `);
      const userRows = userRes as any[];
      const user = Array.isArray(userRows[0]) ? userRows[0][0] : userRows[0];
      if (!user) return { all: 0, track: 0, edit: 0, remix: 0, mashup: 0 };
      const userId = user.id;

      const result = await db.execute(sql`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN trackType IN ('Extended Mix', 'Rework') THEN 1 ELSE 0 END) as tracks,
          SUM(CASE WHEN trackType = 'Edit' THEN 1 ELSE 0 END) as edits,
          SUM(CASE WHEN trackType = 'Remix' THEN 1 ELSE 0 END) as remixes,
          SUM(CASE WHEN trackType = 'Mashup' THEN 1 ELSE 0 END) as mashups
        FROM tracks
        WHERE userId = ${userId} AND status = 'approved'
      `);
      const rows = result as any[];
      const row = Array.isArray(rows[0]) ? rows[0][0] : rows[0];
      return {
        all: Number(row?.total || 0),
        track: Number(row?.tracks || 0),
        edit: Number(row?.edits || 0),
        remix: Number(row?.remixes || 0),
        mashup: Number(row?.mashups || 0),
      };
    }),

  /**
   * Record a stream/play for a track.
   * Increments streamCount and playCount atomically.
   * Public so any visitor (logged in or not) can trigger it.
   * Server-side debounce: same visitor + same track within 30 s is ignored.
   */
  recordStream: publicProcedure
    .input(z.object({ trackId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      // Build a debounce key from userId (if logged in) or IP
      const req = (ctx as any).req;
      const ip: string =
        req?.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req?.socket?.remoteAddress ||
        "unknown";
      const userId: number | null = (ctx as any).user?.id ?? null;
      const debounceKey = `${userId ?? ip}:${input.trackId}`;

      if (recentStreams.has(debounceKey)) {
        return { success: false, reason: "debounced" };
      }
      // Block the same visitor from counting again for 30 seconds
      recentStreams.set(debounceKey, Date.now());
      setTimeout(() => recentStreams.delete(debounceKey), 30_000);

      await db.execute(sql`
        UPDATE tracks
        SET streamCount = streamCount + 1,
            playCount   = playCount   + 1
        WHERE id = ${input.trackId}
      `);

      return { success: true };
    }),
});

// In-memory debounce store — resets on server restart, sufficient for rate-limiting
const recentStreams = new Map<string, number>();
