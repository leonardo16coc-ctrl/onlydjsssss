import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users, tracks, downloads, earnings } from "../../drizzle/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { uploadImageFile, isUploadError } from "../fileUpload";

export const profileRouter = router({
  /**
   * Get public profile by username
   */
  getByUsername: publicProcedure
    .input(z.object({
      username: z.string(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Get user by username
      const user = await db
        .select()
        .from(users)
        .where(eq(users.username, input.username))
        .limit(1);

      if (user.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "DJ no encontrado" });
      }

      const djProfile = user[0];

      // Get DJ's tracks
      const djTracks = await db
        .select()
        .from(tracks)
        .where(eq(tracks.userId, djProfile.id))
        .orderBy(desc(tracks.createdAt))
        .limit(20);

      // Get total downloads for this DJ
      const downloadStats = await db
        .select({
          totalDownloads: sql<number>`COUNT(*)`,
        })
        .from(downloads)
        .innerJoin(tracks, eq(downloads.trackId, tracks.id))
        .where(eq(tracks.userId, djProfile.id));

      // Get total earnings
      const earningsStats = await db
        .select({
          totalEarnings: sql<number>`SUM(${earnings.userEarnings})`,
        })
        .from(earnings)
        .where(eq(earnings.userId, djProfile.id));

      // Get genre distribution
      const genreDistribution = await db
        .select({
          genre: tracks.genre,
          count: sql<number>`COUNT(*)`,
        })
        .from(tracks)
        .where(eq(tracks.userId, djProfile.id))
        .groupBy(tracks.genre)
        .orderBy(desc(sql<number>`COUNT(*)`))
        .limit(5);

      // Calculate ranking (based on total downloads)
      const rankingResult = await db
        .select({
          rank: sql<number>`COUNT(*) + 1`,
        })
        .from(users)
        .where(sql`${users.totalDownloads} > ${djProfile.totalDownloads}`);

      const ranking = rankingResult[0]?.rank || 1;

      // Parse social links
      let socialLinks: Record<string, string> = {};
      if (djProfile.socialLinks) {
        try {
          socialLinks = JSON.parse(djProfile.socialLinks);
        } catch (e) {
          socialLinks = {};
        }
      }

      return {
        id: djProfile.id,
        username: djProfile.username,
        djName: djProfile.djName || djProfile.name,
        name: djProfile.name,
        bio: djProfile.bio,
        profileImageUrl: djProfile.profileImageUrl || djProfile.avatarUrl,
        country: djProfile.country,
        socialLinks,
        isVerified: djProfile.isVerified,
        membershipStatus: djProfile.membershipStatus,
        stats: {
          totalDownloads: downloadStats[0]?.totalDownloads || 0,
          totalEarnings: earningsStats[0]?.totalEarnings || 0,
          totalTracks: djTracks.length,
          ranking,
        },
        genres: genreDistribution.map(g => ({
          genre: g.genre,
          count: g.count,
        })),
        tracks: djTracks,
        createdAt: djProfile.createdAt,
      };
    }),

  /**
   * Update own profile
   */
  updateProfile: protectedProcedure
    .input(z.object({
      username: z.string().min(3).max(50).optional(),
      djName: z.string().max(100).optional(),
      bio: z.string().max(1000).optional(),
      country: z.string().max(100).optional(),
      socialLinks: z.record(z.string(), z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Check if username is already taken
      if (input.username && input.username !== ctx.user.username) {
        const existing = await db
          .select()
          .from(users)
          .where(eq(users.username, input.username))
          .limit(1);

        if (existing.length > 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Username ya está en uso" });
        }
      }

      // Update user
      const updateData: any = {};
      if (input.username !== undefined) updateData.username = input.username;
      if (input.djName !== undefined) updateData.djName = input.djName;
      if (input.bio !== undefined) updateData.bio = input.bio;
      if (input.country !== undefined) updateData.country = input.country;
      if (input.socialLinks !== undefined) {
        updateData.socialLinks = JSON.stringify(input.socialLinks);
      }

      if (Object.keys(updateData).length > 0) {
        await db
          .update(users)
          .set(updateData)
          .where(eq(users.id, ctx.user.id));
      }

      return { success: true };
    }),

  /**
   * Upload profile image
   */
  uploadProfileImage: protectedProcedure
    .input(z.object({
      file: z.string(), // base64
      mimeType: z.string(),
      fileName: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Decode base64
      const fileBuffer = Buffer.from(input.file, "base64");

      // Upload to S3
      const result = await uploadImageFile(
        fileBuffer,
        input.mimeType,
        input.fileName,
        ctx.user.id
      );

      if (isUploadError(result)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: result.error });
      }

      // Update user profile
      await db
        .update(users)
        .set({
          profileImageUrl: result.fileUrl,
          profileImageKey: result.fileKey,
        })
        .where(eq(users.id, ctx.user.id));

      return {
        fileUrl: result.fileUrl,
        fileKey: result.fileKey,
      };
    }),

  /**
   * Get own profile for editing
   */
  getOwnProfile: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      if (user.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuario no encontrado" });
      }

      const profile = user[0];

      // Parse social links
      let socialLinks: Record<string, string> = {};
      if (profile.socialLinks) {
        try {
          socialLinks = JSON.parse(profile.socialLinks);
        } catch (e) {
          socialLinks = {};
        }
      }

      return {
        id: profile.id,
        username: profile.username,
        djName: profile.djName,
        name: profile.name,
        email: profile.email,
        bio: profile.bio,
        profileImageUrl: profile.profileImageUrl || profile.avatarUrl,
        country: profile.country,
        socialLinks,
        membershipStatus: profile.membershipStatus,
        isVerified: profile.isVerified,
      };
    }),
});
