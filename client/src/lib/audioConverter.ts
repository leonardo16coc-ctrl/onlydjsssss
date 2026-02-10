// @ts-ignore - lamejs doesn't have type definitions
import lamejs from 'lamejs';

export interface ConversionProgress {
  stage: 'decoding' | 'encoding' | 'complete';
  progress: number; // 0-100
}

/**
 * Convert WAV file to MP3 format in the browser
 * @param wavFile - The WAV file to convert
 * @param onProgress - Callback for progress updates
 * @returns Promise<File> - The converted MP3 file
 */
export async function convertWavToMp3(
  wavFile: File,
  onProgress?: (progress: ConversionProgress) => void
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        
        // Decode WAV
        onProgress?.({ stage: 'decoding', progress: 10 });
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        onProgress?.({ stage: 'decoding', progress: 30 });
        
        // Get audio data
        const channels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const samples = audioBuffer.getChannelData(0); // Get first channel
        
        // Convert Float32Array to Int16Array
        const int16Samples = new Int16Array(samples.length);
        for (let i = 0; i < samples.length; i++) {
          const s = Math.max(-1, Math.min(1, samples[i]));
          int16Samples[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        onProgress?.({ stage: 'encoding', progress: 50 });
        
        // Encode to MP3
        const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, 128); // 128 kbps
        const mp3Data: any[] = [];
        
        const blockSize = 1152; // Standard MP3 frame size
        for (let i = 0; i < int16Samples.length; i += blockSize) {
          const leftChunk = int16Samples.subarray(i, i + blockSize);
          const mp3buf = mp3encoder.encodeBuffer(leftChunk) as Int8Array;
          if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
          }
          
          // Update progress
          const progress = 50 + Math.floor((i / int16Samples.length) * 40);
          onProgress?.({ stage: 'encoding', progress });
        }
        
        // Flush remaining data
        const mp3buf = mp3encoder.flush() as Int8Array;
        if (mp3buf.length > 0) {
          mp3Data.push(mp3buf);
        }
        
        onProgress?.({ stage: 'encoding', progress: 95 });
        
        // Create blob and file
        const blob = new Blob(mp3Data, { type: 'audio/mp3' });
        const mp3File = new File(
          [blob],
          wavFile.name.replace(/\.wav$/i, '.mp3'),
          { type: 'audio/mp3' }
        );
        
        onProgress?.({ stage: 'complete', progress: 100 });
        resolve(mp3File);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read WAV file'));
    };

    reader.readAsArrayBuffer(wavFile);
  });
}

/**
 * Check if a file is WAV format
 */
export function isWavFile(file: File): boolean {
  return file.type === 'audio/wav' || 
         file.type === 'audio/wave' || 
         file.type === 'audio/x-wav' ||
         file.name.toLowerCase().endsWith('.wav');
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
