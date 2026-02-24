import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/trpc";

/**
 * Tests for Uploads Router
 * Tests upload validation, limits, and file handling
 */

describe("Uploads Router", () => {
  // Mock authenticated context
  const mockAuthContext: TrpcContext = {
    user: {
      id: 1,
      openId: "test-user",
      name: "Test User",
      email: "test@example.com",
      membershipStatus: "member",
      role: "user",
    },
    req: {} as any,
    res: {} as any,
  };

  // Mock free user context
  const mockFreeContext: TrpcContext = {
    user: {
      id: 2,
      openId: "free-user",
      name: "Free User",
      email: "free@example.com",
      membershipStatus: "free",
      role: "user",
    },
    req: {} as any,
    res: {} as any,
  };

  describe("getUploadLimits", () => {
    it("should return correct limits for free user", async () => {
      const caller = appRouter.createCaller(mockFreeContext);
      const result = await caller.uploads.getUploadLimits();

      expect(result.membershipStatus).toBe("free");
      expect(result.limits.maxUploadsPerMonth).toBe(10);
      expect(result.limits.maxFileSizeMB).toBe(100);
      expect(result.limits.supportedFormats).toEqual(["MP3", "WAV"]);
    });

    it("should return correct limits for member user", async () => {
      const caller = appRouter.createCaller(mockAuthContext);
      const result = await caller.uploads.getUploadLimits();

      expect(result.membershipStatus).toBe("member");
      expect(result.limits.maxUploadsPerMonth).toBe(-1); // Unlimited
      expect(result.limits.maxFileSizeMB).toBe(100);
      expect(result.limits.supportedFormats).toContain("MP3");
      expect(result.limits.supportedFormats).toContain("WAV");
    });

    it("should return unlimited for verified user", async () => {
      const verifiedContext: TrpcContext = {
        ...mockAuthContext,
        user: { ...mockAuthContext.user!, membershipStatus: "verified" },
      };
      const caller = appRouter.createCaller(verifiedContext);
      const result = await caller.uploads.getUploadLimits();

      expect(result.membershipStatus).toBe("verified");
      expect(result.limits.maxUploadsPerMonth).toBe(-1); // Unlimited
    });
  });

  describe("validateFile", () => {
    it("should validate MP3 file correctly", async () => {
      const caller = appRouter.createCaller(mockAuthContext);
      const result = await caller.uploads.validateFile({
        mimeType: "audio/mpeg",
        sizeBytes: 10 * 1024 * 1024, // 10MB
        fileType: "audio",
      });

      expect(result.valid).toBe(true);
      expect(result.message).toBe("Archivo válido");
    });

    it("should validate WAV file correctly", async () => {
      const caller = appRouter.createCaller(mockAuthContext);
      const result = await caller.uploads.validateFile({
        mimeType: "audio/wav",
        sizeBytes: 50 * 1024 * 1024, // 50MB
        fileType: "audio",
      });

      expect(result.valid).toBe(true);
    });

    it("should reject file that is too large", async () => {
      const caller = appRouter.createCaller(mockAuthContext);
      const result = await caller.uploads.validateFile({
        mimeType: "audio/mpeg",
        sizeBytes: 150 * 1024 * 1024, // 150MB (exceeds 100MB limit)
        fileType: "audio",
      });

      expect(result.valid).toBe(false);
      expect(result.message).toContain("demasiado grande");
    });

    it("should reject unsupported audio format", async () => {
      const caller = appRouter.createCaller(mockAuthContext);
      const result = await caller.uploads.validateFile({
        mimeType: "audio/ogg",
        sizeBytes: 10 * 1024 * 1024,
        fileType: "audio",
      });

      expect(result.valid).toBe(false);
      expect(result.message).toContain("no soportado");
    });

    it("should reject file with excessive duration", async () => {
      const caller = appRouter.createCaller(mockAuthContext);
      const result = await caller.uploads.validateFile({
        mimeType: "audio/mpeg",
        sizeBytes: 50 * 1024 * 1024,
        durationSeconds: 20 * 60, // 20 minutes (exceeds 15 min limit)
        fileType: "audio",
      });

      expect(result.valid).toBe(false);
      expect(result.message).toContain("demasiado larga");
    });

    it("should validate image file correctly", async () => {
      const caller = appRouter.createCaller(mockAuthContext);
      const result = await caller.uploads.validateFile({
        mimeType: "image/jpeg",
        sizeBytes: 5 * 1024 * 1024, // 5MB
        fileType: "image",
      });

      expect(result.valid).toBe(true);
    });

    it("should reject image that is too large", async () => {
      const caller = appRouter.createCaller(mockAuthContext);
      const result = await caller.uploads.validateFile({
        mimeType: "image/jpeg",
        sizeBytes: 15 * 1024 * 1024, // 15MB (exceeds 10MB limit)
        fileType: "image",
      });

      expect(result.valid).toBe(false);
      expect(result.message).toContain("demasiado grande");
    });

    it("should reject unsupported image format", async () => {
      const caller = appRouter.createCaller(mockAuthContext);
      const result = await caller.uploads.validateFile({
        mimeType: "image/gif",
        sizeBytes: 2 * 1024 * 1024,
        fileType: "image",
      });

      expect(result.valid).toBe(false);
      expect(result.message).toContain("no soportado");
    });
  });

  describe("uploadAudio - authentication", () => {
    it("should require authentication", async () => {
      const unauthContext: TrpcContext = {
        user: null,
        req: {} as any,
        res: {} as any,
      };
      const caller = appRouter.createCaller(unauthContext);

      await expect(
        caller.uploads.uploadAudio({
          fileData: "base64data",
          fileName: "test.mp3",
          mimeType: "audio/mpeg",
          sizeBytes: 1024,
        })
      ).rejects.toThrow();
    });
  });

  describe("uploadCover - authentication", () => {
    it("should require authentication", async () => {
      const unauthContext: TrpcContext = {
        user: null,
        req: {} as any,
        res: {} as any,
      };
      const caller = appRouter.createCaller(unauthContext);

      await expect(
        caller.uploads.uploadCover({
          fileData: "base64data",
          fileName: "cover.jpg",
          mimeType: "image/jpeg",
          sizeBytes: 1024,
        })
      ).rejects.toThrow();
    });
  });
});
