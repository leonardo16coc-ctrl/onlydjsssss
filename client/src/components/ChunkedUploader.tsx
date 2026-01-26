/**
 * ChunkedUploader Component
 * Handles resumable file uploads using tus protocol
 */

import { useState, useRef } from "react";
import * as tus from "tus-js-client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload as UploadIcon, X, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ChunkedUploaderProps {
  userId: number;
  onUploadComplete: (result: UploadResult) => void;
  onUploadError?: (error: string) => void;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
}

interface UploadResult {
  fileKey: string;
  fileUrl: string;
  fileSize: number;
  fileName: string;
  mimeType: string;
}

export default function ChunkedUploader({
  userId,
  onUploadComplete,
  onUploadError,
  maxSize = 100 * 1024 * 1024, // 100MB default
  acceptedTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/wave", "audio/x-wav"],
}: ChunkedUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const uploadRef = useRef<tus.Upload | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size
    if (selectedFile.size > maxSize) {
      const maxSizeMB = (maxSize / 1024 / 1024).toFixed(0);
      toast.error(`Archivo demasiado grande. Máximo: ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    if (!acceptedTypes.includes(selectedFile.type.toLowerCase())) {
      toast.error("Formato no permitido. Solo MP3 y WAV.");
      return;
    }

    setFile(selectedFile);
    setUploadStatus("idle");
    setUploadProgress(0);
    setErrorMessage("");
  };

  const startUpload = () => {
    if (!file) return;

    setIsUploading(true);
    setUploadStatus("uploading");
    setUploadProgress(0);

    const upload = new tus.Upload(file, {
      endpoint: "/api/upload/chunked",
      retryDelays: [0, 1000, 3000, 5000, 10000], // Retry with exponential backoff
      chunkSize: 5 * 1024 * 1024, // 5MB chunks
      metadata: {
        filename: file.name,
        filetype: file.type,
        userId: userId.toString(),
      },
      onError: (error) => {
        console.error("[ChunkedUploader] Upload failed:", error);
        setIsUploading(false);
        setUploadStatus("error");
        setErrorMessage(error.message || "Error al subir el archivo");
        toast.error("Error al subir el archivo. Intenta de nuevo.");
        onUploadError?.(error.message || "Upload failed");
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        setUploadProgress(parseFloat(percentage));
        console.log(`[ChunkedUploader] Progress: ${percentage}%`);
      },
      onSuccess: () => {
        console.log("[ChunkedUploader] Upload complete!");
        setIsUploading(false);
        setUploadStatus("success");
        setUploadProgress(100);

        // Extract result from upload metadata
        const metadata = upload.url ? extractMetadataFromUrl(upload.url) : null;
        
        if (metadata) {
          const result: UploadResult = {
            fileKey: metadata.fileKey || `tracks/${userId}/${Date.now()}.${file.name.split('.').pop()}`,
            fileUrl: metadata.fileUrl || upload.url || "",
            fileSize: file.size,
            fileName: file.name,
            mimeType: file.type,
          };

          toast.success("¡Archivo subido exitosamente!");
          onUploadComplete(result);
        } else {
          // Fallback if metadata extraction fails
          toast.success("¡Archivo subido exitosamente!");
          onUploadComplete({
            fileKey: `tracks/${userId}/${Date.now()}.${file.name.split('.').pop()}`,
            fileUrl: upload.url || "",
            fileSize: file.size,
            fileName: file.name,
            mimeType: file.type,
          });
        }
      },
    });

    uploadRef.current = upload;
    upload.start();
  };

  const cancelUpload = () => {
    if (uploadRef.current) {
      uploadRef.current.abort();
      setIsUploading(false);
      setUploadStatus("idle");
      setUploadProgress(0);
      toast.info("Subida cancelada");
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadStatus("idle");
    setUploadProgress(0);
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Extract metadata from TUS upload URL (if server sends it)
  const extractMetadataFromUrl = (url: string): { fileKey?: string; fileUrl?: string } | null => {
    try {
      // TUS server might include metadata in response headers
      // For now, return null and rely on fallback
      return null;
    } catch {
      return null;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* File Input */}
      {!file && (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(",")}
            onChange={handleFileSelect}
            className="hidden"
            id="chunked-file-input"
          />
          <label
            htmlFor="chunked-file-input"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <UploadIcon className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm font-medium">
              Click para seleccionar archivo
            </p>
            <p className="text-xs text-muted-foreground">
              MP3 o WAV, máximo {(maxSize / 1024 / 1024).toFixed(0)}MB
            </p>
          </label>
        </div>
      )}

      {/* File Selected */}
      {file && (
        <div className="border border-border rounded-lg p-4 space-y-4">
          {/* File Info */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium text-sm truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)} • {file.type}
              </p>
            </div>
            {uploadStatus === "idle" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetUpload}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Progress Bar */}
          {(uploadStatus === "uploading" || uploadStatus === "success") && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {uploadProgress.toFixed(1)}%
                </span>
                {uploadStatus === "uploading" && (
                  <span className="text-muted-foreground">
                    Subiendo... (chunked)
                  </span>
                )}
                {uploadStatus === "success" && (
                  <span className="text-green-500 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Completado
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {uploadStatus === "error" && (
            <div className="flex items-center gap-2 text-sm text-red-500">
              <AlertCircle className="h-4 w-4" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {uploadStatus === "idle" && (
              <Button onClick={startUpload} className="flex-1">
                <UploadIcon className="h-4 w-4 mr-2" />
                Subir Archivo
              </Button>
            )}
            {uploadStatus === "uploading" && (
              <Button
                onClick={cancelUpload}
                variant="destructive"
                className="flex-1"
              >
                Cancelar
              </Button>
            )}
            {(uploadStatus === "success" || uploadStatus === "error") && (
              <Button onClick={resetUpload} variant="outline" className="flex-1">
                Subir Otro Archivo
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
