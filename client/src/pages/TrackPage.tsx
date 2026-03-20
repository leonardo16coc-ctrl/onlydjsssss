import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "wouter";
import {
  Play, Pause, Download, Copy, Check, Music2, ExternalLink,
  Heart, Share2, ArrowLeft, Clock, BarChart2, Headphones
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDuration(s: number) {
  if (!s || isNaN(s)) return "0:00";
  const total = Math.floor(s);
  return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, "0")}`;
}

function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
}

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ─── Full Audio Player ────────────────────────────────────────────────────────
function FullPlayer({ track }: { track: any }) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(track.durationSeconds || 0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const recordStream = trpc.djProfiles.recordStream.useMutation();

  const audioSrc = track.previewFileUrl || track.audioFileUrl;

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
      recordStream.mutate({ trackId: track.id });
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!audio || !bar) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * (audio.duration || 0);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
      <audio
        ref={audioRef}
        src={audioSrc}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setCurrentTime(0); }}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || track.durationSeconds || 0)}
        onVolumeChange={() => setVolume(audioRef.current?.volume || 1)}
      />

      {/* Cover + Play */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-slate-800 shadow-lg">
          {track.coverImageUrl ? (
            <img src={track.coverImageUrl} alt={track.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music2 className="w-10 h-10 text-slate-600" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white truncate">{track.title}</h1>
          <p className="text-slate-400 text-base truncate">{track.artist}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {track.trackType && (
              <Badge variant="secondary" className="bg-slate-800 text-slate-300 text-xs">
                {track.trackType}
              </Badge>
            )}
            {track.genre && (
              <Badge variant="secondary" className="bg-slate-800 text-slate-300 text-xs">
                {track.genre}
              </Badge>
            )}
            {track.bpm && (
              <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs">
                {track.bpm} BPM
              </Badge>
            )}
            {track.musicalKey && (
              <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs">
                {track.musicalKey}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div
          ref={progressRef}
          onClick={seek}
          className="w-full h-2 bg-slate-700 rounded-full cursor-pointer group relative"
        >
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `calc(${progress}% - 6px)` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggle}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          {playing
            ? <Pause className="w-5 h-5 text-white fill-white" />
            : <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          }
        </button>

        {/* Volume */}
        <div className="flex items-center gap-2 ml-auto">
          <Headphones className="w-4 h-4 text-slate-500" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={e => {
              const v = parseFloat(e.target.value);
              setVolume(v);
              if (audioRef.current) audioRef.current.volume = v;
            }}
            className="w-20 accent-cyan-500"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Share Panel ──────────────────────────────────────────────────────────────
function SharePanel({ trackId, title }: { trackId: number; title: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/track/${trackId}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("¡Link copiado al portapapeles!");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("No se pudo copiar el link");
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      copy();
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5">
      <h3 className="text-white font-bold mb-3 flex items-center gap-2">
        <Share2 className="w-4 h-4 text-cyan-400" />
        Compartir con sellos
      </h3>
      <p className="text-slate-400 text-sm mb-4">
        Envía este link permanente a sellos discográficos, managers o colaboradores. No requiere cuenta para escuchar.
      </p>

      {/* URL display */}
      <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 mb-3">
        <span className="text-slate-300 text-sm truncate flex-1 font-mono">{url}</span>
        <button
          onClick={copy}
          className="flex-shrink-0 text-slate-400 hover:text-white transition-colors"
          title="Copiar link"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={copy}
          className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
        >
          {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? "¡Copiado!" : "Copiar Link"}
        </Button>
        <Button
          onClick={shareNative}
          variant="outline"
          className="border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TrackPage() {
  const params = useParams<{ id: string }>();
  const trackId = parseInt(params.id || "0", 10);

  const { data: track, isLoading, error } = trpc.djProfiles.getTrackById.useQuery(
    { trackId },
    { enabled: trackId > 0 }
  );

  // Set page title for SEO / when label opens the link
  useEffect(() => {
    if (track) {
      document.title = `${track.title} — ${track.artist} | ONLYDJS`;
    }
    return () => { document.title = "ONLYDJS"; };
  }, [track]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
        </div>
      </div>
    );
  }

  if (!track || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Music2 className="w-16 h-16 text-slate-600" />
          <h1 className="text-2xl font-bold text-white">Track no encontrado</h1>
          <p className="text-slate-400">Este track no existe o no está disponible públicamente.</p>
          <Link href="/">
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      {/* Background art blur */}
      {track.coverImageUrl && (
        <div
          className="fixed inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `url(${track.coverImageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(60px)",
            zIndex: 0,
          }}
        />
      )}

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-10">
        {/* Back button */}
        <Link href={`/dj/${track.username}`}>
          <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Ver perfil de {track.djName || track.name || track.username}
          </button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Player + Share */}
          <div className="lg:col-span-2 space-y-6">
            <FullPlayer track={track} />
            <SharePanel trackId={track.id} title={track.title} />
          </div>

          {/* Right: Info + DJ + Stats */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5">
              <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Estadísticas</h3>
              <div className="space-y-3">
                {[
                  { icon: Play, label: "Reproducciones", value: formatCount(track.streamCount || track.playCount || 0) },
                  { icon: Download, label: "Descargas", value: formatCount(track.downloadCount || 0) },
                  { icon: Heart, label: "Likes", value: formatCount(track.likeCount || 0) },
                  { icon: Clock, label: "Duración", value: formatDuration(track.durationSeconds) },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Icon className="w-4 h-4" />
                      {label}
                    </div>
                    <span className="text-white font-bold text-sm">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Track Info */}
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5">
              <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Información</h3>
              <div className="space-y-2 text-sm">
                {track.genre && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Género</span>
                    <span className="text-white">{track.genre}</span>
                  </div>
                )}
                {track.trackType && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tipo</span>
                    <span className="text-white">{track.trackType}</span>
                  </div>
                )}
                {track.bpm && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">BPM</span>
                    <span className="text-cyan-400 font-bold">{track.bpm}</span>
                  </div>
                )}
                {track.musicalKey && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tonalidad</span>
                    <span className="text-purple-400 font-bold">{track.musicalKey}</span>
                  </div>
                )}
                {track.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Publicado</span>
                    <span className="text-white">{formatDate(track.createdAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* DJ Card */}
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5">
              <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Artista</h3>
              <Link href={`/dj/${track.username}`}>
                <div className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 flex-shrink-0">
                    {track.profileImageUrl || track.avatarUrl ? (
                      <img
                        src={track.profileImageUrl || track.avatarUrl}
                        alt={track.djName || track.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music2 className="w-6 h-6 text-slate-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold truncate group-hover:text-cyan-400 transition-colors">
                      {track.djName || track.name || track.username}
                      {track.isVerified && <span className="ml-1 text-cyan-400 text-xs">✓</span>}
                    </p>
                    <p className="text-slate-400 text-xs truncate">@{track.username}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                </div>
              </Link>
              {track.bio && (
                <p className="text-slate-400 text-xs mt-3 leading-relaxed line-clamp-3">{track.bio}</p>
              )}
            </div>

            {/* Download Button */}
            {track.audioFileUrl && (
              <a href={track.audioFileUrl} download={`${track.title} - ${track.artist}`} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-lg shadow-cyan-500/20">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Track
                </Button>
              </a>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
