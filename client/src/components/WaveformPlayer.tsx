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
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    setIsLoading(true);
    setLoadError(false);

    // Create WaveSurfer instance
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#06b6d4", // cyan
      progressColor: "#ec4899", // pink
      cursorColor: "#f0abfc", // purple
      barWidth: 2,
      barRadius: 3,
      cursorWidth: 2,
      height: 120,
      barGap: 2,
      normalize: true,
      backend: "WebAudio",
    });

    wavesurferRef.current = wavesurfer;

    // Set timeout for loading (15 seconds)
    loadTimeoutRef.current = setTimeout(() => {
      if (isLoading) {
        console.error("Waveform loading timeout");
        setIsLoading(false);
        setLoadError(true);
        wavesurfer.destroy();
      }
    }, 15000);

    // Load audio
    wavesurfer.load(audioUrl);

    // Event listeners
    wavesurfer.on("ready", () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      setIsLoading(false);
      setLoadError(false);
      setDuration(wavesurfer.getDuration());
      onReady?.();
      
      if (autoAnalyze && onAnalysisComplete) {
        onAnalysisComplete(wavesurfer.getDuration());
      }
    });

    wavesurfer.on("error", (error) => {
      console.error("WaveSurfer error:", error);
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      setIsLoading(false);
      setLoadError(true);
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
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
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

  const retryLoad = () => {
    setLoadError(false);
    setIsLoading(true);
    if (wavesurferRef.current) {
      wavesurferRef.current.load(audioUrl);
    }
  };

  return (
    <div className="space-y-4">
      {/* Waveform Container */}
      <div className="relative">
        <div
          ref={containerRef}
          className="w-full rounded-lg overflow-hidden bg-muted/30"
          style={{ minHeight: "120px" }}
        />
        {isLoading && !loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Cargando waveform...</p>
            </div>
          </div>
        )}
        {loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
            <div className="flex flex-col items-center gap-3 p-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm text-muted-foreground text-center">
                Error al cargar el waveform
              </p>
              <Button
                onClick={retryLoad}
                size="sm"
                variant="outline"
              >
                Reintentar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <Button
          onClick={togglePlayPause}
          disabled={isLoading || loadError}
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
            disabled={isLoading || loadError}
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
            disabled={isLoading || loadError}
          />
        </div>
      </div>
    </div>
  );
}
