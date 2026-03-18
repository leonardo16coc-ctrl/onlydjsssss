import { useState, useRef } from "react";
import { Link } from "wouter";
import { Upload, Play, Pause, Download, ChevronLeft, ChevronRight, Music2, Brain, BarChart3, Users, Zap, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AIAnalyzer } from "@/components/AIAnalyzer";
import { trpc } from "@/lib/trpc";

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatDuration(s: number) {
  if (!s || isNaN(s)) return "";
  const total = Math.floor(s);
  return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, "0")}`;
}

// ─── Mini Play Button (used inside track cards) ──────────────────────────────
function TrackPlayButton({ audioUrl, trackId }: { audioUrl?: string; trackId: number }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const recordStream = trpc.djProfiles.recordStream.useMutation();

  if (!audioUrl) return null;

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      document.querySelectorAll("audio").forEach(a => { if (a !== audio) a.pause(); });
      audio.play().catch(() => {});
      recordStream.mutate({ trackId });
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={audioUrl}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      <button
        onClick={toggle}
        className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        aria-label={playing ? "Pausar" : "Reproducir"}
      >
        <div className="w-10 h-10 rounded-full bg-[#FF5500] flex items-center justify-center shadow-lg">
          {playing
            ? <Pause className="w-4 h-4 text-white fill-white" />
            : <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          }
        </div>
      </button>
    </>
  );
}

// ─── Trending Tracks Grid ────────────────────────────────────────────────────
function TrendingTracksSection() {
  const { data, isLoading } = trpc.djProfiles.getTrendingTracks.useQuery({ limit: 10 });
  const tracks = data?.tracks ?? [];

  return (
    <section style={{ background: "#141414" }} className="py-16 border-t border-[#333]">
      <div className="max-w-[1240px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[#FF5500] text-sm font-bold uppercase tracking-widest mb-1">Charts</p>
            <h2 className="text-white font-extrabold text-3xl tracking-tight">Trending Tracks</h2>
          </div>
          <Link href="/explore">
            <span className="text-[#A1A1A1] hover:text-white text-sm font-bold transition-colors cursor-pointer">
              Ver todos →
            </span>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-[#222] rounded" />
                <div className="mt-2 h-3 bg-[#222] rounded w-3/4" />
                <div className="mt-1 h-3 bg-[#222] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : tracks.length === 0 ? (
          <p className="text-[#555] text-center py-12">Aún no hay tracks disponibles</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {tracks.map((track: any) => (
              <Link key={track.id} href={`/dj/${track.username}`}>
                <div className="group cursor-pointer">
                  {/* Square cover art */}
                  <div className="relative aspect-square bg-[#222] rounded overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
                    {track.coverImageUrl ? (
                      <img
                        src={track.coverImageUrl}
                        alt={track.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music2 className="w-8 h-8 text-[#555]" />
                      </div>
                    )}
                    <TrackPlayButton
                      audioUrl={track.previewFileUrl || track.audioFileUrl}
                      trackId={track.id}
                    />
                    {/* Duration badge */}
                    {track.durationSeconds > 0 && (
                      <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                        {formatDuration(track.durationSeconds)}
                      </span>
                    )}
                  </div>
                  {/* Info */}
                  <div className="mt-2 px-0.5">
                    <p className="text-white text-sm font-bold leading-tight truncate">{track.title}</p>
                    <p className="text-[#A1A1A1] text-xs truncate mt-0.5">{track.djName || track.name || track.username}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {track.bpm && <span className="text-[#FF5500] text-[10px] font-bold">{track.bpm} BPM</span>}
                      {track.genre && <span className="text-[#555] text-[10px] truncate">{track.genre}</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Top DJs Carousel ────────────────────────────────────────────────────────
function TopDJsSection() {
  const { data, isLoading } = trpc.djProfiles.getFeaturedDJs.useQuery({ limit: 12, sortBy: "followers" });
  const djs = data?.djs ?? [];
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  return (
    <section style={{ background: "#141414" }} className="py-16 border-t border-[#333]">
      <div className="max-w-[1240px] mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[#FF5500] text-sm font-bold uppercase tracking-widest mb-1">Comunidad</p>
            <h2 className="text-white font-extrabold text-3xl tracking-tight">Top DJs</h2>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/explore">
              <span className="text-[#A1A1A1] hover:text-white text-sm font-bold transition-colors cursor-pointer mr-4">
                Ver todos →
              </span>
            </Link>
            <button
              onClick={() => scroll("left")}
              className="w-8 h-8 rounded-full border border-[#333] flex items-center justify-center text-white hover:border-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-8 h-8 rounded-full border border-[#333] flex items-center justify-center text-white hover:border-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse flex-shrink-0 w-32 text-center">
                <div className="w-20 h-20 rounded-full bg-[#222] mx-auto" />
                <div className="mt-2 h-3 bg-[#222] rounded w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollbarWidth: "none" }}
          >
            {djs.map((dj: any) => (
              <Link key={dj.id} href={`/dj/${dj.username}`}>
                <div className="group flex-shrink-0 w-32 text-center cursor-pointer">
                  <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden bg-[#222] border-2 border-[#333] group-hover:border-[#FF5500] transition-colors duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
                    {dj.profileImageUrl || dj.avatarUrl ? (
                      <img
                        src={dj.profileImageUrl || dj.avatarUrl}
                        alt={dj.djName || dj.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-[#555]" />
                      </div>
                    )}
                    {dj.isVerified && (
                      <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#FF5500] rounded-full flex items-center justify-center">
                        <span className="text-white text-[8px] font-bold">✓</span>
                      </div>
                    )}
                  </div>
                  <p className="text-white text-xs font-bold mt-2 truncate px-1">
                    {dj.djName || dj.name || dj.username}
                  </p>
                  <p className="text-[#A1A1A1] text-[10px] mt-0.5">
                    {Number(dj.followers_count || 0).toLocaleString()} seguidores
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Feature Cards ───────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Brain,
    title: "AI Set Generator",
    desc: "Genera sets perfectos con IA que entiende energía y mezcla armónica.",
    accent: "#FF5500",
  },
  {
    icon: BarChart3,
    title: "Analytics en Tiempo Real",
    desc: "Rastrea descargas, streams y ganancias con dashboards en vivo.",
    accent: "#FF5500",
  },
  {
    icon: Upload,
    title: "Upload Ilimitado",
    desc: "Sube tus tracks en MP3 y WAV con análisis automático de BPM y tonalidad.",
    accent: "#FF5500",
  },
  {
    icon: TrendingUp,
    title: "Charts & Trending",
    desc: "Aparece en los charts de la comunidad y gana visibilidad orgánica.",
    accent: "#FF5500",
  },
  {
    icon: Zap,
    title: "Análisis Instantáneo",
    desc: "BPM, key y energía detectados automáticamente al subir tu track.",
    accent: "#FF5500",
  },
  {
    icon: Users,
    title: "Red de DJs",
    desc: "Conecta con DJs de todo el mundo, sigue artistas y comparte tu música.",
    accent: "#FF5500",
  },
];

// ─── Main Home ───────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div style={{ background: "#141414", color: "#FFFFFF", fontFamily: "'Helvetica Neue', Arial, sans-serif" }} className="min-h-screen">
      <Navbar />

      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #141414 0%, #1a0a00 50%, #141414 100%)",
          padding: "96px 0",
        }}
      >
        {/* Subtle orange glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 70% 50%, rgba(255,85,0,0.08) 0%, transparent 70%)",
          }}
        />

        <div className="max-w-[1240px] mx-auto px-6 md:px-12 relative z-10">
          <div className="max-w-[50%] min-w-[320px]">
            {/* Label */}
            <p
              className="text-sm font-bold uppercase tracking-widest mb-4"
              style={{ color: "#FF5500" }}
            >
              La plataforma para DJs
            </p>

            {/* H1 */}
            <h1
              className="leading-none mb-6"
              style={{
                fontSize: "clamp(36px, 5vw, 56px)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                color: "#FFFFFF",
                textShadow: "0 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              Tu música.<br />
              Tu comunidad.<br />
              <span style={{ color: "#FF5500" }}>ONLYDJS.</span>
            </h1>

            <p
              className="mb-8 max-w-md"
              style={{ fontSize: "18px", lineHeight: 1.5, color: "#A1A1A1" }}
            >
              Sube, analiza y comparte tus tracks con la comunidad DJ más grande.
              Descubre trending tracks, conecta con artistas y haz crecer tu carrera.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link href="/upload">
                <button
                  className="flex items-center gap-2 font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: "#FFFFFF",
                    color: "#000000",
                    border: "none",
                    borderRadius: "4px",
                    padding: "12px 24px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
                  }}
                >
                  <Upload className="w-4 h-4" />
                  Upload Track
                </button>
              </Link>
              <Link href="/explore">
                <button
                  className="flex items-center gap-2 font-bold transition-all duration-200 hover:border-white"
                  style={{
                    background: "#222222",
                    color: "#FFFFFF",
                    border: "1px solid #333333",
                    borderRadius: "4px",
                    padding: "12px 24px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Play className="w-4 h-4 fill-current" />
                  Explorar Música
                </button>
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-8 mt-10">
              {[
                { value: "10K+", label: "DJs activos" },
                { value: "500K+", label: "Tracks" },
                { value: "2M+", label: "Descargas" },
              ].map(stat => (
                <div key={stat.label}>
                  <p className="text-white font-extrabold text-2xl leading-none">{stat.value}</p>
                  <p className="text-[#A1A1A1] text-xs mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trending Tracks Grid ─────────────────────────────────────────────── */}
      <TrendingTracksSection />

      {/* ── Top DJs Carousel ─────────────────────────────────────────────────── */}
      <TopDJsSection />

      {/* ── AI Analyzer ──────────────────────────────────────────────────────── */}
      <div style={{ borderTop: "1px solid #333" }}>
        <AIAnalyzer />
      </div>

      {/* ── Features Grid ────────────────────────────────────────────────────── */}
      <section style={{ background: "#141414", borderTop: "1px solid #333" }} className="py-20">
        <div className="max-w-[1240px] mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <p className="text-[#FF5500] text-sm font-bold uppercase tracking-widest mb-2">Herramientas</p>
            <h2
              className="text-white font-extrabold"
              style={{ fontSize: "clamp(28px, 4vw, 40px)", letterSpacing: "-0.01em" }}
            >
              Todo lo que necesitas como DJ
            </h2>
            <p className="text-[#A1A1A1] mt-3 text-lg">Herramientas profesionales en una sola plataforma</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: "#222222",
                  border: "1px solid #333333",
                  borderRadius: "4px",
                  padding: "24px",
                  cursor: "default",
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "#FF5500")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "#333333")}
              >
                <div
                  className="w-10 h-10 flex items-center justify-center mb-4 rounded"
                  style={{ background: "rgba(255,85,0,0.12)" }}
                >
                  <Icon className="w-5 h-5" style={{ color: "#FF5500" }} />
                </div>
                <h3 className="text-white font-bold text-base mb-2">{title}</h3>
                <p className="text-[#A1A1A1] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────────────────────────────── */}
      <section
        style={{
          background: "linear-gradient(180deg, #141414 0%, #1a0a00 50%, #141414 100%)",
          borderTop: "1px solid #333",
          padding: "64px 24px",
        }}
      >
        <div className="max-w-[1240px] mx-auto text-center">
          <p className="text-[#FF5500] text-sm font-bold uppercase tracking-widest mb-3">Únete ahora</p>
          <h2
            className="text-white font-extrabold mb-4"
            style={{ fontSize: "clamp(28px, 4vw, 40px)", letterSpacing: "-0.01em" }}
          >
            Empieza a subir tu música hoy
          </h2>
          <p className="text-[#A1A1A1] text-lg mb-8 max-w-lg mx-auto">
            Crea tu perfil, sube tus tracks y conecta con miles de DJs en todo el mundo.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/upload">
              <button
                className="flex items-center gap-2 font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "#FFFFFF",
                  color: "#000000",
                  border: "none",
                  borderRadius: "4px",
                  padding: "14px 32px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
                }}
              >
                <Upload className="w-4 h-4" />
                Upload tu primer track
              </button>
            </Link>
            <Link href="/explore">
              <button
                className="font-bold transition-all duration-200"
                style={{
                  background: "transparent",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "4px",
                  padding: "14px 32px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#A1A1A1")}
                onMouseLeave={e => (e.currentTarget.style.color = "#FFFFFF")}
              >
                Explorar la comunidad
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
