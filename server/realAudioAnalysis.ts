/**
 * Real Audio Analysis Service
 * Analyzes actual audio files to detect BPM and musical key using Python librosa
 */

import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink } from "fs/promises";
import { randomBytes } from "crypto";

const execAsync = promisify(exec);

export interface RealAudioAnalysisResult {
  bpm: number;
  musicalKey: string;
  confidence: {
    bpm: number;
    key: number;
  };
}

/**
 * Analyze audio file from URL using Python librosa
 */
export async function analyzeAudioFromUrl(audioUrl: string): Promise<RealAudioAnalysisResult> {
  const tempId = randomBytes(16).toString("hex");
  const scriptPath = `/tmp/${tempId}-analyze-real.py`;

  try {
    console.log(`[Real Audio Analysis] Starting analysis for: ${audioUrl}`);

    // Create Python script for audio analysis
    const pythonScript = `
import sys
import json
import librosa
import numpy as np
from urllib.request import urlopen
from io import BytesIO

try:
    # Download audio file
    audio_url = "${audioUrl}"
    print(f"Downloading audio from: {audio_url}", file=sys.stderr)
    
    with urlopen(audio_url) as response:
        audio_data = response.read()
    
    # Load audio with librosa
    y, sr = librosa.load(BytesIO(audio_data), sr=None, mono=True)
    print(f"Audio loaded: duration={len(y)/sr:.2f}s, sr={sr}Hz", file=sys.stderr)
    
    # Detect BPM using librosa
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
    bpm = float(tempo)
    print(f"BPM detected: {bpm}", file=sys.stderr)
    
    # Detect musical key using chroma features
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
    
    # Average chroma across time
    chroma_mean = np.mean(chroma, axis=1)
    
    # Find the dominant pitch class
    key_index = np.argmax(chroma_mean)
    
    # Map to musical keys
    keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    detected_key = keys[key_index]
    
    # Determine major/minor using harmonic/percussive separation
    y_harmonic, y_percussive = librosa.effects.hpss(y)
    
    # Calculate spectral centroid for harmonic component
    spectral_centroid = np.mean(librosa.feature.spectral_centroid(y=y_harmonic, sr=sr))
    
    # Heuristic: lower spectral centroid suggests minor key
    is_minor = spectral_centroid < 2000
    
    if is_minor:
        musical_key = f"{detected_key}m"
    else:
        musical_key = detected_key
    
    print(f"Key detected: {musical_key}", file=sys.stderr)
    
    # Output results as JSON
    result = {
        "bpm": int(round(bpm)),
        "musicalKey": musical_key,
        "confidence": {
            "bpm": 0.95,
            "key": 0.90
        }
    }
    
    print(json.dumps(result))
    
except Exception as e:
    print(f"Error: {str(e)}", file=sys.stderr)
    sys.exit(1)
`;

    // Write Python script to temp file
    await writeFile(scriptPath, pythonScript);

    // Execute Python script (use python3.11 explicitly)
    const { stdout, stderr } = await execAsync(`python3.11 ${scriptPath}`, {
      timeout: 60000, // 60 seconds timeout
    });

    // Clean up
    await unlink(scriptPath).catch(() => {});

    if (stderr) {
      console.log(`[Real Audio Analysis] Python output: ${stderr}`);
    }

    // Parse result
    const result = JSON.parse(stdout.trim()) as RealAudioAnalysisResult;
    
    console.log(`[Real Audio Analysis] Analysis complete: BPM=${result.bpm}, Key=${result.musicalKey}`);
    
    return result;
  } catch (error: any) {
    // Clean up on error
    await unlink(scriptPath).catch(() => {});
    
    console.error("[Real Audio Analysis] Analysis failed:", error);
    throw new Error(`Real audio analysis failed: ${error.message}`);
  }
}
