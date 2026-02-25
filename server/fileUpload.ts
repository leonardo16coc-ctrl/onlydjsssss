/**
 * File Upload Service
 * Handles audio and image file uploads to S3 with validation
 */

import { storagePut } from "./storage";
import { nanoid } from "nanoid";

// File size limits (in bytes)
const MAX_AUDIO_SIZE = 200 * 1024 * 1024; // 200MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

// Allowed MIME types
const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg", // MP3
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
];

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export interface UploadResult {
  fileKey: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface UploadError {
  error: string;
  code: string;
}

/**
 * Validate audio file
 */
export function validateAudioFile(
  file: Buffer,
  mimeType: string,
  fileName: string
): UploadError | null {
  // Check file size
  if (file.length > MAX_AUDIO_SIZE) {
    return {
      error: `El archivo es demasiado grande. Máximo permitido: ${MAX_AUDIO_SIZE / 1024 / 1024}MB`,
      code: "FILE_TOO_LARGE",
    };
  }

  // Check MIME type
  if (!ALLOWED_AUDIO_TYPES.includes(mimeType.toLowerCase())) {
    return {
      error: "Formato de audio no permitido. Solo se aceptan MP3 y WAV",
      code: "INVALID_FORMAT",
    };
  }

  // Check file extension
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (!ext || !["mp3", "wav"].includes(ext)) {
    return {
      error: "Extensión de archivo no válida. Solo se aceptan .mp3 y .wav",
      code: "INVALID_EXTENSION",
    };
  }

  return null;
}

/**
 * Validate image file
 */
export function validateImageFile(
  file: Buffer,
  mimeType: string,
  fileName: string
): UploadError | null {
  // Check file size
  if (file.length > MAX_IMAGE_SIZE) {
    return {
      error: `La imagen es demasiado grande. Máximo permitido: ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
      code: "FILE_TOO_LARGE",
    };
  }

  // Check MIME type
  if (!ALLOWED_IMAGE_TYPES.includes(mimeType.toLowerCase())) {
    return {
      error: "Formato de imagen no permitido. Solo se aceptan JPG, PNG y WebP",
      code: "INVALID_FORMAT",
    };
  }

  // Check file extension
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (!ext || !["jpg", "jpeg", "png", "webp"].includes(ext)) {
    return {
      error: "Extensión de archivo no válida",
      code: "INVALID_EXTENSION",
    };
  }

  return null;
}

/**
 * Upload audio file to S3
 */
export async function uploadAudioFile(
  file: Buffer,
  mimeType: string,
  fileName: string,
  userId: number
): Promise<UploadResult | UploadError> {
  // Validate file
  const validationError = validateAudioFile(file, mimeType, fileName);
  if (validationError) {
    return validationError;
  }

  try {
    // Generate unique file key with random suffix to prevent enumeration
    const ext = fileName.split(".").pop()?.toLowerCase() || "mp3";
    const randomSuffix = nanoid(10);
    const timestamp = Date.now();
    const fileKey = `tracks/${userId}/${timestamp}-${randomSuffix}.${ext}`;

    // Upload to S3
    const result = await storagePut(fileKey, file, mimeType);

    return {
      fileKey,
      fileUrl: result.url,
      fileName,
      fileSize: file.length,
      mimeType,
    };
  } catch (error) {
    console.error("[File Upload] Error uploading audio file:", error);
    return {
      error: "Error al subir el archivo. Por favor intenta de nuevo.",
      code: "UPLOAD_FAILED",
    };
  }
}

/**
 * Upload image file to S3
 */
export async function uploadImageFile(
  file: Buffer,
  mimeType: string,
  fileName: string,
  userId: number
): Promise<UploadResult | UploadError> {
  // Validate file
  const validationError = validateImageFile(file, mimeType, fileName);
  if (validationError) {
    return validationError;
  }

  try {
    // Generate unique file key
    const ext = fileName.split(".").pop()?.toLowerCase() || "jpg";
    const randomSuffix = nanoid(10);
    const timestamp = Date.now();
    const fileKey = `covers/${userId}/${timestamp}-${randomSuffix}.${ext}`;

    // Upload to S3
    const result = await storagePut(fileKey, file, mimeType);

    return {
      fileKey,
      fileUrl: result.url,
      fileName,
      fileSize: file.length,
      mimeType,
    };
  } catch (error) {
    console.error("[File Upload] Error uploading image file:", error);
    return {
      error: "Error al subir la imagen. Por favor intenta de nuevo.",
      code: "UPLOAD_FAILED",
    };
  }
}

/**
 * Check if result is an error
 */
export function isUploadError(result: UploadResult | UploadError): result is UploadError {
  return "error" in result;
}
