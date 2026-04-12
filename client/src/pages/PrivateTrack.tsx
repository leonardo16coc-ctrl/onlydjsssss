import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Music, Download, Loader2, AlertCircle } from "lucide-react";
import WaveformPlayer from "@/components/WaveformPlayer";
import Navbar from "@/components/Navbar";

export default function PrivateTrack() {
  const { token } = useParams<{ token: string }>();
  const { data: track, isLoading, error } = trpc.tracks.getByPrivateToken.useQuery(
    { token: token ?? "" },
    { enabled: !!token, retry: false }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <AlertCircle className="w-14 h-14 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Link no encontrado</h2>
          <p className="text-muted-foreground max-w-sm">
            Este link privado no existe o ya no está disponible. Solicita un nuevo link al DJ.
          </p>
        </div>
      </div>
    );
  }

  const coverUrl = track.coverImageUrl || null;
  const durationMin = track.durationSeconds
    ? `${Math.floor(track.durationSeconds / 60)}:${String(track.durationSeconds % 60).padStart(2, "0")}`
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Private badge */}
        <div className="flex items-center gap-2 mb-6">
          <Lock className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary font-medium">Track privado — compartido contigo</span>
        </div>

        {/* Track card */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {/* Cover */}
          <div className="relative w-full aspect-square max-h-72 bg-muted flex items-center justify-center overflow-hidden">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={track.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Music className="w-20 h-20 text-muted-foreground/40" />
            )}
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            {/* Lock badge */}
            <div className="absolute top-3 right-3">
              <Badge className="bg-black/60 text-white border-0 backdrop-blur-sm gap-1">
                <Lock className="w-3 h-3" /> Privado
              </Badge>
            </div>
          </div>

          {/* Info */}
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-1 truncate">{track.title}</h1>
            <p className="text-muted-foreground mb-4">{track.artist}</p>

            {/* Metadata pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {track.genre && (
                <Badge variant="secondary">{track.genre}</Badge>
              )}
              {track.trackType && (
                <Badge variant="secondary">{track.trackType}</Badge>
              )}
              {track.bpm && (
                <Badge variant="outline">{track.bpm} BPM</Badge>
              )}
              {track.musicalKey && (
                <Badge variant="outline">{track.musicalKey}</Badge>
              )}
              {durationMin && (
                <Badge variant="outline">{durationMin}</Badge>
              )}
            </div>

            {/* Waveform player */}
            <WaveformPlayer audioUrl={track.audioFileUrl} />

            {/* Download button */}
            <a
              href={track.audioFileUrl}
              download={`${track.title} - ${track.artist}`}
              className="mt-4 block"
            >
              <Button className="w-full rounded-full bg-primary hover:bg-primary/90 gap-2">
                <Download className="w-4 h-4" />
                Descargar track
              </Button>
            </a>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Este track es privado y fue compartido mediante un link secreto.
              No lo redistribuyas sin permiso del artista.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
