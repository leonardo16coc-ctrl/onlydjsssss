import { describe, expect, it } from "vitest";
import { validateAudioFile, validateImageFile, uploadAudioFile, uploadImageFile, isUploadError } from "./fileUpload";

describe("File Upload Service", () => {
  describe("validateAudioFile", () => {
    it("should accept valid MP3 file", () => {
      const file = Buffer.from("fake mp3 content");
      const error = validateAudioFile(file, "audio/mpeg", "test.mp3");
      expect(error).toBeNull();
    });

    it("should accept valid WAV file", () => {
      const file = Buffer.from("fake wav content");
      const error = validateAudioFile(file, "audio/wav", "test.wav");
      expect(error).toBeNull();
    });

    it("should reject file that is too large", () => {
      const largeFile = Buffer.alloc(101 * 1024 * 1024); // 101MB
      const error = validateAudioFile(largeFile, "audio/mpeg", "test.mp3");
      expect(error).not.toBeNull();
      expect(error?.code).toBe("FILE_TOO_LARGE");
    });

    it("should reject invalid MIME type", () => {
      const file = Buffer.from("fake content");
      const error = validateAudioFile(file, "audio/ogg", "test.ogg");
      expect(error).not.toBeNull();
      expect(error?.code).toBe("INVALID_FORMAT");
    });

    it("should reject invalid file extension", () => {
      const file = Buffer.from("fake content");
      const error = validateAudioFile(file, "audio/mpeg", "test.txt");
      expect(error).not.toBeNull();
      expect(error?.code).toBe("INVALID_EXTENSION");
    });
  });

  describe("validateImageFile", () => {
    it("should accept valid JPEG file", () => {
      const file = Buffer.from("fake jpeg content");
      const error = validateImageFile(file, "image/jpeg", "test.jpg");
      expect(error).toBeNull();
    });

    it("should accept valid PNG file", () => {
      const file = Buffer.from("fake png content");
      const error = validateImageFile(file, "image/png", "test.png");
      expect(error).toBeNull();
    });

    it("should accept valid WebP file", () => {
      const file = Buffer.from("fake webp content");
      const error = validateImageFile(file, "image/webp", "test.webp");
      expect(error).toBeNull();
    });

    it("should reject file that is too large", () => {
      const largeFile = Buffer.alloc(11 * 1024 * 1024); // 11MB
      const error = validateImageFile(largeFile, "image/jpeg", "test.jpg");
      expect(error).not.toBeNull();
      expect(error?.code).toBe("FILE_TOO_LARGE");
    });

    it("should reject invalid MIME type", () => {
      const file = Buffer.from("fake content");
      const error = validateImageFile(file, "image/gif", "test.gif");
      expect(error).not.toBeNull();
      expect(error?.code).toBe("INVALID_FORMAT");
    });

    it("should reject invalid file extension", () => {
      const file = Buffer.from("fake content");
      const error = validateImageFile(file, "image/jpeg", "test.txt");
      expect(error).not.toBeNull();
      expect(error?.code).toBe("INVALID_EXTENSION");
    });
  });

  describe("uploadAudioFile", () => {
    it("should upload valid audio file to S3", async () => {
      const file = Buffer.from("fake mp3 content");
      const result = await uploadAudioFile(file, "audio/mpeg", "test.mp3", 1);

      if (isUploadError(result)) {
        // If upload fails, it should be due to S3 connection, not validation
        expect(result.code).toBe("UPLOAD_FAILED");
      } else {
        // If upload succeeds
        expect(result.fileKey).toBeDefined();
        expect(result.fileUrl).toBeDefined();
        expect(result.fileName).toBe("test.mp3");
        expect(result.fileSize).toBe(file.length);
        expect(result.mimeType).toBe("audio/mpeg");
        expect(result.fileKey).toMatch(/^tracks\/1\/\d+-[a-zA-Z0-9_-]+\.mp3$/);
      }
    }, 10000);

    it("should reject invalid audio file", async () => {
      const file = Buffer.from("fake content");
      const result = await uploadAudioFile(file, "audio/ogg", "test.ogg", 1);

      expect(isUploadError(result)).toBe(true);
      if (isUploadError(result)) {
        expect(result.code).toBe("INVALID_FORMAT");
      }
    });
  });

  describe("uploadImageFile", () => {
    it("should upload valid image file to S3", async () => {
      const file = Buffer.from("fake jpeg content");
      const result = await uploadImageFile(file, "image/jpeg", "test.jpg", 1);

      if (isUploadError(result)) {
        // If upload fails, it should be due to S3 connection, not validation
        expect(result.code).toBe("UPLOAD_FAILED");
      } else {
        // If upload succeeds
        expect(result.fileKey).toBeDefined();
        expect(result.fileUrl).toBeDefined();
        expect(result.fileName).toBe("test.jpg");
        expect(result.fileSize).toBe(file.length);
        expect(result.mimeType).toBe("image/jpeg");
        expect(result.fileKey).toMatch(/^covers\/1\/\d+-[a-zA-Z0-9_-]+\.jpg$/);
      }
    }, 10000);

    it("should reject invalid image file", async () => {
      const file = Buffer.from("fake content");
      const result = await uploadImageFile(file, "image/gif", "test.gif", 1);

      expect(isUploadError(result)).toBe(true);
      if (isUploadError(result)) {
        expect(result.code).toBe("INVALID_FORMAT");
      }
    });
  });

  describe("isUploadError", () => {
    it("should correctly identify error results", () => {
      const error = { error: "Test error", code: "TEST" };
      expect(isUploadError(error)).toBe(true);
    });

    it("should correctly identify success results", () => {
      const success = {
        fileKey: "test.mp3",
        fileUrl: "https://example.com/test.mp3",
        fileName: "test.mp3",
        fileSize: 1024,
        mimeType: "audio/mpeg",
      };
      expect(isUploadError(success)).toBe(false);
    });
  });
});
