import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

export const socialRouter = router({
  // ── FEED ──────────────────────────────────────────────────────────────────

  getFeed: publicProcedure
    .input(z.object({ page: z.number().default(1), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const offset = (input.page - 1) * input.limit;
      const result = await db.execute(sql`
        SELECT
          p.id, p.content, p.mediaUrl, p.mediaType, p.hashtags, p.postType,
          p.likeCount, p.repostCount, p.commentCount, p.saveCount, p.createdAt,
          u.id as userId, u.username, u.name, u.djName, u.avatarUrl, u.profileImageUrl, u.isVerified
        FROM social_posts p
        JOIN users u ON u.id = p.userId
        ORDER BY p.createdAt DESC
        LIMIT ${input.limit} OFFSET ${offset}
      `);
      const rows = result as any[];
      return { posts: Array.isArray(rows[0]) ? rows[0] : rows };
    }),

  createPost: protectedProcedure
    .input(z.object({
      content: z.string().min(1).max(500),
      mediaUrl: z.string().optional(),
      mediaType: z.enum(["image", "video", "audio", "none"]).default("none"),
      hashtags: z.string().optional(),
      postType: z.enum(["text", "music_preview", "announcement", "track_release", "event"]).default("text"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const now = Date.now();
      await db.execute(sql`
        INSERT INTO social_posts (userId, content, mediaUrl, mediaType, hashtags, postType, createdAt, updatedAt)
        VALUES (${ctx.user.id}, ${input.content}, ${input.mediaUrl || null}, ${input.mediaType},
                ${input.hashtags || null}, ${input.postType}, ${now}, ${now})
      `);
      return { success: true };
    }),

  deletePost: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.execute(sql`
        DELETE FROM social_posts WHERE id = ${input.postId} AND userId = ${ctx.user.id}
      `);
      return { success: true };
    }),

  likePost: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const now = Date.now();
      // Check if already liked
      const existing = await db.execute(sql`
        SELECT id FROM social_post_likes WHERE postId = ${input.postId} AND userId = ${ctx.user.id}
      `);
      const rows = existing as any[];
      const row = Array.isArray(rows[0]) ? rows[0][0] : rows[0];
      if (row) {
        await db.execute(sql`DELETE FROM social_post_likes WHERE postId = ${input.postId} AND userId = ${ctx.user.id}`);
        await db.execute(sql`UPDATE social_posts SET likeCount = GREATEST(0, likeCount - 1) WHERE id = ${input.postId}`);
        return { liked: false };
      } else {
        await db.execute(sql`INSERT INTO social_post_likes (postId, userId, createdAt) VALUES (${input.postId}, ${ctx.user.id}, ${now})`);
        await db.execute(sql`UPDATE social_posts SET likeCount = likeCount + 1 WHERE id = ${input.postId}`);
        return { liked: true };
      }
    }),

  repostPost: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const now = Date.now();
      const existing = await db.execute(sql`
        SELECT id FROM social_post_reposts WHERE postId = ${input.postId} AND userId = ${ctx.user.id}
      `);
      const rows = existing as any[];
      const row = Array.isArray(rows[0]) ? rows[0][0] : rows[0];
      if (row) {
        await db.execute(sql`DELETE FROM social_post_reposts WHERE postId = ${input.postId} AND userId = ${ctx.user.id}`);
        await db.execute(sql`UPDATE social_posts SET repostCount = GREATEST(0, repostCount - 1) WHERE id = ${input.postId}`);
        return { reposted: false };
      } else {
        await db.execute(sql`INSERT INTO social_post_reposts (postId, userId, createdAt) VALUES (${input.postId}, ${ctx.user.id}, ${now})`);
        await db.execute(sql`UPDATE social_posts SET repostCount = repostCount + 1 WHERE id = ${input.postId}`);
        return { reposted: true };
      }
    }),

  savePost: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const now = Date.now();
      const existing = await db.execute(sql`
        SELECT id FROM social_post_saves WHERE postId = ${input.postId} AND userId = ${ctx.user.id}
      `);
      const rows = existing as any[];
      const row = Array.isArray(rows[0]) ? rows[0][0] : rows[0];
      if (row) {
        await db.execute(sql`DELETE FROM social_post_saves WHERE postId = ${input.postId} AND userId = ${ctx.user.id}`);
        await db.execute(sql`UPDATE social_posts SET saveCount = GREATEST(0, saveCount - 1) WHERE id = ${input.postId}`);
        return { saved: false };
      } else {
        await db.execute(sql`INSERT INTO social_post_saves (postId, userId, createdAt) VALUES (${input.postId}, ${ctx.user.id}, ${now})`);
        await db.execute(sql`UPDATE social_posts SET saveCount = saveCount + 1 WHERE id = ${input.postId}`);
        return { saved: true };
      }
    }),

  addComment: protectedProcedure
    .input(z.object({ postId: z.number(), content: z.string().min(1).max(300) }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const now = Date.now();
      await db.execute(sql`
        INSERT INTO social_comments (postId, userId, content, createdAt)
        VALUES (${input.postId}, ${ctx.user.id}, ${input.content}, ${now})
      `);
      await db.execute(sql`UPDATE social_posts SET commentCount = commentCount + 1 WHERE id = ${input.postId}`);
      return { success: true };
    }),

  getComments: publicProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.execute(sql`
        SELECT c.id, c.content, c.createdAt,
               u.id as userId, u.username, u.djName, u.name, u.avatarUrl, u.profileImageUrl, u.isVerified
        FROM social_comments c
        JOIN users u ON u.id = c.userId
        WHERE c.postId = ${input.postId}
        ORDER BY c.createdAt ASC
        LIMIT 50
      `);
      const rows = result as any[];
      return { comments: Array.isArray(rows[0]) ? rows[0] : rows };
    }),

  getPostInteractions: protectedProcedure
    .input(z.object({ postIds: z.array(z.number()) }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { likes: [], reposts: [], saves: [] };
      if (input.postIds.length === 0) return { likes: [], reposts: [], saves: [] };
      const ids = input.postIds.join(",");
      const [likes, reposts, saves] = await Promise.all([
        db.execute(sql`SELECT postId FROM social_post_likes WHERE userId = ${ctx.user.id} AND postId IN (${sql.raw(ids)})`),
        db.execute(sql`SELECT postId FROM social_post_reposts WHERE userId = ${ctx.user.id} AND postId IN (${sql.raw(ids)})`),
        db.execute(sql`SELECT postId FROM social_post_saves WHERE userId = ${ctx.user.id} AND postId IN (${sql.raw(ids)})`),
      ]);
      const toArr = (r: any) => (Array.isArray(r[0]) ? r[0] : r).map((x: any) => Number(x.postId));
      return { likes: toArr(likes), reposts: toArr(reposts), saves: toArr(saves) };
    }),

  // ── DROP RADAR ────────────────────────────────────────────────────────────

  getDrops: publicProcedure
    .input(z.object({ trending: z.boolean().default(false), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const orderBy = input.trending ? sql`ORDER BY d.fireCount DESC` : sql`ORDER BY d.createdAt DESC`;
      const result = await db.execute(sql`
        SELECT d.id, d.title, d.artist, d.previewUrl, d.coverUrl, d.genre,
               d.description, d.fireCount, d.isTrending, d.createdAt,
               u.id as userId, u.username, u.djName, u.name, u.avatarUrl, u.profileImageUrl, u.isVerified
        FROM drop_radar d
        JOIN users u ON u.id = d.userId
        ${orderBy}
        LIMIT ${input.limit}
      `);
      const rows = result as any[];
      return { drops: Array.isArray(rows[0]) ? rows[0] : rows };
    }),

  createDrop: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(255),
      artist: z.string().min(1).max(255),
      previewUrl: z.string().url(),
      coverUrl: z.string().optional(),
      genre: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const now = Date.now();
      await db.execute(sql`
        INSERT INTO drop_radar (userId, title, artist, previewUrl, coverUrl, genre, description, createdAt)
        VALUES (${ctx.user.id}, ${input.title}, ${input.artist}, ${input.previewUrl},
                ${input.coverUrl || null}, ${input.genre || null}, ${input.description || null}, ${now})
      `);
      return { success: true };
    }),

  voteDrop: protectedProcedure
    .input(z.object({ dropId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const now = Date.now();
      const existing = await db.execute(sql`
        SELECT id FROM drop_votes WHERE dropId = ${input.dropId} AND userId = ${ctx.user.id}
      `);
      const rows = existing as any[];
      const row = Array.isArray(rows[0]) ? rows[0][0] : rows[0];
      if (row) {
        await db.execute(sql`DELETE FROM drop_votes WHERE dropId = ${input.dropId} AND userId = ${ctx.user.id}`);
        await db.execute(sql`UPDATE drop_radar SET fireCount = GREATEST(0, fireCount - 1) WHERE id = ${input.dropId}`);
        return { voted: false };
      } else {
        await db.execute(sql`INSERT INTO drop_votes (dropId, userId, createdAt) VALUES (${input.dropId}, ${ctx.user.id}, ${now})`);
        await db.execute(sql`UPDATE drop_radar SET fireCount = fireCount + 1 WHERE id = ${input.dropId}`);
        // Mark as trending if >= 10 fires
        await db.execute(sql`UPDATE drop_radar SET isTrending = 1 WHERE id = ${input.dropId} AND fireCount >= 10`);
        return { voted: true };
      }
    }),

  getUserDropVotes: protectedProcedure
    .input(z.object({ dropIds: z.array(z.number()) }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { voted: [] };
      if (input.dropIds.length === 0) return { voted: [] };
      const ids = input.dropIds.join(",");
      const result = await db.execute(sql`
        SELECT dropId FROM drop_votes WHERE userId = ${ctx.user.id} AND dropId IN (${sql.raw(ids)})
      `);
      const rows = result as any[];
      return { voted: (Array.isArray(rows[0]) ? rows[0] : rows).map((x: any) => Number(x.dropId)) };
    }),

  // ── DJ BATTLES ────────────────────────────────────────────────────────────

  getBattles: publicProcedure
    .input(z.object({ status: z.enum(["active", "ended", "all"]).default("active") }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const statusFilter = input.status === "all" ? sql`` : sql`WHERE b.status = ${input.status}`;
      const result = await db.execute(sql`
        SELECT b.id, b.title, b.dj1TrackUrl, b.dj2TrackUrl, b.dj1TrackTitle, b.dj2TrackTitle,
               b.dj1Votes, b.dj2Votes, b.status, b.winnerId, b.endsAt, b.createdAt,
               u1.id as dj1Id, u1.username as dj1Username, u1.djName as dj1DjName,
               u1.name as dj1Name, u1.avatarUrl as dj1Avatar, u1.profileImageUrl as dj1ProfileImage,
               u2.id as dj2Id, u2.username as dj2Username, u2.djName as dj2DjName,
               u2.name as dj2Name, u2.avatarUrl as dj2Avatar, u2.profileImageUrl as dj2ProfileImage
        FROM dj_battles b
        JOIN users u1 ON u1.id = b.dj1Id
        JOIN users u2 ON u2.id = b.dj2Id
        ${statusFilter}
        ORDER BY b.createdAt DESC
        LIMIT 20
      `);
      const rows = result as any[];
      return { battles: Array.isArray(rows[0]) ? rows[0] : rows };
    }),

  voteBattle: protectedProcedure
    .input(z.object({ battleId: z.number(), votedForDjId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const now = Date.now();
      const existing = await db.execute(sql`
        SELECT id FROM battle_votes WHERE battleId = ${input.battleId} AND userId = ${ctx.user.id}
      `);
      const rows = existing as any[];
      const row = Array.isArray(rows[0]) ? rows[0][0] : rows[0];
      if (row) return { error: "Already voted" };
      await db.execute(sql`
        INSERT INTO battle_votes (battleId, userId, votedForDjId, createdAt)
        VALUES (${input.battleId}, ${ctx.user.id}, ${input.votedForDjId}, ${now})
      `);
      // Get battle to know dj1Id/dj2Id
      const battleRes = await db.execute(sql`SELECT dj1Id, dj2Id FROM dj_battles WHERE id = ${input.battleId}`);
      const bRows = battleRes as any[];
      const battle = Array.isArray(bRows[0]) ? bRows[0][0] : bRows[0];
      if (battle) {
        if (Number(battle.dj1Id) === input.votedForDjId) {
          await db.execute(sql`UPDATE dj_battles SET dj1Votes = dj1Votes + 1 WHERE id = ${input.battleId}`);
        } else {
          await db.execute(sql`UPDATE dj_battles SET dj2Votes = dj2Votes + 1 WHERE id = ${input.battleId}`);
        }
      }
      return { success: true };
    }),

  getUserBattleVotes: protectedProcedure
    .input(z.object({ battleIds: z.array(z.number()) }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { votes: {} };
      if (input.battleIds.length === 0) return { votes: {} };
      const ids = input.battleIds.join(",");
      const result = await db.execute(sql`
        SELECT battleId, votedForDjId FROM battle_votes
        WHERE userId = ${ctx.user.id} AND battleId IN (${sql.raw(ids)})
      `);
      const rows = result as any[];
      const votes: Record<number, number> = {};
      (Array.isArray(rows[0]) ? rows[0] : rows).forEach((r: any) => {
        votes[Number(r.battleId)] = Number(r.votedForDjId);
      });
      return { votes };
    }),

  // ── SOCIAL RANKING ────────────────────────────────────────────────────────

  getSocialRanking: publicProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.execute(sql`
        SELECT
          u.id, u.username, u.name, u.djName, u.avatarUrl, u.profileImageUrl, u.isVerified, u.country,
          (SELECT COUNT(*) FROM dj_followers WHERE followingId = u.id) as followers,
          (SELECT COALESCE(SUM(playCount), 0) FROM tracks WHERE userId = u.id) as totalPlays,
          (SELECT COALESCE(SUM(likeCount), 0) FROM tracks WHERE userId = u.id) as totalLikes,
          (SELECT COUNT(*) FROM social_posts WHERE userId = u.id) as postCount,
          (
            (SELECT COUNT(*) FROM dj_followers WHERE followingId = u.id) * 3 +
            (SELECT COALESCE(SUM(playCount), 0) FROM tracks WHERE userId = u.id) +
            (SELECT COALESCE(SUM(likeCount), 0) FROM tracks WHERE userId = u.id) * 2 +
            (SELECT COUNT(*) FROM social_posts WHERE userId = u.id)
          ) as engagementScore
        FROM users u
        WHERE u.username IS NOT NULL AND u.username != ''
        ORDER BY engagementScore DESC
        LIMIT ${input.limit}
      `);
      const rows = result as any[];
      return { djs: Array.isArray(rows[0]) ? rows[0] : rows };
    }),

  // ── DJ MAP ────────────────────────────────────────────────────────────────

  // ── GLOBAL SEARCH ────────────────────────────────────────────────────────
  globalSearch: publicProcedure
    .input(z.object({ query: z.string().min(1).max(100), limit: z.number().default(8) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const q = `%${input.query.trim()}%`;
      const lim = input.limit;

      // Search DJs / users by username, djName (artist name), name, bio
      // NOTE: users table has no 'genre' column — use djName and name only
      const djsResult = await db.execute(sql`
        SELECT DISTINCT u.id, u.username, u.name, u.djName, u.avatarUrl, u.profileImageUrl,
               u.isVerified, u.country, u.bio
        FROM users u
        WHERE u.username LIKE ${q}
           OR u.djName LIKE ${q}
           OR u.name LIKE ${q}
           OR u.bio LIKE ${q}
        LIMIT ${lim}
      `);
      const djsFromUsers = (Array.isArray((djsResult as any)[0]) ? (djsResult as any)[0] : djsResult as any[]);

      // Also find users who uploaded tracks matching the search (artist name on tracks)
      const djsFromTracksResult = await db.execute(sql`
        SELECT DISTINCT u.id, u.username, u.name, u.djName, u.avatarUrl, u.profileImageUrl,
               u.isVerified, u.country, u.bio
        FROM users u
        INNER JOIN tracks t ON t.userId = u.id
        WHERE t.artist LIKE ${q} OR t.title LIKE ${q}
        LIMIT ${lim}
      `);
      const djsFromTracks = (Array.isArray((djsFromTracksResult as any)[0]) ? (djsFromTracksResult as any)[0] : djsFromTracksResult as any[]);

      // Merge and deduplicate by id
      const djMap = new Map<number, any>();
      [...djsFromUsers, ...djsFromTracks].forEach((dj: any) => {
        if (dj.id && !djMap.has(Number(dj.id))) djMap.set(Number(dj.id), dj);
      });
      const djs = Array.from(djMap.values()).slice(0, lim);

      // Search tracks — use coverImageUrl (correct column name)
      const tracksResult = await db.execute(sql`
        SELECT t.id, t.title, t.artist, t.genre, t.coverImageUrl as coverUrl, t.bpm, t.downloadCount,
               u.id as userId, u.username, u.djName
        FROM tracks t
        LEFT JOIN users u ON u.id = t.userId
        WHERE t.title LIKE ${q}
           OR t.artist LIKE ${q}
           OR t.genre LIKE ${q}
           OR t.tags LIKE ${q}
        ORDER BY t.downloadCount DESC
        LIMIT ${lim}
      `);
      const tracks = (Array.isArray((tracksResult as any)[0]) ? (tracksResult as any)[0] : tracksResult as any[]);

      // Search posts by content or hashtag
      const postsResult = await db.execute(sql`
        SELECT p.id, p.content, p.hashtags, p.postType, p.likeCount, p.createdAt,
               u.id as userId, u.username, u.djName, u.avatarUrl, u.profileImageUrl, u.isVerified
        FROM social_posts p
        JOIN users u ON u.id = p.userId
        WHERE p.content LIKE ${q} OR p.hashtags LIKE ${q}
        ORDER BY p.likeCount DESC
        LIMIT ${lim}
      `);
      const posts = (Array.isArray((postsResult as any)[0]) ? (postsResult as any)[0] : postsResult as any[]);

      return { djs, tracks, posts };
    }),

  getDJsForMap: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.execute(sql`
      SELECT
        u.id, u.username, u.name, u.djName, u.avatarUrl, u.profileImageUrl,
        u.country, u.isVerified,
        (SELECT COUNT(*) FROM dj_followers WHERE followingId = u.id) as followers
      FROM users u
      WHERE u.username IS NOT NULL AND u.username != '' AND u.country IS NOT NULL AND u.country != ''
      ORDER BY followers DESC
      LIMIT 200
    `);
    const rows = result as any[];
    return { djs: Array.isArray(rows[0]) ? rows[0] : rows };
  }),
});
