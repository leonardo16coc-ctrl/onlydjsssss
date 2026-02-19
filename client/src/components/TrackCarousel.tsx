import { Card } from "@/components/ui/card";
import { Music, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Track {
  id: number;
  title: string;
  artist: string;
  genre: string;
  bpm?: number | null;
  coverImageUrl?: string | null;
  downloadCount: number;
}

interface TrackCarouselProps {
  tracks: Track[];
}

export default function TrackCarousel({ tracks }: TrackCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || isPaused) return;

    let animationFrameId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // pixels per frame

    const animate = () => {
      if (scrollContainer) {
        scrollPosition += scrollSpeed;
        
        // Reset scroll when reaching halfway (seamless loop)
        const maxScroll = scrollContainer.scrollWidth / 2;
        if (scrollPosition >= maxScroll) {
          scrollPosition = 0;
        }
        
        scrollContainer.scrollLeft = scrollPosition;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPaused]);

  // Duplicate tracks for seamless infinite scroll
  const duplicatedTracks = [...tracks, ...tracks];

  return (
    <div className="relative overflow-hidden py-8">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{ scrollBehavior: 'auto' }}
      >
        {duplicatedTracks.map((track, index) => (
          <Card
            key={`${track.id}-${index}`}
            className="flex-shrink-0 w-64 bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-all hover:scale-105 cursor-pointer group"
          >
            <div className="relative aspect-square overflow-hidden rounded-t-lg">
              {track.coverImageUrl ? (
                <img
                  src={track.coverImageUrl}
                  alt={track.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <Music className="w-16 h-16 text-slate-600" />
                </div>
              )}
              
              {/* Genre Badge */}
              <div className="absolute top-2 left-2">
                <span className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs font-medium text-cyan-400 border border-cyan-500/30">
                  {track.genre}
                </span>
              </div>

              {/* BPM Badge */}
              {track.bpm && (
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs font-medium text-purple-400 border border-purple-500/30">
                    {track.bpm} BPM
                  </span>
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-bold text-white truncate mb-1 group-hover:text-cyan-400 transition-colors">
                {track.title}
              </h3>
              <p className="text-sm text-slate-400 truncate mb-3">
                {track.artist}
              </p>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <TrendingUp className="w-3 h-3" />
                <span>{track.downloadCount.toLocaleString()} downloads</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Gradient Overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-950 to-transparent pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none"></div>
    </div>
  );
}
