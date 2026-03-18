import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Music, Users, Play, Download, Heart, Share2, Repeat2,
  Instagram, Twitter, Youtube, Globe, MapPin, CheckCircle2,
  Disc3, Mic2, Headphones, Pause
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { ShareProfileModal } from "@/components/ShareProfileModal";
import { ExternalLink, Grid3X3, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

// ── Threads SVG icon ──────────────────────────────────────────────────────
function ThreadsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.474 12.01v-.017c.03-3.579.885-6.43 2.548-8.48C5.865 1.205 8.618.024 12.2 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.284 2.651Zm.186-8.77c-.11 0-.221.003-.332.01-1.12.065-1.977.37-2.474.876-.43.44-.621.997-.589 1.657.069 1.275 1.213 2.026 3.182 1.917 1.106-.06 1.907-.407 2.45-1.06.535-.643.797-1.565.78-2.74a11.415 11.415 0 0 0-3.017-.66Z"/>
    </svg>
  );
}

// ── TikTok SVG icon ────────────────────────────────────────────────────
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.2 8.2 0 0 0 4.79 1.53V6.77a4.85 4.85 0 0 1-1.02-.08z"/>
    </svg>
  );
}

// ── TikTok Feed Component (Embed) ──────────────────────────────────────
function TikTokFeed({ username }: { username: string }) {
  const { data, isLoading } = trpc.tiktok.getArtistTikTokFeed.useQuery(
    { username },
    { retry: false, staleTime: 60 * 60 * 1000 }
  );

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="flex items-center gap-2 mb-4">
          <TikTokIcon className="w-5 h-5" />
          <h3 className="font-semibold text-base">TikTok</h3>
        </div>
        <Skeleton className="h-[280px] rounded-xl" />
      </div>
    );
  }

  if (!data?.username) return null;

  // TikTok embed: enlace al perfil con preview del último video
  const tiktokUser = data.username.startsWith('@') ? data.username.slice(1) : data.username;

  return (
    <div className="py-6 border-t border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#010101] to-[#69C9D0] border border-[#EE1D52]/30">
            <TikTokIcon className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-base">TikTok</h3>
        </div>
        <a
          href={`https://www.tiktok.com/@${tiktokUser}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          @{tiktokUser}
        </a>
      </div>
      {/* TikTok embed via blockquote - official embed widget */}
      <div className="rounded-xl overflow-hidden border border-border/40 bg-black/20 flex items-center justify-center" style={{ minHeight: 260 }}>
        <blockquote
          className="tiktok-embed"
          cite={`https://www.tiktok.com/@${tiktokUser}`}
          data-unique-id={tiktokUser}
          data-embed-type="creator"
          style={{ maxWidth: '100%', minWidth: 288 }}
        >
          <section>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`https://www.tiktok.com/@${tiktokUser}`}
              className="flex flex-col items-center gap-3 p-6 text-center"
            >
              <TikTokIcon className="w-10 h-10 text-[#69C9D0]" />
              <span className="text-sm font-medium">@{tiktokUser}</span>
              <span className="text-xs text-muted-foreground">Ver en TikTok</span>
            </a>
          </section>
        </blockquote>
      </div>
    </div>
  );
}

// ── Threads Feed Component ──────────────────────────────────────────────────
function ThreadsFeed({ username }: { username: string }) {
  const { data, isLoading } = trpc.threads.getArtistThreadsFeed.useQuery(
    { username },
    { retry: false }
  );

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="flex items-center gap-2 mb-4">
          <ThreadsIcon className="w-5 h-5" />
          <h3 className="font-semibold text-base">Threads Feed</h3>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!data?.posts?.length || !data.threadsUsername) return null;

  return (
    <div className="py-6 border-t border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-gray-700 to-gray-500">
            <ThreadsIcon className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-base">Threads</h3>
        </div>
        <a
          href={`https://threads.net/@${data.threadsUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          @{data.threadsUsername}
        </a>
      </div>

      {/* Posts list */}
      <div className="space-y-3">
        {data.posts.slice(0, 9).map((post: any) => (
          <a
            key={post.id}
            href={post.permalink || `https://threads.net/@${data.threadsUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors border border-border/30 hover:border-border/60 block"
          >
            {/* Image if available */}
            {(post.media_url || post.thumbnail_url) && (
              <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                <img
                  src={post.media_url || post.thumbnail_url}
                  alt="Threads post"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {post.text && (
                <p className="text-sm text-foreground line-clamp-2 mb-1">{post.text}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                {post.like_count > 0 && <span>❤️ {post.like_count}</span>}
                {post.replies_count > 0 && <span>💬 {post.replies_count}</span>}
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
          </a>
        ))}
      </div>
    </div>
  );
}


// ── Last Tweet (solo se muestra si NO hay embed activo) ──────────────────
function LastTweet({ username, hasEmbed }: { username: string; hasEmbed: boolean }) {
  const { data, isLoading } = trpc.twitter.getArtistTwitterFeed.useQuery(
    { username },
    { retry: false, staleTime: 60 * 60 * 1000 }
  );

  // Si ya hay embed activo, no mostrar el banner redundante
  if (hasEmbed) return null;

  if (isLoading) {
    return <Skeleton className="h-10 w-full rounded-xl mt-3" />;
  }

  if (!data?.username) return null;

  return (
    <a
      href={`https://twitter.com/${data.username}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-2.5 mt-3 px-3 py-2 rounded-lg bg-sky-500/5 border border-sky-500/20 hover:bg-sky-500/10 hover:border-sky-500/40 transition-all"
    >
      <div className="p-1 rounded-md bg-gradient-to-br from-sky-500 to-blue-600 flex-shrink-0">
        <Twitter className="w-3 h-3 text-white" />
      </div>
      <span className="text-xs font-medium text-sky-400">@{data.username}</span>
      <span className="text-xs text-muted-foreground">· Ver en Twitter / X</span>
      <ExternalLink className="w-3 h-3 text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-auto" />
    </a>
  );
}

// ── Twitter Carousel Component ────────────────────────────────────────────────
// Shows individual tweets with prev/next navigation using Twitter Timeline Embed + CSS isolation
const TWEET_COUNT = 5; // Number of latest tweets to show in carousel

function TwitterFeed({ username }: { username: string }) {
  const { data, isLoading } = trpc.twitter.getArtistTwitterFeed.useQuery(
    { username },
    { retry: false, staleTime: 60 * 60 * 1000 }
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  // ── Swipe táctil ──────────────────────────────────────────────────────────
  const touchStartX = useRef<number | null>(null);
  const SWIPE_THRESHOLD = 50; // px mínimos para activar el swipe

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
    if (deltaX < 0) {
      // Swipe izquierda → siguiente tweet
      setCurrentIndex(i => Math.min(TWEET_COUNT - 1, i + 1));
    } else {
      // Swipe derecha → tweet anterior
      setCurrentIndex(i => Math.max(0, i - 1));
    }
  };

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="flex items-center gap-2 mb-4">
          <Twitter className="w-5 h-5" />
          <h3 className="font-semibold text-base">Twitter / X</h3>
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!data?.username) return null;

  const twitterUser = data.username;

  return (
    <div className="py-6 border-t border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600">
            <Twitter className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-base">Twitter / X</h3>
        </div>
        <a
          href={`https://twitter.com/${twitterUser}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          @{twitterUser}
        </a>
      </div>

      {/* Carousel container - touch swipe enabled */}
      <div
        className="relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Tweet embed - shows timeline filtered to show one tweet at a time via CSS */}
        <div className="rounded-xl overflow-hidden border border-border/40 bg-black/20">
          <TwitterCarouselEmbed
            username={twitterUser}
            currentIndex={currentIndex}
            total={TWEET_COUNT}
          />
        </div>

        {/* Navigation arrows */}
        <button
          onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 rounded-full bg-background border border-border shadow-md flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed z-10"
          aria-label="Tweet anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => setCurrentIndex(i => Math.min(TWEET_COUNT - 1, i + 1))}
          disabled={currentIndex === TWEET_COUNT - 1}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 rounded-full bg-background border border-border shadow-md flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed z-10"
          aria-label="Tweet siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 mt-4">
        {Array.from({ length: TWEET_COUNT }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              i === currentIndex
                ? "bg-sky-400 w-4"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
            }`}
            aria-label={`Ir al tweet ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// ── TwitterCarouselEmbed: uses CSS to show only the nth tweet ─────────────────
function TwitterCarouselEmbed({ username, currentIndex, total }: {
  username: string;
  currentIndex: number;
  total: number;
}) {
  const embedRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!embedRef.current) return;
    const initWidget = () => {
      const tw = (window as any).twttr;
      if (tw && tw.widgets) {
        tw.widgets.load(embedRef.current!).then(() => setLoaded(true));
      }
    };
    const tw = (window as any).twttr;
    if (tw && tw.widgets) {
      initWidget();
    } else {
      const script = document.querySelector('script[src*="platform.twitter.com/widgets.js"]');
      if (script) {
        script.addEventListener('load', initWidget, { once: true });
      }
    }
  }, [username]);

  return (
    <div className="relative overflow-hidden">
      {/* Inject CSS to show only the nth tweet article */}
      <style>{`
        .twitter-carousel-wrap .twitter-tweet-rendered {
          display: none !important;
        }
        .twitter-carousel-wrap .twitter-tweet-rendered:nth-child(${currentIndex + 1}) {
          display: block !important;
        }
        .twitter-carousel-wrap .EmbeddedTweet {
          display: none !important;
        }
        .twitter-carousel-wrap .EmbeddedTweet:nth-child(${currentIndex + 1}) {
          display: block !important;
        }
      `}</style>
      <div ref={embedRef} className="twitter-carousel-wrap">
        <a
          className="twitter-timeline"
          data-theme="dark"
          data-tweet-limit={String(total)}
          data-chrome="noheader nofooter noborders transparent"
          href={`https://twitter.com/${username}`}
        >
          Tweets de @{username}
        </a>
      </div>
      {!loaded && (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

// ── Instagram Feed Component ────────────────────────────────────────────────
function InstagramFeed({ username }: { username: string }) {
  const { data, isLoading } = trpc.instagram.getArtistInstagramFeed.useQuery(
    { username },
    { retry: false }
  );

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="flex items-center gap-2 mb-4">
          <Instagram className="w-5 h-5 text-pink-500" />
          <h3 className="font-semibold text-base">Instagram Feed</h3>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!data?.posts?.length || !data.instagramUsername) return null;

  return (
    <div className="py-6 border-t border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
            <Instagram className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-base">Instagram Feed</h3>
        </div>
        <a
          href={`https://instagram.com/${data.instagramUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          @{data.instagramUsername}
        </a>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-1.5">
        {data.posts.slice(0, 9).map((post: any) => (
          <a
            key={post.id}
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square overflow-hidden rounded-lg bg-muted block"
          >
            <img
              src={post.media_url || post.thumbnail_url}
              alt={post.caption?.slice(0, 60) || "Instagram post"}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ExternalLink className="w-5 h-5 text-white" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function TrackCard({ track }: { track: any }) {
  const likeTrack = trpc.djProfiles.likeTrack.useMutation({
    onSuccess: (data: any) => {
      toast(data.liked ? "Track liked!" : "Like removed");
    },
  });
  const repostTrack = trpc.djProfiles.repostTrack.useMutation({
    onSuccess: (data: any) => {
      toast(data.reposted ? "Reposted!" : "Repost removed");
    },
  });
  const shareTrack = () => {
    const url = `https://www.onlydjss.com/track/${track.id}`;
    navigator.clipboard.writeText(url);
    toast("Link copied!");
  };
  const formatDuration = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "--:--";
    const totalSecs = Math.floor(seconds);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ── Mini Audio Player ────────────────────────────────────────────────────────
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(track.durationSeconds || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [localPlayCount, setLocalPlayCount] = useState<number | null>(null);
  const streamDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasCountedRef = useRef(false);

  // Use preview if available, otherwise full audio
  const audioSrc = track.previewFileUrl || track.audioFileUrl;

  // Record stream mutation
  const recordStream = trpc.djProfiles.recordStream.useMutation({
    onSuccess: (data: any) => {
      if (data?.success) {
        // Optimistically update the local play count
        setLocalPlayCount(prev =>
          prev !== null ? prev + 1 : (track.playCount || 0) + 1
        );
      }
    },
  });

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;
    if (isPlaying) {
      audio.pause();
    } else {
      // Pause all other audio elements on the page
      document.querySelectorAll("audio").forEach(a => {
        if (a !== audio) a.pause();
      });
      audio.play().catch(() => toast("No se pudo reproducir el audio"));

      // Client-side debounce: count only once per 10 seconds per play session
      if (!hasCountedRef.current) {
        hasCountedRef.current = true;
        recordStream.mutate({ trackId: track.id });
        // Reset after 10 seconds so a new play session can count again
        if (streamDebounceRef.current) clearTimeout(streamDebounceRef.current);
        streamDebounceRef.current = setTimeout(() => {
          hasCountedRef.current = false;
        }, 10_000);
      }
    }
  }, [isPlaying, audioSrc, track.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => { setIsPlaying(false); setProgress(0); setCurrentTime(0); };
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
    };
  }, []);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * audio.duration;
  };

  const handleDownload = async () => {
    const url = track.audioFileUrl;
    if (!url) { toast("Archivo no disponible"); return; }
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = `${track.title} - ${track.artist}.${track.fileFormat?.toLowerCase() || "mp3"}`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast("Descarga iniciada");
    } catch {
      toast("Error al descargar");
    }
  };

  return (
    <Card className={`group bg-card/50 border-border/50 hover:border-border hover:bg-card transition-all duration-200 ${
      isPlaying ? "border-sky-500/50 bg-sky-950/20" : ""
    }`}>
      <CardContent className="p-4">
        <div className="flex gap-4 items-center">
          {/* Cover + Play Button */}
          <div className="relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-muted">
            {track.coverImageUrl ? (
              <img src={track.coverImageUrl} alt={track.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            {/* Play overlay on cover */}
            {audioSrc && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                aria-label={isPlaying ? "Pausar" : "Reproducir"}
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white fill-white" />
                )}
              </button>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{track.title}</p>
                <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
              </div>
              {track.trackType && (
                <Badge variant="secondary" className="text-xs flex-shrink-0">{track.trackType}</Badge>
              )}
            </div>

            {/* Progress bar - visible when playing */}
            {audioSrc && (
              <div
                className="mt-2 h-1 bg-muted rounded-full cursor-pointer overflow-hidden"
                onClick={handleSeek}
                title={`${formatDuration(currentTime)} / ${formatDuration(duration)}`}
              >
                <div
                  className="h-full bg-sky-400 rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Play className="w-3 h-3" />
                {(localPlayCount !== null ? localPlayCount : (track.playCount || 0)).toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />{(track.likeCount || 0).toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Download className="w-3 h-3" />{(track.downloadCount || 0).toLocaleString()}
              </span>
              {track.bpm && <span>{track.bpm} BPM</span>}
              {track.musicalKey && <span>{track.musicalKey}</span>}
              {isPlaying ? (
                <span className="text-sky-400 font-medium">
                  {formatDuration(currentTime)} / {formatDuration(duration)}
                </span>
              ) : (
                <span>{formatDuration(track.durationSeconds)}</span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {/* Play/Pause button - always visible */}
            {audioSrc && (
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${
                  isPlaying ? "text-sky-400 hover:text-sky-300" : "opacity-0 group-hover:opacity-100"
                } transition-opacity`}
                onClick={togglePlay}
                aria-label={isPlaying ? "Pausar" : "Reproducir"}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
            )}
            {/* Download button - always visible */}
            {track.audioFileUrl && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:text-green-400"
                onClick={handleDownload}
                aria-label="Descargar track"
                title="Descargar"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => likeTrack.mutate({ trackId: track.id })}
            >
              <Heart className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => repostTrack.mutate({ trackId: track.id })}
            >
              <Repeat2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={shareTrack}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Hidden audio element */}
        {audioSrc && (
          <audio ref={audioRef} src={audioSrc} preload="none" />
        )}
      </CardContent>
    </Card>
  );
}

function TrackList({ username, type }: { username: string; type: "all" | "edit" | "remix" | "track" | "mashup" }) {
  const { data, isLoading } = trpc.djProfiles.getTracksByUsername.useQuery({ username, type });
  if (isLoading) return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
    </div>
  );
  const tracks = Array.isArray((data as any)?.tracks) ? (data as any).tracks : [];
  if (tracks.length === 0) return (
    <div className="text-center py-16 text-muted-foreground">
      <Music className="w-12 h-12 mx-auto mb-4 opacity-30" />
      <p className="text-sm">No tracks yet</p>
    </div>
  );
  return (
    <div className="space-y-3">
      {tracks.map((track: any) => <TrackCard key={track.id} track={track} />)}
    </div>
  );
}

export default function DJProfile() {
  const [matchDirect, paramsDirect] = useRoute("/:username");
  const [matchDJ, paramsDJ] = useRoute("/dj/:username");
  const [matchAt, paramsAt] = useRoute("/@:username");
  const [matchTracks, paramsTracks] = useRoute("/:username/tracks");
  const [matchEdits, paramsEdits] = useRoute("/:username/edits");
  const [matchRemixes, paramsRemixes] = useRoute("/:username/remixes");
  const [matchMashups, paramsMashups] = useRoute("/:username/mashups");
  const [, navigate] = useLocation();

  const username =
    (paramsDJ as any)?.username ||
    (paramsAt as any)?.username ||
    (paramsTracks as any)?.username ||
    (paramsEdits as any)?.username ||
    (paramsRemixes as any)?.username ||
    (paramsMashups as any)?.username ||
    (paramsDirect as any)?.username || "";

  const defaultTab = matchTracks ? "tracks"
    : matchEdits ? "edits"
    : matchRemixes ? "remixes"
    : matchMashups ? "mashups"
    : "tracks";

  const { user } = useAuth();
  const [showShareProfile, setShowShareProfile] = useState(false);

  const { data: profile, isLoading } = trpc.djProfiles.getByUsername.useQuery(
    { username },
    { enabled: !!username }
  );

  const { data: counts } = trpc.djProfiles.getTrackCountsByUsername.useQuery(
    { username },
    { enabled: !!username }
  );

  const { data: followStatus, refetch: refetchFollow } = trpc.djProfiles.isFollowing.useQuery(
    { targetUserId: (profile as any)?.id || 0 },
    { enabled: !!(profile as any)?.id && !!user }
  );

  const followMutation = trpc.djProfiles.follow.useMutation({
    onSuccess: () => {
      refetchFollow();
      toast("Following!");
    },
  });

  const unfollowMutation = trpc.djProfiles.unfollow.useMutation({
    onSuccess: () => {
      refetchFollow();
      toast("Unfollowed");
    },
  });

  const handleFollowToggle = () => {
    if (!user) {
      toast("Sign in to follow DJs");
      return;
    }
    const p = profile as any;
    if ((followStatus as any)?.following) {
      unfollowMutation.mutate({ targetUserId: p.id });
    } else {
      followMutation.mutate({ targetUserId: p.id });
    }
  };

  const shareProfile = () => {
    const url = `https://www.onlydjss.com/${username}`;
    navigator.clipboard.writeText(url);
    toast("Profile link copied!");
  };

  // ── Dynamic SEO meta tags ──────────────────────────────────────────────
  const p = profile as any;
  const djDisplayName = p?.djName || p?.name || username;
  const djBio = p?.bio
    ? p.bio.slice(0, 160)
    : `${djDisplayName} is a DJ on ONLYDJS. Discover their tracks, edits, remixes and mashups.`;
  const djImage =
    p?.profileImageUrl || p?.avatarUrl || "https://www.onlydjss.com/logo-new-gradient.webp";
  const djUrl = `https://www.onlydjss.com/${username}`;
  const followersCount = Number(p?.followers_count || 0);
  const trackCount = Number(p?.track_count || 0);
  const seoTitle = p
    ? `${djDisplayName} (@${username}) – DJ Profile on ONLYDJS`
    : `ONLYDJS – The Operating System for DJs`;
  const seoDescription = p
    ? `${djBio} · ${followersCount.toLocaleString()} followers · ${trackCount} tracks on ONLYDJS.`
    : djBio;

  useSEO({
    title: seoTitle,
    description: seoDescription,
    image: djImage,
    url: djUrl,
    type: "profile",
    twitterCard: "summary_large_image",
    extra: {
      "profile:username": username,
      "og:locale": "en_US",
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-48 bg-muted animate-pulse" />
        <div className="max-w-4xl mx-auto px-4 -mt-16 pb-8">
          <Skeleton className="w-32 h-32 rounded-full" />
          <Skeleton className="h-8 w-48 mt-4" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Headphones className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h1 className="text-2xl font-bold mb-2">DJ Not Found</h1>
          <p className="text-muted-foreground mb-6">The profile @{username} doesn&apos;t exist.</p>
          <Button onClick={() => navigate("/explore")}>Explore DJs</Button>
        </div>
      </div>
    );
  }

  const socialLinks = (() => {
    try { return JSON.parse(p.socialLinks || "{}"); } catch { return {}; }
  })();

  const isOwnProfile = (user as any)?.id === p.id;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="h-48 bg-gradient-to-br from-primary/20 via-primary/10 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Profile Header */}
        <div className="relative -mt-16 pb-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Avatar */}
            <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
              <AvatarImage src={p.profileImageUrl || p.avatarUrl || ""} />
              <AvatarFallback className="text-3xl bg-primary/10">
                {(p.djName || p.name || username).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Info + Actions */}
            <div className="flex-1 sm:pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{p.djName || p.name || username}</h1>
                    {p.isVerified && (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    )}
                    {p.membershipStatus === "member" && (
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">PRO</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">@{p.username}</p>
                  {p.country && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />{p.country}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!isOwnProfile && (
                    <Button
                      onClick={handleFollowToggle}
                      variant={(followStatus as any)?.following ? "outline" : "default"}
                      size="sm"
                      disabled={followMutation.isPending || unfollowMutation.isPending}
                    >
                      <Users className="w-4 h-4 mr-1" />
                      {(followStatus as any)?.following ? "Following" : "Follow"}
                    </Button>
                  )}
                  {isOwnProfile && (
                    <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
                      Edit Profile
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
                    onClick={() => setShowShareProfile(true)}
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {p.bio && (
            <p className="mt-4 text-sm text-muted-foreground max-w-2xl">{p.bio}</p>
          )}

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-4">
            <div className="text-center">
              <p className="text-xl font-bold">{Number(p.followers_count || 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{Number(p.following_count || 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{Number(p.track_count || 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Tracks</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{Number(p.total_plays || 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Plays</p>
            </div>
          </div>

          {/* Social Links */}
          {Object.keys(socialLinks).length > 0 && (
            <div className="flex items-center gap-3 mt-4">
              {socialLinks.instagram && (
                <a href={`https://instagram.com/${socialLinks.instagram}`} target="_blank" rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {socialLinks.twitter && (
                <a href={`https://twitter.com/${socialLinks.twitter}`} target="_blank" rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {socialLinks.youtube && (
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              {socialLinks.soundcloud && (
                <a href={socialLinks.soundcloud} target="_blank" rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors">
                  <Disc3 className="w-5 h-5" />
                </a>
              )}
              {socialLinks.website && (
                <a href={socialLinks.website} target="_blank" rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors">
                  <Globe className="w-5 h-5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Tabs - Music first */}
        <div className="py-6">
          <Tabs defaultValue={defaultTab} onValueChange={(val) => navigate(`/${username}/${val}`, { replace: true })}>
            <TabsList className="mb-6 flex-wrap h-auto gap-1">
              <TabsTrigger value="tracks" className="flex items-center gap-2">
                <Music className="w-4 h-4" />Tracks
                {counts && <span className="ml-1 text-xs opacity-60">({counts.track})</span>}
              </TabsTrigger>
              <TabsTrigger value="edits" className="flex items-center gap-2">
                <Mic2 className="w-4 h-4" />Edits
                {counts && <span className="ml-1 text-xs opacity-60">({counts.edit})</span>}
              </TabsTrigger>
              <TabsTrigger value="remixes" className="flex items-center gap-2">
                <Disc3 className="w-4 h-4" />Remixes
                {counts && <span className="ml-1 text-xs opacity-60">({counts.remix})</span>}
              </TabsTrigger>
              <TabsTrigger value="mashups" className="flex items-center gap-2">
                <Headphones className="w-4 h-4" />Mashups
                {counts && <span className="ml-1 text-xs opacity-60">({counts.mashup})</span>}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tracks">
              <TrackList username={username} type="track" />
            </TabsContent>
            <TabsContent value="edits">
              <TrackList username={username} type="edit" />
            </TabsContent>
            <TabsContent value="remixes">
              <TrackList username={username} type="remix" />
            </TabsContent>
            <TabsContent value="mashups">
              <TrackList username={username} type="mashup" />
            </TabsContent>
          </Tabs>
        </div>

        {/* Social Feeds - below music */}
        <InstagramFeed username={username} />
        <TikTokFeed username={username} />
        <TwitterFeed username={username} />
        <ThreadsFeed username={username} />

        {/* Twitter link - solo visible si no hay embed activo (TwitterFeed ya lo muestra) */}
        <LastTweet username={username} hasEmbed={true} />
      </div>

      {/* Share Profile Modal */}
      {showShareProfile && (
        <ShareProfileModal
          profile={{
            ...p,
            followersCount: Number(p?.followers_count || 0),
            trackCount: Number(p?.track_count || 0),
          }}
          open={showShareProfile}
          onClose={() => setShowShareProfile(false)}
        />
      )}
    </div>
  );
}
