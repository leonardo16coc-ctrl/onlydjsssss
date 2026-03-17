/**
 * TikTok Integration Router
 * Handles OAuth 2.0 flow and TikTok username storage.
 * Uses TikTok Embed (no API credits needed) for displaying videos.
 */
import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { socialMediaConnections, users } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";

// ── Encryption helpers ────────────────────────────────────────────────────────
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

// TikTok OAuth constants
const TIKTOK_AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/";
const TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const TIKTOK_USER_URL = "https://open.tiktokapis.com/v2/user/info/";

// In-memory state store (userId -> { state, expiresAt })
const stateStore = new Map<string, { state: string; expiresAt: number }>();

export const tiktokRouter = router({
  /**
   * Get TikTok OAuth authorization URL
   */
  getAuthUrl: protectedProcedure
    .input(z.object({ redirectUri: z.string().url() }))
    .query(async ({ ctx, input }) => {
      const clientKey = process.env.TIKTOK_CLIENT_KEY;
      if (!clientKey) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "TikTok client key not configured" });
      }

      const state = `tiktok_${ctx.user.id}_${Date.now()}`;
      stateStore.set(String(ctx.user.id), {
        state,
        expiresAt: Date.now() + 10 * 60 * 1000,
      });

      const url = new URL(TIKTOK_AUTH_URL);
      url.searchParams.set("client_key", clientKey);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("scope", "user.info.basic,user.info.profile");
      url.searchParams.set("redirect_uri", input.redirectUri);
      url.searchParams.set("state", state);

      return { authUrl: url.toString(), state };
    }),

  /**
   * Exchange authorization code for access token and save connection
   */
  connectTikTok: protectedProcedure
    .input(z.object({
      code: z.string(),
      state: z.string(),
      redirectUri: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
      const clientKey = process.env.TIKTOK_CLIENT_KEY;
      const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
      if (!clientKey || !clientSecret) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "TikTok credentials not configured" });
      }

      // Validate state
      const stored = stateStore.get(String(ctx.user.id));
      if (!stored || stored.expiresAt < Date.now()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Session expirada. Intenta de nuevo." });
      }
      if (stored.state !== input.state) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Estado inválido. Posible ataque CSRF." });
      }
      stateStore.delete(String(ctx.user.id));

      // Exchange code for token
      const tokenRes = await fetch(TIKTOK_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_key: clientKey,
          client_secret: clientSecret,
          code: input.code,
          grant_type: "authorization_code",
          redirect_uri: input.redirectUri,
        }).toString(),
      });

      if (!tokenRes.ok) {
        const err = await tokenRes.text();
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Token exchange failed: ${err}` });
      }

      const tokenData = await tokenRes.json() as {
        data?: { access_token: string; refresh_token?: string; expires_in?: number; open_id: string };
        error?: string;
        message?: string;
      };

      if (tokenData.error || !tokenData.data?.access_token) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: tokenData.message || "Token exchange failed" });
      }

      const { access_token, refresh_token, expires_in, open_id } = tokenData.data;

      // Fetch user profile
      const userRes = await fetch(`${TIKTOK_USER_URL}?fields=open_id,union_id,avatar_url,display_name,username,follower_count`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      let tiktokUsername = open_id;
      let displayName = "";
      let avatarUrl = "";
      let followerCount = 0;

      if (userRes.ok) {
        const userData = await userRes.json() as {
          data?: { user?: { display_name?: string; username?: string; avatar_url?: string; follower_count?: number } };
        };
        const user = userData.data?.user;
        if (user) {
          tiktokUsername = user.username || user.display_name || open_id;
          displayName = user.display_name || "";
          avatarUrl = user.avatar_url || "";
          followerCount = user.follower_count || 0;
        }
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const encryptedToken = encrypt(access_token);
      const encryptedRefresh = refresh_token ? encrypt(refresh_token) : null;
      const expiresAt = expires_in ? new Date(Date.now() + expires_in * 1000) : null;

      // Upsert connection
      const existing = await db
        .select()
        .from(socialMediaConnections)
        .where(and(eq(socialMediaConnections.userId, ctx.user.id), eq(socialMediaConnections.platform, "tiktok")))
        .limit(1);

      if (existing.length > 0) {
        await db.update(socialMediaConnections).set({
          platformUserId: open_id,
          platformUsername: tiktokUsername,
          accessToken: encryptedToken + (encryptedRefresh ? `||REFRESH||${encryptedRefresh}` : ""),
          tokenExpiresAt: expiresAt,
          profilePictureUrl: avatarUrl,
          followerCount,
          isActive: true,
          lastSyncAt: new Date(),
        }).where(eq(socialMediaConnections.id, existing[0].id));
      } else {
        await db.insert(socialMediaConnections).values({
          userId: ctx.user.id,
          platform: "tiktok",
          platformUserId: open_id,
          platformUsername: tiktokUsername,
          accessToken: encryptedToken + (encryptedRefresh ? `||REFRESH||${encryptedRefresh}` : ""),
          tokenExpiresAt: expiresAt,
          profilePictureUrl: avatarUrl,
          followerCount,
          isActive: true,
          lastSyncAt: new Date(),
        });
      }

      return { success: true, username: tiktokUsername, displayName, followers: followerCount };
    }),

  /**
   * Disconnect TikTok account
   */
  disconnectTikTok: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    await db.delete(socialMediaConnections).where(
      and(eq(socialMediaConnections.userId, ctx.user.id), eq(socialMediaConnections.platform, "tiktok"))
    );
    return { success: true };
  }),

  /**
   * Get current user's TikTok connection
   */
  getMyConnections: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { tiktok: null };

    const connections = await db
      .select()
      .from(socialMediaConnections)
      .where(and(eq(socialMediaConnections.userId, ctx.user.id), eq(socialMediaConnections.platform, "tiktok")));

    const tiktok = connections[0];
    return {
      tiktok: tiktok ? {
        username: tiktok.platformUsername,
        profilePicture: tiktok.profilePictureUrl,
        followers: tiktok.followerCount,
        connectedAt: tiktok.createdAt,
      } : null,
    };
  }),

  /**
   * Get TikTok username for a public artist profile (for embed)
   */
  getArtistTikTokFeed: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { username: null };

      const userRows = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, input.username))
        .limit(1);

      if (userRows.length === 0) return { username: null };

      const connections = await db
        .select({ platformUsername: socialMediaConnections.platformUsername })
        .from(socialMediaConnections)
        .where(and(
          eq(socialMediaConnections.userId, userRows[0].id),
          eq(socialMediaConnections.platform, "tiktok"),
          eq(socialMediaConnections.isActive, true)
        ))
        .limit(1);

      if (connections.length === 0) return { username: null };
      return { username: connections[0].platformUsername };
    }),
});
