import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { analyzeAudioFile, batchAnalyzeAudio } from "../musicAnalysis";

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

export const musicAnalysisRouter = router({
  /**
   * Analyze a single audio file
   */
  analyze: memberProcedure
    .input(z.object({
      audioFileUrl: z.string().url(),
      genre: z.string().optional(),
      trackType: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const analysis = await analyzeAudioFile(
        input.audioFileUrl,
        input.genre,
        input.trackType
      );

      return analysis;
    }),

  /**
   * Batch analyze multiple audio files
   */
  batchAnalyze: memberProcedure
    .input(z.object({
      files: z.array(z.object({
        url: z.string().url(),
        genre: z.string().optional(),
        trackType: z.string().optional(),
      })).min(1).max(10), // Limit to 10 files per batch
    }))
    .mutation(async ({ input }) => {
      const results = await batchAnalyzeAudio(input.files);
      return results;
    }),
});
