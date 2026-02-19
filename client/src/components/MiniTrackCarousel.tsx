import { Music, Play } from "lucide-react";
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

interface MiniTrackCarouselProps {
  tracks: Track[];
}

export default function MiniTrackCarousel({ tracks }: MiniTrackCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || isPaused) return;

    let animationFrameId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.3; // slower for hero section

    const animate = () => {
      if (scrollContainer) {
        scrollPosition += scrollSpeed;
        
        // Reset scroll when reaching halfway (seamless loop)
        const maxScroll = scrollContainer.scrollHeight / 2;
        if (scrollPosition >= maxScroll) {
          scrollPosition = 0;
        }
        
        scrollContainer.scrollTop = scrollPosition;
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
    <div 
      className="relative h-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={scrollRef}
        className="h-full overflow-y-hidden space-y-3"
        style={{ scrollBehavior: 'auto' }}
      >
        {duplicatedTracks.map((track, index) => (
          <div
            key={`${track.id}-${index}`}
            className="flex items-center gap-3 bg-slate-800/50 border border-slate-700 rounded-lg p-3 hover:border-cyan-500/50 transition-all hover:bg-slate-800/70 cursor-pointer group"
          >
            {/* Cover */}
            <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden">
              {track.coverImageUrl ? (
                <img
                  src={track.coverImageUrl}
                  alt={track.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <Music className="w-5 h-5 text-slate-600" />
                </div>
              )}
              
              {/* Play overlay on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
                {track.title}
              </h4>
              <p className="text-xs text-slate-400 truncate">
                {track.artist}
              </p>
            </div>

            {/* BPM Badge */}
            {track.bpm && (
              <div className="flex-shrink-0">
                <span className="text-xs px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded text-purple-400 font-medium">
                  {track.bpm}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Gradient Overlays */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-slate-900 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none"></div>
    </div>
  );
}
