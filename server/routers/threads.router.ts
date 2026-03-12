/**
 * Threads Integration Router
 * Handles OAuth flow (Threads API), token storage, feed fetching and caching.
 * Threads API docs: https://developers.facebook.com/docs/threads
 */
import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { socialMediaConnections, users } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";

// ── Encryption helpers (shared pattern with instagram.router.ts) ───────────
const ENCRYPTION_KEY = process.env.JWT_SECRET?.slice(0, 32).padEnd(32, "0") || "onlydjs-secret-key-32-chars-pad!";
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text: string): string {
  try {
    const [ivHex, encryptedHex] = text.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const encryptedText = Buffer.from(encryptedHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch {
    return "";
  }
}

// ── Threads API helpers ────────────────────────────────────────────────────
const THREADS_AUTH_BASE = "https://threads.net/oauth";
const THREADS_TOKEN_BASE = "https://graph.threads.net/oauth";
const THREADS_API_BASE = "https://graph.threads.net/v1.0";

export interface ThreadsPost {
  id: string;
  text?: string;
  media_type: "TEXT" | "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp: string;
  like_count?: number;
  replies_count?: number;
}

async function fetchThreadsPosts(accessToken: string, userId: string, limit = 9): Promise<ThreadsPost[]> {
  try {
    const fields = "id,text,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,replies_count";
    const url = `${THREADS_API_BASE}/${userId}/threads?fields=${fields}&limit=${limit}&access_token=${accessToken}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error("[Threads] Failed to fetch posts:", await res.text());
      return [];
    }
    const data = await res.json();
    return (data.data || []) as ThreadsPost[];
  } catch (err) {
    console.error("[Threads] fetchThreadsPosts error:", err);
    return [];
  }
}

async function fetchThreadsProfile(accessToken: string): Promise<{
  id: string;
  username: string;
  name?: string;
  threads_profile_picture_url?: string;
  threads_biography?: string;
  followers_count?: number;
} | null> {
  try {
    const fields = "id,username,name,threads_profile_picture_url,threads_biography,followers_count";
    const url = `${THREADS_API_BASE}/me?fields=${fields}&access_token=${accessToken}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error("[Threads] Failed to fetch profile:", await res.text());
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("[Threads] fetchThreadsProfile error:", err);
    return null;
  }
}

// ── Router ─────────────────────────────────────────────────────────────────
export const threadsRouter = router({

  /**
   * Get the Threads OAuth authorization URL
   */
  getAuthUrl: protectedProcedure
    .input(z.object({ redirectUri: z.string().url() }))
    .query(({ input }) => {
      const appId = process.env.THREADS_APP_ID || "";
      if (!appId) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Threads App ID not configured. Please add THREADS_APP_ID to your environment variables.",
        });
      }
      const params = new URLSearchParams({
        client_id: appId,
        redirect_uri: input.redirectUri,
        scope: "threads_basic,threads_content_publish,threads_read_replies",
        response_type: "code",
        state: "threads",
      });
      return { url: `${THREADS_AUTH_BASE}/authorize?${params.toString()}` };
    }),

  /**
   * Exchange OAuth code for access token and save connection
   */
  connectThreads: protectedProcedure
    .input(z.object({
      code: z.string(),
      redirectUri: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
      const appId = process.env.THREADS_APP_ID || "";
      const appSecret = process.env.THREADS_APP_SECRET || "";

      if (!appId || !appSecret) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Threads credentials not configured. Please add THREADS_APP_ID and THREADS_APP_SECRET.",
        });
      }

      // Step 1: Exchange code for short-lived token
      const tokenRes = await fetch(`${THREADS_TOKEN_BASE}/access_token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: appId,
          client_secret: appSecret,
          grant_type: "authorization_code",
          redirect_uri: input.redirectUri,
          code: input.code,
        }),
      });

      if (!tokenRes.ok) {
        const err = await tokenRes.text();
        throw new TRPCError({ code: "BAD_REQUEST", message: `Threads OAuth failed: ${err}` });
      }

      const tokenData = await tokenRes.json();
      const shortToken = tokenData.access_token;
      const threadsUserId = tokenData.user_id?.toString() || "";

      // Step 2: Exchange for long-lived token (60 days)
      const longTokenRes = await fetch(
        `${THREADS_API_BASE}/access_token?grant_type=th_exchange_token&client_secret=${appSecret}&access_token=${shortToken}`
      );
      const longTokenData = longTokenRes.ok ? await longTokenRes.json() : { access_token: shortToken };
      const accessToken = longTokenData.access_token || shortToken;
      const expiresIn = longTokenData.expires_in || 5184000; // 60 days default

      // Step 3: Fetch profile info
      const profile = await fetchThreadsProfile(accessToken);
      if (!profile) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Failed to fetch Threads profile" });
      }

      // Step 4: Fetch initial posts for cache
      const posts = await fetchThreadsPosts(accessToken, profile.id, 9);

      const encryptedToken = encrypt(accessToken);
      const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
      const cacheExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      const now = new Date();

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Upsert connection
      const existing = await db
        .select({ id: socialMediaConnections.id })
        .from(socialMediaConnections)
        .where(and(
          eq(socialMediaConnections.userId, ctx.user.id),
          eq(socialMediaConnections.platform, "threads")
        ))
        .limit(1);

      if (existing.length) {
        await db
          .update(socialMediaConnections)
          .set({
            platformUserId: profile.id,
            platformUsername: profile.username,
            profilePictureUrl: profile.threads_profile_picture_url || null,
            followerCount: profile.followers_count || null,
            accessToken: encryptedToken,
            tokenExpiresAt,
            cachedPosts: JSON.stringify(posts),
            cacheExpiresAt: cacheExpiry,
            lastSyncAt: now,
            isActive: true,
          })
          .where(eq(socialMediaConnections.id, existing[0].id));
      } else {
        await db.insert(socialMediaConnections).values({
          userId: ctx.user.id,
          platform: "threads",
          platformUserId: profile.id,
          platformUsername: profile.username,
          profilePictureUrl: profile.threads_profile_picture_url || null,
          followerCount: profile.followers_count || null,
          accessToken: encryptedToken,
          tokenExpiresAt,
          cachedPosts: JSON.stringify(posts),
          cacheExpiresAt: cacheExpiry,
          lastSyncAt: now,
          isActive: true,
        });
      }

      return {
        success: true,
        username: profile.username,
        postCount: posts.length,
      };
    }),

  /**
   * Disconnect Threads account
   */
  disconnect: protectedProcedure
    .input(z.object({ platform: z.literal("threads") }).optional())
    .mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db
        .update(socialMediaConnections)
        .set({ isActive: false })
        .where(and(
          eq(socialMediaConnections.userId, ctx.user.id),
          eq(socialMediaConnections.platform, "threads")
        ));

      return { success: true };
    }),

  /**
   * Get current user's Threads connection status
   */
  getMyConnection: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const connections = await db
      .select({
        id: socialMediaConnections.id,
        platform: socialMediaConnections.platform,
        platformUsername: socialMediaConnections.platformUsername,
        profilePictureUrl: socialMediaConnections.profilePictureUrl,
        followerCount: socialMediaConnections.followerCount,
        isActive: socialMediaConnections.isActive,
        lastSyncAt: socialMediaConnections.lastSyncAt,
        tokenExpiresAt: socialMediaConnections.tokenExpiresAt,
      })
      .from(socialMediaConnections)
      .where(and(
        eq(socialMediaConnections.userId, ctx.user.id),
        eq(socialMediaConnections.platform, "threads")
      ))
      .limit(1);

    return connections[0] || null;
  }),

  /**
   * Get Threads feed for a public artist profile (by username)
   * Uses 1-hour cache to reduce API calls
   */
  getArtistThreadsFeed: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Find user by username
      const userResult = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, input.username))
        .limit(1);

      if (!userResult.length) return { posts: [], threadsUsername: null };

      const userId = userResult[0].id;

      // Find active Threads connection
      const connection = await db
        .select({
          id: socialMediaConnections.id,
          platformUserId: socialMediaConnections.platformUserId,
          platformUsername: socialMediaConnections.platformUsername,
          accessToken: socialMediaConnections.accessToken,
          cachedPosts: socialMediaConnections.cachedPosts,
          cacheExpiresAt: socialMediaConnections.cacheExpiresAt,
          isActive: socialMediaConnections.isActive,
        })
        .from(socialMediaConnections)
        .where(and(
          eq(socialMediaConnections.userId, userId),
          eq(socialMediaConnections.platform, "threads"),
          eq(socialMediaConnections.isActive, true)
        ))
        .limit(1);

      if (!connection.length) return { posts: [], threadsUsername: null };

      const conn = connection[0];
      const now = new Date();

      // Return cached posts if still valid
      if (conn.cachedPosts && conn.cacheExpiresAt && conn.cacheExpiresAt > now) {
        try {
          const posts = JSON.parse(conn.cachedPosts);
          return { posts, threadsUsername: conn.platformUsername };
        } catch { /* fall through to refresh */ }
      }

      // Cache expired — refresh from API
      const decryptedToken = decrypt(conn.accessToken);
      if (!decryptedToken) return { posts: [], threadsUsername: conn.platformUsername };

      const freshPosts = await fetchThreadsPosts(decryptedToken, conn.platformUserId || "", 9);
      const cacheExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Update cache
      await db
        .update(socialMediaConnections)
        .set({
          cachedPosts: JSON.stringify(freshPosts),
          cacheExpiresAt: cacheExpiry,
          lastSyncAt: now,
        })
        .where(eq(socialMediaConnections.id, conn.id));

      return { posts: freshPosts, threadsUsername: conn.platformUsername };
    }),

  /**
   * Manually refresh Threads feed cache
   */
  refreshFeed: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const connection = await db
      .select()
      .from(socialMediaConnections)
      .where(and(
        eq(socialMediaConnections.userId, ctx.user.id),
        eq(socialMediaConnections.platform, "threads"),
        eq(socialMediaConnections.isActive, true)
      ))
      .limit(1);

    if (!connection.length) {
      throw new TRPCError({ code: "NOT_FOUND", message: "No Threads connection found" });
    }

    const conn = connection[0];
    const decryptedToken = decrypt(conn.accessToken);
    if (!decryptedToken) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid token, please reconnect Threads" });
    }

    const posts = await fetchThreadsPosts(decryptedToken, conn.platformUserId || "", 9);
    const cacheExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await db
      .update(socialMediaConnections)
      .set({
        cachedPosts: JSON.stringify(posts),
        cacheExpiresAt: cacheExpiry,
        lastSyncAt: new Date(),
      })
      .where(eq(socialMediaConnections.id, conn.id));

    return { success: true, postCount: posts.length };
  }),
});
