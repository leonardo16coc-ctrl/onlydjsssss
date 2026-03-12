/**
 * Instagram & Social Media Integration Router
 * Handles OAuth flow, token storage, feed fetching and caching
 */
import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { socialMediaConnections, users } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";

// ── Encryption helpers ─────────────────────────────────────────────────────
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

// ── Instagram Graph API helpers (v25.0) ───────────────────────────────────────────
const IG_API_VERSION = "v25.0";
const IG_API_BASE = `https://graph.instagram.com/${IG_API_VERSION}`;
const IG_AUTH_BASE = "https://www.instagram.com/oauth";
const IG_TOKEN_BASE = "https://api.instagram.com/oauth";
const IG_LONG_TOKEN_BASE = `https://graph.instagram.com/${IG_API_VERSION}/access_token`;
const IG_REFRESH_TOKEN_BASE = `https://graph.instagram.com/${IG_API_VERSION}/refresh_access_token`;

// All available public fields for Instagram media (v25.0)
const IG_MEDIA_FIELDS = [
  "id",
  "media_type",
  "media_url",
  "thumbnail_url",
  "permalink",
  "caption",
  "timestamp",
  "like_count",
  "comments_count",
  "alt_text",
  "is_shared_to_feed",
].join(",");

async function fetchInstagramPosts(accessToken: string, limit = 9): Promise<any[]> {
  try {
    const url = `${IG_API_BASE}/me/media?fields=${IG_MEDIA_FIELDS}&limit=${limit}&access_token=${accessToken}`;
    const res = await fetch(url);
    if (!res.ok) {
      const errBody = await res.text();
      console.error("[Instagram] Media API error:", res.status, errBody);
      throw new Error(`Instagram API error: ${res.status}`);
    }
    const data = await res.json();
    // Include IMAGE, CAROUSEL_ALBUM and VIDEO (Reels) — filter out STORY
    return (data.data || []).filter((p: any) =>
      ["IMAGE", "CAROUSEL_ALBUM", "VIDEO"].includes(p.media_type)
    );
  } catch (err) {
    console.error("[Instagram] Failed to fetch posts:", err);
    return [];
  }
}

async function fetchInstagramProfile(accessToken: string): Promise<{ id: string; username: string; profile_picture_url?: string; followers_count?: number; name?: string } | null> {
  try {
    // instagram_business_basic grants: id, username, name, profile_picture_url, followers_count, follows_count, media_count
    const fields = "id,username,name,profile_picture_url,followers_count,follows_count,media_count";
    const url = `${IG_API_BASE}/me?fields=${fields}&access_token=${accessToken}`;
    const res = await fetch(url);
    if (!res.ok) {
      const errBody = await res.text();
      console.error("[Instagram] Profile API error:", res.status, errBody);
      throw new Error(`Instagram profile API error: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error("[Instagram] Failed to fetch profile:", err);
    return null;
  }
}

async function refreshInstagramToken(accessToken: string): Promise<string | null> {
  try {
    const url = `${IG_REFRESH_TOKEN_BASE}?grant_type=ig_refresh_token&access_token=${accessToken}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.access_token || null;
  } catch {
    return null;
  }
}

// ── Router ─────────────────────────────────────────────────────────────────
export const instagramRouter = router({

  /**
   * Get the Instagram OAuth authorization URL
   */
  getAuthUrl: protectedProcedure
    .input(z.object({ redirectUri: z.string().url() }))
    .query(({ input }) => {
      const appId = process.env.INSTAGRAM_APP_ID || process.env.META_APP_ID || "";
      if (!appId) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Instagram App ID not configured. Please add INSTAGRAM_APP_ID to your environment variables.",
        });
      }
      // Scopes: instagram_business_basic is required for profile + media access
      // instagram_business_content_publish allows publishing (optional)
      const params = new URLSearchParams({
        client_id: appId,
        redirect_uri: input.redirectUri,
        scope: "instagram_business_basic",
        response_type: "code",
        enable_fb_login: "0",
        force_reauth: "0",
      });
      const authUrl = `${IG_AUTH_BASE}/authorize?${params.toString()}`;
      console.log("[Instagram] Auth URL generated:", authUrl.replace(appId, "APP_ID_HIDDEN"));
      return { url: authUrl };
    }),

  /**
   * Exchange OAuth code for access token and save connection
   */
  connectInstagram: protectedProcedure
    .input(z.object({
      code: z.string(),
      redirectUri: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
      const appId = process.env.INSTAGRAM_APP_ID || process.env.META_APP_ID || "";
      const appSecret = process.env.INSTAGRAM_APP_SECRET || process.env.META_APP_SECRET || "";

      if (!appId || !appSecret) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Instagram credentials not configured. Please add INSTAGRAM_APP_ID and INSTAGRAM_APP_SECRET.",
        });
      }

      // Exchange code for short-lived token (new Business Login API)
      const tokenRes = await fetch(`${IG_TOKEN_BASE}/access_token`, {
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
        throw new TRPCError({ code: "BAD_REQUEST", message: `Instagram OAuth failed: ${err}` });
      }

      const tokenData = await tokenRes.json();
      const shortToken = tokenData.access_token;

      // Exchange for long-lived token (60 days) using the correct endpoint
      // POST to https://graph.instagram.com/v25.0/access_token
      const longTokenRes = await fetch(
        `${IG_LONG_TOKEN_BASE}?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${shortToken}`
      );
      let longTokenData: any = { access_token: shortToken };
      if (longTokenRes.ok) {
        longTokenData = await longTokenRes.json();
        console.log("[Instagram] Long-lived token obtained, expires_in:", longTokenData.expires_in);
      } else {
        const errBody = await longTokenRes.text();
        console.warn("[Instagram] Long-lived token exchange failed, using short-lived:", errBody);
      }
      const accessToken = longTokenData.access_token || shortToken;

      // Fetch profile info
      const profile = await fetchInstagramProfile(accessToken);
      if (!profile) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch Instagram profile" });
      }

      // Fetch initial posts
      const posts = await fetchInstagramPosts(accessToken, 9);
      const cacheExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Upsert connection
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const existing = await dbConn
        .select({ id: socialMediaConnections.id })
        .from(socialMediaConnections)
        .where(and(
          eq(socialMediaConnections.userId, ctx.user.id),
          eq(socialMediaConnections.platform, "instagram")
        ))
        .limit(1);

      const encryptedToken = encrypt(accessToken);
      const tokenExpiry = longTokenData.expires_in
        ? new Date(Date.now() + longTokenData.expires_in * 1000)
        : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days default

      if (existing.length > 0) {
        await dbConn
          .update(socialMediaConnections)
          .set({
            platformUserId: profile.id,
            platformUsername: profile.username,
            accessToken: encryptedToken,
            tokenExpiresAt: tokenExpiry,
            profilePictureUrl: profile.profile_picture_url || null,
            followerCount: profile.followers_count || 0,
            cachedPosts: JSON.stringify(posts),
            cacheExpiresAt: cacheExpiry,
            isActive: true,
            lastSyncAt: new Date(),
          })
          .where(eq(socialMediaConnections.id, existing[0].id));
      } else {
        await dbConn.insert(socialMediaConnections).values({
          userId: ctx.user.id,
          platform: "instagram",
          platformUserId: profile.id,
          platformUsername: profile.username,
          accessToken: encryptedToken,
          tokenExpiresAt: tokenExpiry,
          profilePictureUrl: profile.profile_picture_url || null,
          followerCount: profile.followers_count || 0,
          cachedPosts: JSON.stringify(posts),
          cacheExpiresAt: cacheExpiry,
          isActive: true,
          lastSyncAt: new Date(),
        });
      }

      return { success: true, username: profile.username, postCount: posts.length };
    }),

  /**
   * Disconnect Instagram account
   */
  disconnect: protectedProcedure
    .input(z.object({ platform: z.enum(["instagram", "facebook", "tiktok", "youtube"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      await db
        .update(socialMediaConnections)
        .set({ isActive: false })
        .where(and(
          eq(socialMediaConnections.userId, ctx.user.id),
          eq(socialMediaConnections.platform, input.platform)
        ));
      return { success: true };
    }),

  /**
   * Get current user's social media connections status
   */
  getMyConnections: protectedProcedure.query(async ({ ctx }) => {
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
      .where(eq(socialMediaConnections.userId, ctx.user.id));

    return connections;
  }),

  /**
   * Get Instagram feed for a public artist profile (by username)
   * Uses cache to avoid excessive API calls
   */
  getArtistInstagramFeed: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      // Find user by username
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userResult = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, input.username))
        .limit(1);

      if (!userResult.length) return { posts: [], instagramUsername: null };

      const userId = userResult[0].id;

      // Find active Instagram connection
      const db2 = await getDb();
      if (!db2) throw new Error("Database not available");
      const connection = await db2
        .select({
          id: socialMediaConnections.id,
          platformUsername: socialMediaConnections.platformUsername,
          accessToken: socialMediaConnections.accessToken,
          cachedPosts: socialMediaConnections.cachedPosts,
          cacheExpiresAt: socialMediaConnections.cacheExpiresAt,
          isActive: socialMediaConnections.isActive,
        })
        .from(socialMediaConnections)
        .where(and(
          eq(socialMediaConnections.userId, userId),
          eq(socialMediaConnections.platform, "instagram"),
          eq(socialMediaConnections.isActive, true)
        ))
        .limit(1);

      if (!connection.length) return { posts: [], instagramUsername: null };

      const conn = connection[0];
      const now = new Date();

      // Return cached posts if still valid
      if (conn.cachedPosts && conn.cacheExpiresAt && conn.cacheExpiresAt > now) {
        try {
          const posts = JSON.parse(conn.cachedPosts);
          return { posts, instagramUsername: conn.platformUsername };
        } catch { /* fall through to refresh */ }
      }

      // Cache expired — refresh from API
      const decryptedToken = decrypt(conn.accessToken);
      if (!decryptedToken) return { posts: [], instagramUsername: conn.platformUsername };

      const freshPosts = await fetchInstagramPosts(decryptedToken, 9);
      const cacheExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Update cache
      await db2
        .update(socialMediaConnections)
        .set({
          cachedPosts: JSON.stringify(freshPosts),
          cacheExpiresAt: cacheExpiry,
          lastSyncAt: now,
        })
        .where(eq(socialMediaConnections.id, conn.id));

      return { posts: freshPosts, instagramUsername: conn.platformUsername };
    }),

  /**
   * Manually refresh Instagram feed cache
   */
  refreshFeed: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const connection = await db
      .select()
      .from(socialMediaConnections)
      .where(and(
        eq(socialMediaConnections.userId, ctx.user.id),
        eq(socialMediaConnections.platform, "instagram"),
        eq(socialMediaConnections.isActive, true)
      ))
      .limit(1);

    if (!connection.length) {
      throw new TRPCError({ code: "NOT_FOUND", message: "No Instagram connection found" });
    }

    const conn = connection[0];
    const decryptedToken = decrypt(conn.accessToken);
    if (!decryptedToken) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid token, please reconnect Instagram" });
    }

    const posts = await fetchInstagramPosts(decryptedToken, 9);
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
