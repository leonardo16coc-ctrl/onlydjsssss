import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { tracks } from "../../drizzle/schema";
import { eq, sql } from "drizzle-orm";

/**
 * Tracking Router - Track streams, minutes listened, favorites, playlists
 * 
 * Features:
 * - Track stream (play) events
 * - Track listening time
 * - Track favorites
 * - Track playlist additions
 * - Real-time metrics for DJ Score calculation
 */

export const trackingRouter = router({
  /**
   * Track a stream (play) event
   * Called when user plays a track
   */
  trackStream: publicProcedure
    .input(z.object({
      trackId: z.number().int(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      // Increment stream count
      await db
        .update(tracks)
        .set({ streamCount: sql`${tracks.streamCount} + 1` })
        .where(eq(tracks.id, input.trackId));

      return { success: true };
    }),

  /**
   * Track listening time
   * Called periodically while user is listening (e.g., every 30 seconds)
   */
  trackListeningTime: publicProcedure
    .input(z.object({
      trackId: z.number().int(),
      secondsListened: z.number().int().min(1).max(3600), // Max 1 hour per event
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      // Convert seconds to minutes (rounded)
      const minutesListened = Math.ceil(input.secondsListened / 60);

      // Increment minutes listened
      await db
        .update(tracks)
        .set({ minutesListened: sql`${tracks.minutesListened} + ${minutesListened}` })
        .where(eq(tracks.id, input.trackId));

      return { success: true, minutesAdded: minutesListened };
    }),

  /**
   * Add track to favorites
   */
  addToFavorites: protectedProcedure
    .input(z.object({
      trackId: z.number().int(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      // Increment favorites count
      await db
        .update(tracks)
        .set({ favoritesCount: sql`${tracks.favoritesCount} + 1` })
        .where(eq(tracks.id, input.trackId));

      return { success: true };
    }),

  /**
   * Remove track from favorites
   */
  removeFromFavorites: protectedProcedure
    .input(z.object({
      trackId: z.number().int(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      // Decrement favorites count (ensure non-negative)
      await db
        .update(tracks)
        .set({ favoritesCount: sql`GREATEST(0, ${tracks.favoritesCount} - 1)` })
        .where(eq(tracks.id, input.trackId));

      return { success: true };
    }),

  /**
   * Add track to playlist
   */
  addToPlaylist: protectedProcedure
    .input(z.object({
      trackId: z.number().int(),
      playlistId: z.number().int().optional(), // For future playlist feature
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      // Increment playlists count
      await db
        .update(tracks)
        .set({ playlistsCount: sql`${tracks.playlistsCount} + 1` })
        .where(eq(tracks.id, input.trackId));

      return { success: true };
    }),

  /**
   * Remove track from playlist
   */
  removeFromPlaylist: protectedProcedure
    .input(z.object({
      trackId: z.number().int(),
      playlistId: z.number().int().optional(), // For future playlist feature
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      // Decrement playlists count (ensure non-negative)
      await db
        .update(tracks)
        .set({ playlistsCount: sql`GREATEST(0, ${tracks.playlistsCount} - 1)` })
        .where(eq(tracks.id, input.trackId));

      return { success: true };
    }),

  /**
   * Get track metrics (for display)
   */
  getTrackMetrics: publicProcedure
    .input(z.object({
      trackId: z.number().int(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const result = await db
        .select({
          downloadCount: tracks.downloadCount,
          streamCount: tracks.streamCount,
          minutesListened: tracks.minutesListened,
          likeCount: tracks.likeCount,
          favoritesCount: tracks.favoritesCount,
          playlistsCount: tracks.playlistsCount,
        })
        .from(tracks)
        .where(eq(tracks.id, input.trackId))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Track not found" });
      }

      return result[0];
    }),

  /**
   * Batch track listening time (for multiple tracks in a session)
   * Useful for DJ sets or playlists
   */
  batchTrackListeningTime: publicProcedure
    .input(z.object({
      tracks: z.array(z.object({
        trackId: z.number().int(),
        secondsListened: z.number().int().min(1).max(3600),
      })).max(50), // Max 50 tracks per batch
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      // Update each track
      for (const track of input.tracks) {
        const minutesListened = Math.ceil(track.secondsListened / 60);
        
        await db
          .update(tracks)
          .set({ 
            minutesListened: sql`${tracks.minutesListened} + ${minutesListened}`,
            streamCount: sql`${tracks.streamCount} + 1`, // Also count as stream
          })
          .where(eq(tracks.id, track.trackId));
      }

      return { 
        success: true, 
        tracksUpdated: input.tracks.length 
      };
    }),
});
