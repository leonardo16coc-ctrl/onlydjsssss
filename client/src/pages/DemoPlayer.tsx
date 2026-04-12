import { useEffect } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Download, Lock, Music, AlertTriangle } from "lucide-react";
import WaveformPlayer from "@/components/WaveformPlayer";

export default function DemoPlayer() {
  const { token } = useParams<{ token: string }>();

  // Inject noindex meta tag so search engines don't index this page
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  const { data: demo, isLoading, error } = trpc.tracks.getByDemoToken.useQuery(
    { token: token ?? "" },
    { enabled: !!token, retry: false }
  );

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-10 h-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          <p className="text-sm text-zinc-400">Cargando demo…</p>
        </div>
      </div>
    );
  }

  // ── Error / not found ────────────────────────────────────────────────────────
  if (error || !demo) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7 text-zinc-500" />
          </div>
          <h1 className="text-xl font-semibold text-white">Demo no disponible</h1>
          <p className="text-sm text-zinc-400">
            Este link de demo no existe o ha sido eliminado por el artista.
          </p>
        </div>
      </div>
    );
  }

  const canDownload = (demo as any).canDownload;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 py-12">
      {/* Watermark badge */}
      <div className="flex items-center gap-2 mb-8 text-xs text-zinc-500">
        <Lock className="w-3.5 h-3.5" />
        <span>Demo privado · No compartir sin autorización</span>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Cover */}
        <div className="relative aspect-square w-full max-h-64 overflow-hidden bg-zinc-800">
          {(demo as any).coverImageUrl ? (
            <img
              src={(demo as any).coverImageUrl}
              alt={(demo as any).title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="w-16 h-16 text-zinc-600" />
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent" />
        </div>

        {/* Info */}
        <div className="p-6 space-y-4">
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">{(demo as any).title}</h1>
            <p className="text-sm text-zinc-400 mt-1">{(demo as any).artist}</p>
          </div>

          {/* Metadata pills */}
          <div className="flex flex-wrap gap-2">
            {(demo as any).genre && (
              <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-xs text-zinc-300">
                {(demo as any).genre}
              </span>
            )}
            {(demo as any).bpm && (
              <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-xs text-zinc-300">
                {(demo as any).bpm} BPM
              </span>
            )}
            {(demo as any).musicalKey && (
              <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-xs text-zinc-300">
                {(demo as any).musicalKey}
              </span>
            )}
            {(demo as any).trackType && (
              <span className="px-2.5 py-1 rounded-full bg-violet-500/20 text-xs text-violet-300">
                {(demo as any).trackType}
              </span>
            )}
          </div>

          {/* Waveform player — full track, no limit */}
          {(demo as any).audioFileUrl && (
            <div className="mt-2">
              <WaveformPlayer audioUrl={(demo as any).audioFileUrl} />
            </div>
          )}

          {/* Download button */}
          {canDownload && (demo as any).audioFileUrl && (
            <a
              href={(demo as any).audioFileUrl}
              download={`${(demo as any).title} - ${(demo as any).artist}`}
              className="block"
            >
              <Button
                className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 text-white gap-2"
              >
                <Download className="w-4 h-4" />
                Descargar demo
              </Button>
            </a>
          )}

          {!canDownload && (
            <p className="text-xs text-center text-zinc-500">
              El artista no ha habilitado la descarga de este demo.
            </p>
          )}
        </div>
      </div>

      {/* Footer branding */}
      <p className="mt-8 text-xs text-zinc-600">
        Compartido a través de{" "}
        <a href="/" className="text-violet-400 hover:underline">ONLYDJS</a>
      </p>
    </div>
  );
}
