import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { createMembershipCheckoutSession, createPortalSession } from "./stripe";
import { TRPCError } from "@trpc/server";
import { analyzeAudioFile } from "./musicAnalysis";
import { musicAnalysisRouter } from "./routers/musicAnalysis.router";
import { profileRouter } from "./routers/profile.router";
import { searchRouter } from "./routers/search.router";
import { djModeRouter } from "./routers/djMode.router";
import { weeklyChallengesRouter } from "./routers/weeklyChallenges.router";
import { setFeedbackRouter } from "./routers/setFeedback.router";
import { dnaAnalyticsRouter } from "./routers/dnaAnalytics.router";
import { festivalIntelligenceRouter } from "./routers/festivalIntelligence.router";
import { festivalRankingsRouter } from "./routers/festivalRankings.router";
import { uploadsRouter } from "./routers/uploads.router";
import { downloadsRouter } from "./routers/downloads.router";
import { earningsRouter } from "./routers/earnings.router";
import { subscriptionsRouter } from "./routers/subscriptions.router";
import { walletRouter } from "./routers/wallet.router";
import { trackingRouter } from "./routers/tracking.router";
import { aiAnalyzerRouter } from "./routers/ai-analyzer.router";
import { communityRouter } from "./routers/community.router";
import { agentsRouter } from "./routers/agents";
import { recruitmentRouter } from "./routers/recruitment";
import { dailyQueueRouter } from "./routers/daily-queue";
import { scoutControlRouter } from "./routers/scout-control";
import { scoutStatsRouter } from "./routers/scout-stats";
import { getDb } from "./db";
import { tracks, downloads } from "../drizzle/schema";
import { eq, and, gte, sql } from "drizzle-orm";

// Middleware to check if user has active membership
const memberProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.membershipStatus === "free") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Se requiere membresía activa para esta acción",
    });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  weeklyChallenges: weeklyChallengesRouter,
  setFeedback: setFeedbackRouter,
  dnaAnalytics: dnaAnalyticsRouter,
  festivalIntelligence: festivalIntelligenceRouter,
  festivalRankings: festivalRankingsRouter,
  uploads: uploadsRouter,
  downloads: downloadsRouter,
  earnings: earningsRouter,
  subscriptions: subscriptionsRouter,
  aiAnalyzer: aiAnalyzerRouter,
  wallet: walletRouter,
  tracking: trackingRouter,
  community: communityRouter,
  agents: agentsRouter,
  recruitment: recruitmentRouter,
  dailyQueue: dailyQueueRouter,
  scoutControl: scoutControlRouter,
  scoutStats: scoutStatsRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  membership: router({
    getStatus: protectedProcedure.query(async ({ ctx }) => {
      return {
        status: ctx.user.membershipStatus,
        expiresAt: ctx.user.membershipExpiresAt,
        stripeCustomerId: ctx.user.stripeCustomerId,
      };
    }),

    createCheckout: protectedProcedure.mutation(async ({ ctx }) => {
      const origin = ctx.req.headers.origin || "http://localhost:3000";
      
      const session = await createMembershipCheckoutSession({
        userId: ctx.user.id,
        userEmail: ctx.user.email || "",
        userName: ctx.user.name || "DJ",
        successUrl: `${origin}/dashboard?payment=success`,
        cancelUrl: `${origin}/membership?payment=cancelled`,
      });

      return { checkoutUrl: session.url };
    }),

    createPortal: protectedProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user.stripeCustomerId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No se encontró información de suscripción",
        });
      }

      const origin = ctx.req.headers.origin || "http://localhost:3000";
      const session = await createPortalSession(
        ctx.user.stripeCustomerId,
        `${origin}/dashboard`
      );

      return { portalUrl: session.url };
    }),
  }),

  tracks: router({
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        artist: z.string().min(1).max(255),
        audioFileKey: z.string(),
        audioFileUrl: z.string(),
        coverImageKey: z.string().optional(),
        coverImageUrl: z.string().optional(),
        bpm: z.number().int().min(1).max(300).optional(),
        musicalKey: z.string().max(10).optional(),
        genre: z.enum([
          "Tech House", "Bass House", "Afro House", "Techno", "Melodic Techno",
          "Big Room", "EDM", "Hard Techno", "Latin", "Reggaeton", "Hip-Hop", "Open Format"
        ]),
        subgenre: z.string().max(100).optional(),
        trackType: z.enum(["Extended Mix", "Edit", "Mashup", "Remix", "Rework"]),
        energy: z.number().int().min(1).optional(),
        mood: z.string().max(100).optional(),
        tags: z.array(z.string()).optional(),
        fileFormat: z.string().max(20).optional(),
        fileSizeBytes: z.number().optional(),
        durationSeconds: z.number().int().optional(),
        isMainstage: z.boolean().optional(),
        mainstageCategory: z.enum([
          "Tech House Mainstage", "Bass House Mainstage", "Techno Mainstage",
          "Melodic Techno Mainstage", "Big Room", "EDM Festival", "Hard Techno",
          "Latin Mainstage", "Reggaeton Mainstage", "Hip-Hop Mainstage"
        ]).optional(),
        mainstageTags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Validar límite de uploads para usuarios FREE (1 por mes)
        if (ctx.user.membershipStatus === "free") {
          const dbInstance = await getDb();
          if (!dbInstance) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Error al conectar con la base de datos",
            });
          }
          
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);
          
          const uploadsThisMonth = await dbInstance
            .select({ count: sql<number>`count(*)` })
            .from(tracks)
            .where(
              and(
                eq(tracks.userId, ctx.user.id),
                gte(tracks.createdAt, startOfMonth)
              )
            );
          
          const count = Number(uploadsThisMonth[0]?.count || 0);
          if (count >= 1) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Has alcanzado tu límite de 1 upload por mes. Suscríbete por $4.99/mes para uploads ilimitados.",
            });
          }
        }
        
        // Analyze audio file automatically if BPM or key not provided
        let analysisData = null;
        if (!input.bpm || !input.musicalKey) {
          try {
            analysisData = await analyzeAudioFile(
              input.audioFileUrl,
              input.genre,
              input.trackType
            );
          } catch (error) {
            console.error("[Tracks] Error analyzing audio:", error);
            // Continue without analysis if it fails
          }
        }

        await db.createTrack({
          userId: ctx.user.id,
          ...input,
          bpm: input.bpm || analysisData?.bpm,
          musicalKey: input.musicalKey || analysisData?.musicalKey,
          energy: input.energy || (analysisData ? Math.round(analysisData.energy / 10) : undefined),
          mood: input.mood || analysisData?.mood,
          tags: input.tags ? JSON.stringify(input.tags) : null,
          mainstageTags: input.mainstageTags ? JSON.stringify(input.mainstageTags) : null,
        });

        return { 
          success: true,
          analysis: analysisData ? {
            bpm: analysisData.bpm,
            musicalKey: analysisData.musicalKey,
            energy: analysisData.energy,
            mood: analysisData.mood,
            structure: analysisData.structure,
            confidence: analysisData.confidence
          } : null
        };
      }),

    list: publicProcedure
      .input(z.object({
        limit: z.number().int().min(1).max(100).optional(),
        offset: z.number().int().min(0).optional(),
        genre: z.string().optional(),
        bpmMin: z.number().int().optional(),
        bpmMax: z.number().int().optional(),
        key: z.string().optional(),
        trackType: z.string().optional(),
        isMainstage: z.boolean().optional(),
        query: z.string().optional(),
      }))
      .query(async ({ input }) => {
        if (input.query || input.genre || input.bpmMin || input.bpmMax || input.key || input.trackType || input.isMainstage !== undefined) {
          return await db.searchTracks(input);
        }
        return await db.getAllTracks(input.limit, input.offset);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number().int() }))
      .query(async ({ input }) => {
        const track = await db.getTrackById(input.id);
        if (!track) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Track no encontrado" });
        }
        return track;
      }),

    myTracks: protectedProcedure
      .input(z.object({ limit: z.number().int().min(1).max(100).optional() }))
      .query(async ({ ctx, input }) => {
        return await db.getTracksByUserId(ctx.user.id, input.limit);
      }),

    incrementPlays: publicProcedure
      .input(z.object({ trackId: z.number().int() }))
      .mutation(async ({ input }) => {
        await db.incrementTrackPlays(input.trackId);
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number().int(),
        title: z.string().min(1).max(255).optional(),
        artist: z.string().min(1).max(255).optional(),
        coverImageKey: z.string().optional(),
        coverImageUrl: z.string().optional(),
        bpm: z.number().int().min(1).max(300).optional(),
        musicalKey: z.string().max(10).optional(),
        genre: z.enum([
          "Tech House", "Bass House", "Afro House", "Techno", "Melodic Techno",
          "Big Room", "EDM", "Hard Techno", "Latin", "Reggaeton", "Hip-Hop", "Open Format"
        ]).optional(),
        trackType: z.enum(["Extended Mix", "Edit", "Mashup", "Remix", "Rework"]).optional(),
        energy: z.number().int().min(1).optional(),
        mood: z.string().max(100).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await getDb();
        if (!dbInstance) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error al conectar con la base de datos",
          });
        }

        // Verificar que el track existe y pertenece al usuario
        const existingTrack = await dbInstance
          .select()
          .from(tracks)
          .where(eq(tracks.id, input.id))
          .limit(1);

        if (!existingTrack || existingTrack.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Track no encontrado",
          });
        }

        if (existingTrack[0].userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permiso para editar este track",
          });
        }

        // Actualizar solo los campos proporcionados
        const updateData: any = {};
        if (input.title !== undefined) updateData.title = input.title;
        if (input.artist !== undefined) updateData.artist = input.artist;
        if (input.coverImageKey !== undefined) updateData.coverImageKey = input.coverImageKey;
        if (input.coverImageUrl !== undefined) updateData.coverImageUrl = input.coverImageUrl;
        if (input.bpm !== undefined) updateData.bpm = input.bpm;
        if (input.musicalKey !== undefined) updateData.musicalKey = input.musicalKey;
        if (input.genre !== undefined) updateData.genre = input.genre;
        if (input.trackType !== undefined) updateData.trackType = input.trackType;
        if (input.energy !== undefined) updateData.energy = input.energy;
        if (input.mood !== undefined) updateData.mood = input.mood;
        updateData.updatedAt = new Date();

        await dbInstance
          .update(tracks)
          .set(updateData)
          .where(eq(tracks.id, input.id));

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({
        id: z.number().int(),
      }))
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await getDb();
        if (!dbInstance) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error al conectar con la base de datos",
          });
        }

        // Verificar que el track existe y pertenece al usuario
        const existingTrack = await dbInstance
          .select()
          .from(tracks)
          .where(eq(tracks.id, input.id))
          .limit(1);

        if (!existingTrack || existingTrack.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Track no encontrado",
          });
        }

        if (existingTrack[0].userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permiso para eliminar este track",
          });
        }

        // TODO: Eliminar archivos de S3 (audio, cover, preview)
        // const track = existingTrack[0];
        // if (track.audioFileKey) await storageDelete(track.audioFileKey);
        // if (track.coverImageKey) await storageDelete(track.coverImageKey);
        // if (track.previewFileKey) await storageDelete(track.previewFileKey);

        // Eliminar el track de la base de datos
        await dbInstance
          .delete(tracks)
          .where(eq(tracks.id, input.id));

        return { success: true };
      }),

    toggleLike: protectedProcedure
      .input(z.object({ trackId: z.number().int() }))
      .mutation(async ({ ctx, input }) => {
        const liked = await db.toggleLike(ctx.user.id, input.trackId);
        return { liked };
      }),

    myLikes: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserLikes(ctx.user.id);
    }),
  }),

  rankings: router({
    topDJs: publicProcedure
      .input(z.object({ limit: z.number().int().min(1).max(100).optional() }))
      .query(async ({ input }) => {
        return await db.getTopDJs(input.limit || 100);
      }),

    trending: publicProcedure
      .input(z.object({
        days: z.number().int().min(1).max(30).optional(),
        limit: z.number().int().min(1).max(100).optional(),
      }))
      .query(async ({ input }) => {
        return await db.getTrendingTracks(input.days || 7, input.limit || 50);
      }),

    mainstage: publicProcedure
      .input(z.object({ limit: z.number().int().min(1).max(100).optional() }))
      .query(async ({ input }) => {
        return await db.getMainstageTracks(input.limit || 50);
      }),
  }),

  musicAnalysis: musicAnalysisRouter,

  dashboard: router({
    stats: protectedProcedure.query(async ({ ctx }) => {
      const tracks = await db.getTracksByUserId(ctx.user.id, 1000);
      const downloads = await db.getDownloadsByArtist(ctx.user.id, 1000);
      const wallet = await db.getOrCreateWallet(ctx.user.id);

      const totalDownloads = downloads.length;
      const totalTracks = tracks.length;
      const totalEarnings = parseFloat(wallet.totalEarnings || "0");

      const now = new Date();
      const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const monthStats = await db.getDownloadStats(ctx.user.id, thisMonth);

      return {
        totalDownloads,
        totalTracks,
        totalEarnings,
        monthlyDownloads: monthStats.total,
        availableBalance: parseFloat(wallet.availableBalance || "0"),
        pendingBalance: parseFloat(wallet.pendingBalance || "0"),
      };
    }),
  }),

  // Profile router
  profile: profileRouter,

  // Search router
  search: searchRouter,

  // DJ MODE router
  djMode: djModeRouter,
});

export type AppRouter = typeof appRouter;
