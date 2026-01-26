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
    create: memberProcedure
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
        energy: z.number().int().min(1).max(10).optional(),
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

  downloads: router({
    record: memberProcedure
      .input(z.object({
        trackId: z.number().int(),
        artistId: z.number().int(),
      }))
      .mutation(async ({ ctx, input }) => {
        const ipAddress = ctx.req.headers["x-forwarded-for"] as string || ctx.req.socket.remoteAddress || "";
        
        const recentDownloads = await db.checkIPDownloadLimit(ipAddress, 24);
        if (recentDownloads > 100) {
          await db.logFraudAttempt({
            userId: ctx.user.id,
            ipAddress,
            action: "download",
            reason: "Exceso de descargas desde misma IP",
            severity: "high",
            isBlocked: true,
          });
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Límite de descargas excedido",
          });
        }

        await db.recordDownload({
          userId: ctx.user.id,
          trackId: input.trackId,
          artistId: input.artistId,
          ipAddress,
          country: ctx.req.headers["cf-ipcountry"] as string || null,
          device: ctx.req.headers["user-agent"] || null,
          userAgent: ctx.req.headers["user-agent"] || null,
        });

        return { success: true };
      }),

    myDownloads: protectedProcedure
      .input(z.object({ limit: z.number().int().min(1).max(100).optional() }))
      .query(async ({ ctx, input }) => {
        return await db.getDownloadsByUser(ctx.user.id, input.limit);
      }),

    myArtistDownloads: protectedProcedure
      .input(z.object({ limit: z.number().int().min(1).max(100).optional() }))
      .query(async ({ ctx, input }) => {
        return await db.getDownloadsByArtist(ctx.user.id, input.limit);
      }),
  }),

  wallet: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await db.getOrCreateWallet(ctx.user.id);
    }),

    earnings: protectedProcedure
      .input(z.object({ limit: z.number().int().min(1).max(24).optional() }))
      .query(async ({ ctx, input }) => {
        return await db.getEarningsByUser(ctx.user.id, input.limit);
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
});

export type AppRouter = typeof appRouter;
