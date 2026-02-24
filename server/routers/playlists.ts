import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { eq, and, desc, sql } from "drizzle-orm";
import { playlists, playlistTracks, tracks, users } from "../../drizzle/schema";
import * as db from "../db";

export const playlistsRouter = router({
  // Create a new playlist
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        coverImageUrl: z.string().optional(),
        isPublic: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const newPlaylist = await db.createPlaylist({
        userId: ctx.user.id,
        name: input.name,
        description: input.description,
        coverImageUrl: input.coverImageUrl,
        isPublic: input.isPublic,
      });

      return newPlaylist;
    }),

  // Get all playlists for current user
  getMyPlaylists: protectedProcedure.query(async ({ ctx }) => {
    const userPlaylists = await db.getPlaylistsByUser(ctx.user.id);
    return userPlaylists;
  }),

  // Get playlist by ID (public or owned by user)
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const playlist = await db.getPlaylistById(input.id);

      if (!playlist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist not found",
        });
      }

      // Check if playlist is public or owned by current user
      const isOwner = ctx.user?.id === playlist.userId;
      const isPublic = playlist.isPublic;

      if (!isPublic && !isOwner) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This playlist is private",
        });
      }

      return playlist;
    }),

  // Add track to playlist
  addTrack: protectedProcedure
    .input(
      z.object({
        playlistId: z.number(),
        trackId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const success = await db.addTrackToPlaylist(
        input.playlistId,
        input.trackId,
        ctx.user.id
      );

      if (!success) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't own this playlist or track already exists",
        });
      }

      return { success: true };
    }),

  // Remove track from playlist
  removeTrack: protectedProcedure
    .input(
      z.object({
        playlistId: z.number(),
        trackId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const success = await db.removeTrackFromPlaylist(
        input.playlistId,
        input.trackId,
        ctx.user.id
      );

      if (!success) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't own this playlist",
        });
      }

      return { success: true };
    }),

  // Update playlist
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        coverImageUrl: z.string().optional(),
        isPublic: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const success = await db.updatePlaylist(input.id, ctx.user.id, {
        name: input.name,
        description: input.description,
        coverImageUrl: input.coverImageUrl,
        isPublic: input.isPublic,
      });

      if (!success) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't own this playlist",
        });
      }

      return { success: true };
    }),

  // Delete playlist
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const success = await db.deletePlaylist(input.id, ctx.user.id);

      if (!success) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't own this playlist",
        });
      }

      return { success: true };
    }),
});
