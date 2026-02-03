import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { storagePut } from "../storage";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const execAsync = promisify(exec);

// Camelot Wheel mapping
const CAMELOT_WHEEL: Record<string, string> = {
  "C major": "8B",
  "G major": "9B",
  "D major": "10B",
  "A major": "11B",
  "E major": "12B",
  "B major": "1B",
  "F# major": "2B",
  "Db major": "3B",
  "Ab major": "4B",
  "Eb major": "5B",
  "Bb major": "6B",
  "F major": "7B",
  "A minor": "8A",
  "E minor": "9A",
  "B minor": "10A",
  "F# minor": "11A",
  "C# minor": "12A",
  "G# minor": "1A",
  "D# minor": "2A",
  "Bb minor": "3A",
  "F minor": "4A",
  "C minor": "5A",
  "G minor": "6A",
  "D minor": "7A",
};

export const aiAnalyzerRouter = router({
  analyzeAudio: publicProcedure
    .input(
      z.object({
        audioBase64: z.string(),
        filename: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const tempId = randomBytes(16).toString("hex");
      const tempPath = path.join("/tmp", `${tempId}-${input.filename}`);
      
      try {
        // Decode base64 to buffer
        const base64Data = input.audioBase64.split(',')[1] || input.audioBase64;
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Check file size (max 1000MB = 1GB)
        const fileSizeMB = buffer.length / (1024 * 1024);
        if (fileSizeMB > 1000) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `File size (${fileSizeMB.toFixed(2)}MB) exceeds 1000MB limit`,
          });
        }

        // Save to temp file
        await writeFile(tempPath, buffer);

        // Run Python script for audio analysis
        const pythonScript = `
import librosa
import numpy as np
import json
import sys

try:
    # Load audio file
    y, sr = librosa.load("${tempPath}", sr=None)
    
    # BPM detection
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    bpm = float(tempo)
    
    # Key detection using chromagram
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
    chroma_mean = np.mean(chroma, axis=1)
    
    # Find dominant pitch class
    pitch_classes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    dominant_pitch = pitch_classes[np.argmax(chroma_mean)]
    
    # Determine major/minor (simple heuristic based on 3rd interval)
    major_profile = np.array([1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0])
    minor_profile = np.array([1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0])
    
    # Rotate profiles to match dominant pitch
    dominant_idx = np.argmax(chroma_mean)
    rotated_chroma = np.roll(chroma_mean, -dominant_idx)
    
    major_corr = np.corrcoef(rotated_chroma, major_profile)[0, 1]
    minor_corr = np.corrcoef(rotated_chroma, minor_profile)[0, 1]
    
    mode = "major" if major_corr > minor_corr else "minor"
    key = f"{dominant_pitch} {mode}"
    
    result = {
        "bpm": round(bpm, 2),
        "key": key
    }
    
    print(json.dumps(result))
    
except Exception as e:
    print(json.dumps({"error": str(e)}), file=sys.stderr)
    sys.exit(1)
`;

        // Write Python script to temp file
        const scriptPath = `/tmp/${tempId}-analyze.py`;
        await writeFile(scriptPath, pythonScript);

        // Execute Python script
        const { stdout, stderr } = await execAsync(`python3 ${scriptPath}`, {
          timeout: 30000, // 30 seconds timeout
        });

        // Clean up temp files
        await Promise.all([
          unlink(tempPath).catch(() => {}),
          unlink(scriptPath).catch(() => {}),
        ]);

        if (stderr) {
          console.error("Python script error:", stderr);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Audio analysis failed",
          });
        }

        const result = JSON.parse(stdout);

        if (result.error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: result.error,
          });
        }

        // Convert to Camelot notation
        const camelotKey = CAMELOT_WHEEL[result.key] || "Unknown";

        return {
          bpm: result.bpm,
          key: result.key,
          camelotKey,
        };
      } catch (error: any) {
        // Clean up on error
        await Promise.all([
          unlink(tempPath).catch(() => {}),
          unlink(`/tmp/${tempId}-analyze.py`).catch(() => {}),
        ]);

        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Audio analysis error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to analyze audio file",
        });
      }
    }),
});
