import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface AudioPlayerProps {
  audioUrl: string;
  trackId: number;
  trackTitle: string;
  compact?: boolean;
}

export default function AudioPlayer({ audioUrl, trackId, trackTitle, compact = false }: AudioPlayerProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [hasShownLimitNotification, setHasShownLimitNotification] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [, setLocation] = useLocation();

  // Preview limit: 1 minute (60 seconds) for free users
  const previewLimit = user?.membershipStatus === "member" ? Infinity : 60;
  const isPreviewLimited = user?.membershipStatus !== "member";

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);

      // Stop at preview limit for free users
      if (isPreviewLimited && audio.currentTime >= previewLimit) {
        audio.pause();
        setIsPlaying(false);
        audio.currentTime = 0;
        setCurrentTime(0);
        
        // Show notification only once per play session
        if (!hasShownLimitNotification) {
          setHasShownLimitNotification(true);
          
          // Play notification sound
          const notificationSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKni8LZjHAU5k9nyz3osBSh+zPLaizsKGGS46+mmUhQMTKXh8bllHgU2jdXzxnkpBSh+zPLaizsKGGS46+mmUhQMTKXh8bllHgU2jdXzxnkpBSh+zPLaizsKGGS46+mmUhQMTKXh8bllHgU2jdXzxnkpBSh+zPLaizsKGGS46+mmUhQMTKXh8bllHgU2jdXzxnkpBSh+zPLaizsKGGS46+mmUhQMTKXh8bllHgU2jdXzxnkpBSh+zPLaizsKGGS46+mmUhQMTKXh8bllHgU2jdXzxnkpBSh+zPLaizsKGGS46+mmUhQMTKXh8bllHgU2jdXzxnkpBSh+zPLaizsKGGS46+mmUhQMTKXh8bllHgU2jdXzxnkpBSh+zPLaizsKGGS46+mmUhQMTKXh8bllHgU2jdXzxnkpBSh+zPLaizsKGGS46+mmUhQMTKXh8bllHgU2jdXzxnkpBSh+zPLaizsKGGS46+mmUhQMTKXh8bllHgU2jdXzxnkpBSh+zPLaizsKGGS46+mmUhQMTKXh8bllHgU2jdXzxnkpBSh+zPLaizsKGGS46+mmUhQMTKXh8bllHgU2jdXzxnkpBSh+zPLaizsKGGS46+mmUhQMTKXh8bllHgU2jdXzxnkpBSh+zPLaizsKGGS46+mmUhQMTKXh8bllHgU2jdXzxnkpBQ==');
          notificationSound.volume = 0.3;
          notificationSound.play().catch(() => {});
          
          // Show toast notification
          toast.info(
            t('player.previewEnded'),
            {
              description: t('player.previewEndedDesc'),
              duration: 8000,
              action: {
                label: t('player.subscribe'),
                onClick: () => setLocation("/membership"),
              },
            }
          );
        }
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      audio.currentTime = 0;
      setCurrentTime(0);
      setHasShownLimitNotification(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [isPreviewLimited, previewLimit]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      // Reset notification flag when starting a new play session
      if (audio.currentTime === 0) {
        setHasShownLimitNotification(false);
      }
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = value[0];
    // Limit seeking to preview duration for free users
    const maxSeek = isPreviewLimited ? Math.min(newTime, previewLimit) : newTime;
    audio.currentTime = maxSeek;
    setCurrentTime(maxSeek);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = value[0];
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const maxDuration = isPreviewLimited ? Math.min(duration, previewLimit) : duration;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
        <Button
          size="sm"
          variant="ghost"
          onClick={togglePlay}
          className="h-8 w-8 p-0"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <div className="flex-1 min-w-0">
          <Slider
            value={[currentTime]}
            max={maxDuration}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatTime(currentTime)} / {formatTime(maxDuration)}
        </span>
        {isPreviewLimited && (
          <span className="text-xs text-primary font-medium">{t('player.preview')}</span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium truncate">{trackTitle}</p>
        {isPreviewLimited && (
          <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded">
            {t('player.previewOneMin')}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <Slider
          value={[currentTime]}
          max={maxDuration}
          step={0.1}
          onValueChange={handleSeek}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(maxDuration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Play/Pause */}
        <Button
          size="icon"
          variant="default"
          onClick={togglePlay}
          className="h-10 w-10"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>

        {/* Volume */}
        <div className="flex items-center gap-2 flex-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleMute}
            className="h-8 w-8"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-24 cursor-pointer"
          />
        </div>
      </div>

      {isPreviewLimited && (
        <p className="text-xs text-muted-foreground text-center">
          {t('player.subscribeToListen')}
        </p>
      )}
    </div>
  );
}
