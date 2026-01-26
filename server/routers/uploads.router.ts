import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { storagePut } from "../storage";

/**
 * Uploads Router - Professional file upload system
 * 
 * Features:
 * - Multi-format support (MP3, WAV, AIFF, FLAC)
 * - File size validation (max 100MB)
 * - Duration validation (max 15 minutes)
 * - Organized S3 structure
 * - Unique file naming with random suffixes
 * - Progress tracking
 */

// Supported audio formats
const SUPPORTED_AUDIO_FORMATS = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/aiff", "audio/x-aiff", "audio/flac"];
const SUPPORTED_IMAGE_FORMATS = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// File size limits
const MAX_AUDIO_SIZE_MB = 100;
const MAX_AUDIO_SIZE_BYTES = MAX_AUDIO_SIZE_MB * 1024 * 1024; // 100 MB
const MAX_IMAGE_SIZE_MB = 10;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024; // 10 MB

// Duration limit
const MAX_DURATION_SECONDS = 15 * 60; // 15 minutes

/**
 * Generate random suffix for unique file names
 */
function generateRandomSuffix(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Get file extension from MIME type
 */
function getExtensionFromMimeType(mimeType: string): string {
  const mimeMap: Record<string, string> = {
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
    "audio/aiff": "aiff",
    "audio/x-aiff": "aiff",
    "audio/flac": "flac",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return mimeMap[mimeType.toLowerCase()] || "bin";
}

/**
 * Validate audio file
 */
function validateAudioFile(mimeType: string, sizeBytes: number, durationSeconds?: number) {
  // Validate MIME type
  if (!SUPPORTED_AUDIO_FORMATS.includes(mimeType.toLowerCase())) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Formato de audio no soportado. Formatos permitidos: MP3, WAV, AIFF, FLAC. Recibido: ${mimeType}`,
    });
  }

  // Validate size
  if (sizeBytes > MAX_AUDIO_SIZE_BYTES) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Archivo demasiado grande. Tamaño máximo: ${MAX_AUDIO_SIZE_MB}MB. Tamaño actual: ${(sizeBytes / 1024 / 1024).toFixed(2)}MB`,
    });
  }

  // Validate duration if provided
  if (durationSeconds && durationSeconds > MAX_DURATION_SECONDS) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Duración demasiado larga. Duración máxima: ${MAX_DURATION_SECONDS / 60} minutos. Duración actual: ${(durationSeconds / 60).toFixed(2)} minutos`,
    });
  }
}

/**
 * Validate image file
 */
function validateImageFile(mimeType: string, sizeBytes: number) {
  // Validate MIME type
  if (!SUPPORTED_IMAGE_FORMATS.includes(mimeType.toLowerCase())) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Formato de imagen no soportado. Formatos permitidos: JPEG, PNG, WEBP. Recibido: ${mimeType}`,
    });
  }

  // Validate size
  if (sizeBytes > MAX_IMAGE_SIZE_BYTES) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Imagen demasiado grande. Tamaño máximo: ${MAX_IMAGE_SIZE_MB}MB. Tamaño actual: ${(sizeBytes / 1024 / 1024).toFixed(2)}MB`,
    });
  }
}

export const uploadsRouter = router({
  /**
   * Upload audio file to S3
   * Organized structure: /users/{userId}/uploads/{filename}-{random}.{ext}
   */
  uploadAudio: protectedProcedure
    .input(z.object({
      fileData: z.string(), // Base64 encoded file data
      fileName: z.string(),
      mimeType: z.string(),
      sizeBytes: z.number(),
      durationSeconds: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Validate file
      validateAudioFile(input.mimeType, input.sizeBytes, input.durationSeconds);

      // Generate unique file key
      const extension = getExtensionFromMimeType(input.mimeType);
      const randomSuffix = generateRandomSuffix();
      const cleanFileName = input.fileName.replace(/\.[^/.]+$/, ""); // Remove extension
      const fileKey = `users/${ctx.user.id}/uploads/${cleanFileName}-${randomSuffix}.${extension}`;

      // Decode base64 data
      const buffer = Buffer.from(input.fileData, "base64");

      // Upload to S3
      try {
        const result = await storagePut(fileKey, buffer, input.mimeType);

        return {
          success: true,
          fileKey: result.key,
          fileUrl: result.url,
          sizeBytes: input.sizeBytes,
          format: extension.toUpperCase(),
        };
      } catch (error) {
        console.error("[Uploads] Error uploading audio to S3:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al subir archivo de audio. Por favor intenta de nuevo.",
        });
      }
    }),

  /**
   * Upload cover image to S3
   * Organized structure: /covers/{userId}/{filename}-{random}.{ext}
   */
  uploadCover: protectedProcedure
    .input(z.object({
      fileData: z.string(), // Base64 encoded file data
      fileName: z.string(),
      mimeType: z.string(),
      sizeBytes: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Validate file
      validateImageFile(input.mimeType, input.sizeBytes);

      // Generate unique file key
      const extension = getExtensionFromMimeType(input.mimeType);
      const randomSuffix = generateRandomSuffix();
      const cleanFileName = input.fileName.replace(/\.[^/.]+$/, ""); // Remove extension
      const fileKey = `covers/${ctx.user.id}/${cleanFileName}-${randomSuffix}.${extension}`;

      // Decode base64 data
      const buffer = Buffer.from(input.fileData, "base64");

      // Upload to S3
      try {
        const result = await storagePut(fileKey, buffer, input.mimeType);

        return {
          success: true,
          fileKey: result.key,
          fileUrl: result.url,
        };
      } catch (error) {
        console.error("[Uploads] Error uploading cover to S3:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al subir imagen de portada. Por favor intenta de nuevo.",
        });
      }
    }),

  /**
   * Get upload limits for current user
   */
  getUploadLimits: protectedProcedure.query(async ({ ctx }) => {
    // Get user's membership status
    const membershipStatus = ctx.user.membershipStatus || "free";

    // Define limits by membership level
    const limits = {
      free: {
        maxUploadsPerMonth: 5,
        maxFileSizeMB: MAX_AUDIO_SIZE_MB,
        maxDurationMinutes: MAX_DURATION_SECONDS / 60,
        supportedFormats: ["MP3", "WAV"],
      },
      member: {
        maxUploadsPerMonth: 50,
        maxFileSizeMB: MAX_AUDIO_SIZE_MB,
        maxDurationMinutes: MAX_DURATION_SECONDS / 60,
        supportedFormats: ["MP3", "WAV", "AIFF", "FLAC"],
      },
      verified: {
        maxUploadsPerMonth: -1, // Unlimited
        maxFileSizeMB: MAX_AUDIO_SIZE_MB,
        maxDurationMinutes: MAX_DURATION_SECONDS / 60,
        supportedFormats: ["MP3", "WAV", "AIFF", "FLAC"],
      },
    };

    return {
      membershipStatus,
      limits: limits[membershipStatus],
    };
  }),

  /**
   * Validate file before upload (client-side check)
   */
  validateFile: publicProcedure
    .input(z.object({
      mimeType: z.string(),
      sizeBytes: z.number(),
      durationSeconds: z.number().optional(),
      fileType: z.enum(["audio", "image"]),
    }))
    .query(({ input }) => {
      try {
        if (input.fileType === "audio") {
          validateAudioFile(input.mimeType, input.sizeBytes, input.durationSeconds);
        } else {
          validateImageFile(input.mimeType, input.sizeBytes);
        }

        return {
          valid: true,
          message: "Archivo válido",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          return {
            valid: false,
            message: error.message,
          };
        }
        return {
          valid: false,
          message: "Error al validar archivo",
        };
      }
    }),
});
