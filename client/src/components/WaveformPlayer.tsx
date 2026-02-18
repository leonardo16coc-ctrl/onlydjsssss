import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX, AlertCircle } from "lucide-react";

interface WaveformPlayerProps {
  audioUrl: string;
  onReady?: () => void;
  onAnalysisComplete?: (duration: number) => void;
  autoAnalyze?: boolean;
}

export default function WaveformPlayer({
  audioUrl,
  onReady,
  onAnalysisComplete,
  autoAnalyze = false,
}: WaveformPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasCalledAnalysisRef = useRef(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Reset states
    setIsLoading(true);
    setLoadError(null);
    hasCalledAnalysisRef.current = false;

    // Set timeout for loading (60 seconds)
    loadingTimeoutRef.current = setTimeout(() => {
      if (isLoading) {
        setLoadError("Tiempo de carga agotado. El archivo puede ser muy grande o la conexión es lenta.");
        setIsLoading(false);
      }
    }, 60000);

    // Create WaveSurfer instance with optimized settings
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#06b6d4", // cyan
      progressColor: "#ec4899", // pink
      cursorColor: "#f0abfc", // purple
      barWidth: 4,
      barRadius: 3,
      cursorWidth: 2,
      height: 120,
      barGap: 4,
      normalize: true,
      backend: "WebAudio",
      // Performance optimizations
      hideScrollbar: true,
      minPxPerSec: 0.5,
      fillParent: true,
      autoCenter: false,
      interact: true,
      dragToSeek: true,
      // Add media controls for better compatibility
      mediaControls: false,
    });

    wavesurferRef.current = wavesurfer;

    // Load audio with error handling
    try {
      wavesurfer.load(audioUrl);
    } catch (error) {
      console.error("Error loading audio:", error);
      setLoadError("Error al cargar el archivo de audio");
      setIsLoading(false);
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    }

    // Event listeners
    wavesurfer.on("ready", () => {
      console.log("WaveSurfer ready");
      setIsLoading(false);
      setLoadError(null);
      setDuration(wavesurfer.getDuration());
      
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      onReady?.();
      
      // Only call analysis once
      if (autoAnalyze && onAnalysisComplete && !hasCalledAnalysisRef.current) {
        hasCalledAnalysisRef.current = true;
        onAnalysisComplete(wavesurfer.getDuration());
      }
    });

    wavesurfer.on("error", (error) => {
      console.error("WaveSurfer error:", error);
      setLoadError("Error al procesar el archivo de audio. Intenta con otro archivo.");
      setIsLoading(false);
      
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    });

    wavesurfer.on("play", () => setIsPlaying(true));
    wavesurfer.on("pause", () => setIsPlaying(false));
    
    wavesurfer.on("audioprocess", () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    wavesurfer.on("seeking", () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    // Cleanup
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      wavesurfer.destroy();
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(newVolume);
    }
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (wavesurferRef.current) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      wavesurferRef.current.setVolume(newMuted ? 0 : volume);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRetry = () => {
    setLoadError(null);
    setIsLoading(true);
    hasCalledAnalysisRef.current = false;
    
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }
    
    // Force re-render by updating a key would be better, but we'll reload
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      {/* Waveform Container */}
      <div className="relative">
        <div
          ref={containerRef}
          className="w-full rounded-lg overflow-hidden bg-muted/30"
          style={{ minHeight: loadError ? "120px" : undefined }}
        />
        
        {/* Loading State */}
        {isLoading && !loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
            <p className="text-sm text-muted-foreground">Cargando waveform...</p>
          </div>
        )}
        
        {/* Error State */}
        {loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50 rounded-lg p-4">
            <AlertCircle className="h-8 w-8 text-destructive mb-2" />
            <p className="text-sm text-destructive text-center mb-3">{loadError}</p>
            <Button
              onClick={handleRetry}
              size="sm"
              variant="outline"
            >
              Reintentar
            </Button>
          </div>
        )}
      </div>

      {/* Controls */}
      {!loadError && (
        <div className="flex items-center gap-4">
          {/* Play/Pause Button */}
          <Button
            onClick={togglePlayPause}
            disabled={isLoading}
            size="icon"
            className="btn-neon glow-cyan"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          {/* Time Display */}
          <div className="text-sm font-mono text-muted-foreground min-w-[100px]">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 ml-auto">
            <Button
              onClick={toggleMute}
              size="icon"
              variant="ghost"
              className="h-8 w-8"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="w-24"
            />
          </div>
        </div>
      )}
    </div>
  );
}
