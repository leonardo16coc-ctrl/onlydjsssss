import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AIAnalyzer } from "@/components/AIAnalyzer";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTranslation } from "react-i18next";
import {
  Upload, Play, Download, TrendingUp, Music2, ChevronLeft, ChevronRight,
  Headphones, Disc3, Zap, Users
} from "lucide-react";

// ── Genre color map ────────────────────────────────────────────────────────
const GENRE_COLORS: Record<string, string> = {
  "Tech House": "from-cyan-500 to-teal-600",
  "Bass House": "from-orange-500 to-red-600",
  "Afro House": "from-amber-500 to-orange-600",
  "Techno": "from-slate-500 to-slate-700",
  "Melodic Techno": "from-purple-500 to-indigo-600",
  "Big Room": "from-blue-500 to-cyan-600",
  "EDM": "from-pink-500 to-rose-600",
  "Hard Techno": "from-red-600 to-rose-800",
  "Latin": "from-yellow-500 to-orange-500",
  "Reggaeton": "from-green-500 to-emerald-600",
  "Hip-Hop": "from-violet-500 to-purple-700",
  "Open Format": "from-fuchsia-500 to-pink-600",
};

function genreGradient(genre: string) {
  return GENRE_COLORS[genre] ?? "from-slate-600 to-slate-800";
}

// ── Trending Now (DJs Carousel) ────────────────────────────────────────────
function TrendingNowSection() {
  const { t } = useTranslation();
  const { data: djs, isLoading } = trpc.rankings.topDJs.useQuery({ limit: 20 });
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "right" ? 280 : -280, behavior: "smooth" });
  };

  return (
    <section className="py-8 border-b border-slate-800/60">
      <div className="container">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-full" />
            <h2 className="text-xl font-bold text-white">Trending Now</h2>
            <Badge variant="secondary" className="text-xs bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
              <TrendingUp className="w-3 h-3 mr-1" />
              Top DJs
            </Badge>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2 w-20">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <Skeleton className="h-3 w-14 rounded" />
                  <Skeleton className="h-2.5 w-10 rounded" />
                </div>
              ))
            : djs && djs.length > 0
            ? djs.map((dj) => (
                <Link key={dj.id} href={`/dj/${dj.username}`}>
                  <div className="flex-shrink-0 flex flex-col items-center gap-2 w-20 group cursor-pointer">
                    <div className="relative">
                      <Avatar className="w-16 h-16 ring-2 ring-transparent group-hover:ring-cyan-500/60 transition-all">
                        <AvatarImage src={dj.avatarUrl ?? undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-white font-bold text-lg">
                          {(dj.djName || dj.username || "?").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-2.5 h-2.5 text-white fill-white" />
                      </div>
                    </div>
                    <span className="text-xs text-slate-300 group-hover:text-white transition-colors text-center leading-tight line-clamp-2 w-full">
                      {dj.djName || dj.username || "DJ"}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                      <Download className="w-2.5 h-2.5" />
                      {(dj.totalDownloads || 0).toLocaleString()}
                    </span>
                  </div>
                </Link>
              ))
            : (
                <div className="flex items-center gap-3 py-4 text-slate-500 text-sm">
                  <Users className="w-4 h-4" />
                  <span>Los primeros DJs aparecerán aquí pronto</span>
                </div>
              )}
        </div>
      </div>
    </section>
  );
}

// ── Trending Tracks Carousel ───────────────────────────────────────────────
function TrendingTracksSection() {
  const { t } = useTranslation();
  const { data: tracks, isLoading } = trpc.rankings.trending.useQuery({ days: 30, limit: 20 });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<number | null>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "right" ? 320 : -320, behavior: "smooth" });
  };

  return (
    <section className="py-8 border-b border-slate-800/60">
      <div className="container">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-orange-400 to-pink-500 rounded-full" />
            <h2 className="text-xl font-bold text-white">Trending Tracks</h2>
            <Badge variant="secondary" className="text-xs bg-orange-500/10 text-orange-400 border-orange-500/20">
              <Disc3 className="w-3 h-3 mr-1" />
              Top Downloads
            </Badge>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-44">
                  <Skeleton className="w-44 h-44 rounded-xl mb-2" />
                  <Skeleton className="h-3.5 w-36 rounded mb-1" />
                  <Skeleton className="h-3 w-24 rounded" />
                </div>
              ))
            : tracks && tracks.length > 0
            ? tracks.map((track) => (
                <Link key={track.id} href={`/explore?genre=${encodeURIComponent(track.genre)}`}>
                  <div
                    className="flex-shrink-0 w-44 group cursor-pointer"
                    onMouseEnter={() => setActiveId(track.id)}
                    onMouseLeave={() => setActiveId(null)}
                  >
                    {/* Cover Art */}
                    <div className="relative w-44 h-44 rounded-xl overflow-hidden mb-2">
                      {track.coverImageUrl ? (
                        <img
                          src={track.coverImageUrl}
                          alt={track.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${genreGradient(track.genre)} flex items-center justify-center`}>
                          <Music2 className="w-10 h-10 text-white/60" />
                        </div>
                      )}
                      {/* Play overlay */}
                      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${activeId === track.id ? "opacity-100" : "opacity-0"}`}>
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl">
                          <Play className="w-5 h-5 text-slate-900 fill-slate-900 ml-0.5" />
                        </div>
                      </div>
                      {/* Genre badge */}
                      <div className="absolute top-2 left-2">
                        <span className="text-[10px] font-medium bg-black/60 text-white px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                          {track.genre}
                        </span>
                      </div>
                      {/* Download count */}
                      <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                        <Download className="w-2.5 h-2.5" />
                        {track.downloadCount}
                      </div>
                    </div>
                    {/* Info */}
                    <p className="text-sm font-semibold text-white leading-tight line-clamp-1 group-hover:text-cyan-400 transition-colors">
                      {track.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{track.artist}</p>
                    {track.bpm && (
                      <p className="text-[10px] text-slate-500 mt-0.5">{track.bpm} BPM · {track.trackType}</p>
                    )}
                  </div>
                </Link>
              ))
            : (
                <div className="flex items-center gap-3 py-4 text-slate-500 text-sm">
                  <Music2 className="w-4 h-4" />
                  <span>Los primeros tracks aparecerán aquí pronto</span>
                </div>
              )}
        </div>
      </div>
    </section>
  );
}

// ── Recently Added Tracks ──────────────────────────────────────────────────
function RecentTracksSection() {
  const { data: tracks, isLoading } = trpc.tracks.list.useQuery({ limit: 16 });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<number | null>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "right" ? 320 : -320, behavior: "smooth" });
  };

  if (!isLoading && (!tracks || tracks.length === 0)) return null;

  return (
    <section className="py-8 border-b border-slate-800/60">
      <div className="container">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full" />
            <h2 className="text-xl font-bold text-white">Nuevos Tracks</h2>
            <Badge variant="secondary" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/20">
              <Zap className="w-3 h-3 mr-1" />
              Recién subidos
            </Badge>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-44">
                  <Skeleton className="w-44 h-44 rounded-xl mb-2" />
                  <Skeleton className="h-3.5 w-36 rounded mb-1" />
                  <Skeleton className="h-3 w-24 rounded" />
                </div>
              ))
            : tracks!.map((track) => (
                <Link key={track.id} href={`/explore?genre=${encodeURIComponent(track.genre)}`}>
                  <div
                    className="flex-shrink-0 w-44 group cursor-pointer"
                    onMouseEnter={() => setActiveId(track.id)}
                    onMouseLeave={() => setActiveId(null)}
                  >
                    <div className="relative w-44 h-44 rounded-xl overflow-hidden mb-2">
                      {track.coverImageUrl ? (
                        <img
                          src={track.coverImageUrl}
                          alt={track.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${genreGradient(track.genre)} flex items-center justify-center`}>
                          <Music2 className="w-10 h-10 text-white/60" />
                        </div>
                      )}
                      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${activeId === track.id ? "opacity-100" : "opacity-0"}`}>
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl">
                          <Play className="w-5 h-5 text-slate-900 fill-slate-900 ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute top-2 left-2">
                        <span className="text-[10px] font-medium bg-black/60 text-white px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                          {track.genre}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-white leading-tight line-clamp-1 group-hover:text-purple-400 transition-colors">
                      {track.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{track.artist}</p>
                    {track.bpm && (
                      <p className="text-[10px] text-slate-500 mt-0.5">{track.bpm} BPM</p>
                    )}
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}

// ── Main Home ──────────────────────────────────────────────────────────────
export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />

      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden border-b border-slate-800/60">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0f0f0f] to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5" />

        <div className="container relative z-10 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            {/* Left: Title + description */}
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-3 py-1">
                  <Headphones className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs text-cyan-400 font-medium">La plataforma de DJs</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                <span className="text-white">Tu música.</span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Tu comunidad.
                </span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
                Descubre, sube y comparte tracks de DJ. Analiza BPM y tonalidad con IA. Conecta con la comunidad global de DJs.
              </p>

              {/* Quick stats */}
              <div className="flex flex-wrap gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-slate-300"><strong className="text-white">10K+</strong> DJs activos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Music2 className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-slate-300"><strong className="text-white">500K+</strong> tracks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-pink-400" />
                  <span className="text-sm text-slate-300"><strong className="text-white">2M+</strong> descargas</span>
                </div>
              </div>
            </div>

            {/* Right: Upload CTA */}
            <div className="flex flex-col items-start md:items-end gap-4">
              <Link href="/upload">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold px-8 py-5 rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:scale-105 text-base"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Track
                </Button>
              </Link>
              <Link href="/explore">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-5 rounded-xl text-base"
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Explorar
                </Button>
              </Link>
              {!user && (
                <p className="text-xs text-slate-500 text-center">
                  Gratis para escuchar · Regístrate para subir
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trending Now (DJs) ── */}
      <TrendingNowSection />

      {/* ── Trending Tracks ── */}
      <TrendingTracksSection />

      {/* ── Nuevos Tracks ── */}
      <RecentTracksSection />

      {/* ── AI Analyzer ── */}
      <section className="border-b border-slate-800/60">
        <AIAnalyzer />
      </section>

      {/* ── Upload CTA Banner ── */}
      <section className="py-14 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-b border-slate-800/60">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-500/20">
              <Upload className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Comparte tu música con el mundo
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              Sube tus tracks, edits, remixes y mashups. La IA analiza BPM y tonalidad automáticamente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/upload">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold px-10 py-5 rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:scale-105 text-base"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Track
                </Button>
              </Link>
              <Link href="/explore">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white px-10 py-5 rounded-xl text-base"
                >
                  Explorar Tracks
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
