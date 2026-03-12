/**
 * Twitter/X Integration Router
 * Handles OAuth 2.0 PKCE flow, token storage, tweet feed fetching and caching
 * Uses Twitter API v2
 */
import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { socialMediaConnections, users } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";

// ── Encryption helpers (shared pattern with instagram.router.ts) ──────────────
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

// ── PKCE helpers ──────────────────────────────────────────────────────────────
function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url");
}

function generateCodeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

// ── Twitter API v2 constants ──────────────────────────────────────────────────
const TWITTER_AUTH_URL = "https://twitter.com/i/oauth2/authorize";
const TWITTER_TOKEN_URL = "https://api.twitter.com/2/oauth2/token";
const TWITTER_API_BASE = "https://api.twitter.com/2";

// Scopes needed: read tweets and user profile
const TWITTER_SCOPES = ["tweet.read", "users.read", "offline.access"].join(" ");

// Tweet fields to fetch
const TWEET_FIELDS = "id,text,created_at,public_metrics,attachments,entities";
const MEDIA_FIELDS = "media_key,type,url,preview_image_url,width,height";
const EXPANSIONS = "attachments.media_keys,author_id";
const USER_FIELDS = "id,name,username,profile_image_url,public_metrics,verified";

// In-memory PKCE store (userId -> { verifier, state })
const pkceStore = new Map<string, { verifier: string; state: string; expiresAt: number }>();

// ── Twitter API helpers ───────────────────────────────────────────────────────
async function fetchTwitterUserTweets(accessToken: string, userId: string, maxResults = 9) {
  const url = new URL(`${TWITTER_API_BASE}/users/${userId}/tweets`);
  url.searchParams.set("max_results", String(Math.min(maxResults, 100)));
  url.searchParams.set("tweet.fields", TWEET_FIELDS);
  url.searchParams.set("media.fields", MEDIA_FIELDS);
  url.searchParams.set("expansions", EXPANSIONS);
  url.searchParams.set("exclude", "retweets,replies");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Twitter API error: ${res.status} ${err}`);
  }

  return res.json();
}

async function fetchTwitterUser(accessToken: string) {
  const url = new URL(`${TWITTER_API_BASE}/users/me`);
  url.searchParams.set("user.fields", USER_FIELDS);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Twitter user fetch error: ${res.status} ${err}`);
  }

  return res.json();
}

async function refreshTwitterToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const clientId = process.env.TWITTER_CLIENT_ID!;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET!;
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(TWITTER_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
    }).toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Twitter token refresh error: ${res.status} ${err}`);
  }

  const data = await res.json() as { access_token: string; refresh_token: string; expires_in: number };
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

// ── Router ────────────────────────────────────────────────────────────────────
export const twitterRouter = router({
  /**
   * Get the Twitter OAuth 2.0 authorization URL with PKCE
   */
  getAuthUrl: protectedProcedure
    .input(z.object({ redirectUri: z.string().url() }))
    .query(async ({ ctx, input }) => {
      const clientId = process.env.TWITTER_CLIENT_ID;
      if (!clientId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Twitter client ID not configured" });

      const verifier = generateCodeVerifier();
      const challenge = generateCodeChallenge(verifier);
      const state = `twitter_${ctx.user.id}_${Date.now()}`;

      // Store PKCE verifier temporarily (expires in 10 minutes)
      pkceStore.set(String(ctx.user.id), {
        verifier,
        state,
        expiresAt: Date.now() + 10 * 60 * 1000,
      });

      const url = new URL(TWITTER_AUTH_URL);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("client_id", clientId);
      url.searchParams.set("redirect_uri", input.redirectUri);
      url.searchParams.set("scope", TWITTER_SCOPES);
      url.searchParams.set("state", state);
      url.searchParams.set("code_challenge", challenge);
      url.searchParams.set("code_challenge_method", "S256");

      return { authUrl: url.toString(), state };
    }),

  /**
   * Exchange authorization code for access token and save connection
   */
  connectTwitter: protectedProcedure
    .input(z.object({
      code: z.string(),
      state: z.string(),
      redirectUri: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
      const clientId = process.env.TWITTER_CLIENT_ID;
      const clientSecret = process.env.TWITTER_CLIENT_SECRET;
      if (!clientId || !clientSecret) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Twitter credentials not configured" });
      }

      // Retrieve and validate PKCE verifier
      const pkce = pkceStore.get(String(ctx.user.id));
      if (!pkce || pkce.expiresAt < Date.now()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "PKCE session expired. Please try again." });
      }
      if (pkce.state !== input.state) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid state parameter. Possible CSRF attack." });
      }
      pkceStore.delete(String(ctx.user.id));

      // Exchange code for tokens
      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      const tokenRes = await fetch(TWITTER_TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${credentials}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: input.code,
          redirect_uri: input.redirectUri,
          code_verifier: pkce.verifier,
          client_id: clientId,
        }).toString(),
      });

      if (!tokenRes.ok) {
        const err = await tokenRes.text();
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Token exchange failed: ${err}` });
      }

      const tokenData = await tokenRes.json() as {
        access_token: string;
        refresh_token?: string;
        expires_in?: number;
        token_type: string;
        scope: string;
      };

      // Fetch user profile
      const userRes = await fetchTwitterUser(tokenData.access_token);
      const twitterUser = userRes.data as {
        id: string;
        name: string;
        username: string;
        profile_image_url?: string;
        public_metrics?: { followers_count: number };
        verified?: boolean;
      };

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const encryptedToken = encrypt(tokenData.access_token);
      const encryptedRefresh = tokenData.refresh_token ? encrypt(tokenData.refresh_token) : null;
      const expiresAt = tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000)
        : null;

      // Upsert connection
      const existing = await db
        .select()
        .from(socialMediaConnections)
        .where(and(eq(socialMediaConnections.userId, ctx.user.id), eq(socialMediaConnections.platform, "twitter")))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(socialMediaConnections)
          .set({
            platformUserId: twitterUser.id,
            platformUsername: twitterUser.username,
            accessToken: encryptedToken + (encryptedRefresh ? `||REFRESH||${encryptedRefresh}` : ""),
            tokenExpiresAt: expiresAt,
            profilePictureUrl: twitterUser.profile_image_url?.replace("_normal", "_400x400"),
            followerCount: twitterUser.public_metrics?.followers_count ?? 0,
            isActive: true,
            lastSyncAt: new Date(),
            cachedPosts: null,
            cacheExpiresAt: null,
          })
          .where(eq(socialMediaConnections.id, existing[0].id));
      } else {
        await db.insert(socialMediaConnections).values({
          userId: ctx.user.id,
          platform: "twitter",
          platformUserId: twitterUser.id,
          platformUsername: twitterUser.username,
          accessToken: encryptedToken + (encryptedRefresh ? `||REFRESH||${encryptedRefresh}` : ""),
          tokenExpiresAt: expiresAt,
          profilePictureUrl: twitterUser.profile_image_url?.replace("_normal", "_400x400"),
          followerCount: twitterUser.public_metrics?.followers_count ?? 0,
          isActive: true,
          lastSyncAt: new Date(),
        });
      }

      return {
        success: true,
        username: twitterUser.username,
        name: twitterUser.name,
        followers: twitterUser.public_metrics?.followers_count ?? 0,
      };
    }),

  /**
   * Disconnect Twitter account
   */
  disconnectTwitter: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    await db
      .delete(socialMediaConnections)
      .where(and(eq(socialMediaConnections.userId, ctx.user.id), eq(socialMediaConnections.platform, "twitter")));

    return { success: true };
  }),

  /**
   * Get current user's Twitter connections
   */
  getMyConnections: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { twitter: null };

    const connections = await db
      .select()
      .from(socialMediaConnections)
      .where(and(eq(socialMediaConnections.userId, ctx.user.id), eq(socialMediaConnections.platform, "twitter")));

    const twitter = connections.find(c => c.platform === "twitter");
    return {
      twitter: twitter ? {
        username: twitter.platformUsername,
        profilePicture: twitter.profilePictureUrl,
        followers: twitter.followerCount,
        connectedAt: twitter.createdAt,
        lastSync: twitter.lastSyncAt,
      } : null,
    };
  }),

  /**
   * Get tweets for a public artist profile (with 1-hour cache)
   */
  getArtistTwitterFeed: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { tweets: [], username: null };
      // Look up user by username first
      const userRows = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, input.username))
        .limit(1);
      if (userRows.length === 0) return { tweets: [], username: null };
      const userId = userRows[0].id;
      const connections = await db
        .select()
        .from(socialMediaConnections)
        .where(and(
          eq(socialMediaConnections.userId, userId),
          eq(socialMediaConnections.platform, "twitter"),
          eq(socialMediaConnections.isActive, true)
        ))
        .limit(1);;

      if (connections.length === 0) return { tweets: [], username: null };

      const conn = connections[0];
      const now = new Date();

      // Return cached posts if still valid
      if (conn.cachedPosts && conn.cacheExpiresAt && conn.cacheExpiresAt > now) {
        try {
          return { tweets: JSON.parse(conn.cachedPosts), username: conn.platformUsername };
        } catch {
          // Cache corrupted, refetch
        }
      }

      // Decrypt token (format: encryptedAccessToken||REFRESH||encryptedRefreshToken)
      const [encryptedAccess, encryptedRefresh] = conn.accessToken.split("||REFRESH||");
      let accessToken = decrypt(encryptedAccess);

      // Try to refresh if we have a refresh token
      if (encryptedRefresh) {
        try {
          const refreshToken = decrypt(encryptedRefresh);
          const refreshed = await refreshTwitterToken(refreshToken);
          accessToken = refreshed.accessToken;

          const newEncryptedAccess = encrypt(refreshed.accessToken);
          const newEncryptedRefresh = encrypt(refreshed.refreshToken);
          const newExpiresAt = new Date(Date.now() + refreshed.expiresIn * 1000);

          await db.update(socialMediaConnections).set({
            accessToken: `${newEncryptedAccess}||REFRESH||${newEncryptedRefresh}`,
            tokenExpiresAt: newExpiresAt,
          }).where(eq(socialMediaConnections.id, conn.id));
        } catch {
          // Use existing token if refresh fails
        }
      }

      try {
        const data = await fetchTwitterUserTweets(accessToken, conn.platformUserId, 9);

        // Build media map
        const mediaMap: Record<string, { url?: string; preview?: string; type: string }> = {};
        if (data.includes?.media) {
          for (const m of data.includes.media) {
            mediaMap[m.media_key] = {
              url: m.url || m.preview_image_url,
              preview: m.preview_image_url,
              type: m.type,
            };
          }
        }

        const tweets = (data.data || []).map((tweet: any) => {
          const mediaKeys: string[] = tweet.attachments?.media_keys || [];
          const media = mediaKeys.map((k: string) => mediaMap[k]).filter(Boolean);
          return {
            id: tweet.id,
            text: tweet.text,
            createdAt: tweet.created_at,
            likeCount: tweet.public_metrics?.like_count ?? 0,
            retweetCount: tweet.public_metrics?.retweet_count ?? 0,
            replyCount: tweet.public_metrics?.reply_count ?? 0,
            media,
            permalink: `https://twitter.com/${conn.platformUsername}/status/${tweet.id}`,
          };
        });

        // Cache for 1 hour
        const cacheExpiry = new Date(Date.now() + 60 * 60 * 1000);
        await db.update(socialMediaConnections).set({
          cachedPosts: JSON.stringify(tweets),
          cacheExpiresAt: cacheExpiry,
          lastSyncAt: now,
        }).where(eq(socialMediaConnections.id, conn.id));

        return { tweets, username: conn.platformUsername };
      } catch (err) {
        console.error("[Twitter] Feed fetch error:", err);
        // Return cached even if expired on error
        if (conn.cachedPosts) {
          try { return { tweets: JSON.parse(conn.cachedPosts), username: conn.platformUsername }; } catch { /* ignore */ }
        }
        return { tweets: [], username: conn.platformUsername };
      }
    }),

  /**
   * Force refresh the tweet cache
   */
  refreshFeed: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    await db.update(socialMediaConnections).set({
      cachedPosts: null,
      cacheExpiresAt: null,
    }).where(and(
      eq(socialMediaConnections.userId, ctx.user.id),
      eq(socialMediaConnections.platform, "twitter")
    ));

    return { success: true };
  }),
});
