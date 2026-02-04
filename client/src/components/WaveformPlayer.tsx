import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

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
      backend: "MediaElement",
    });

    wavesurferRef.current = wavesurfer;

    // Load audio
    wavesurfer.load(audioUrl);

    // Event listeners
    wavesurfer.on("ready", () => {
      setIsLoading(false);
      setDuration(wavesurfer.getDuration());
      onReady?.();
      
      if (autoAnalyze && onAnalysisComplete) {
        onAnalysisComplete(wavesurfer.getDuration());
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

  return (
    <div className="space-y-4">
      {/* Waveform Container */}
      <div className="relative">
        <div
          ref={containerRef}
          className="w-full rounded-lg overflow-hidden bg-muted/30"
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      {/* Controls */}
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
    </div>
  );
}
