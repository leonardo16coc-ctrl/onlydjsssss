import { useParams, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import WaveformPlayer from "@/components/WaveformPlayer";
import ShareTrackButtons from "@/components/ShareTrackButtons";
import DownloadButton from "@/components/DownloadButton";
import AddToPlaylistButton from "@/components/AddToPlaylistButton";
import { useAuth } from "@/_core/hooks/useAuth";
import { 
  Play, 
  Heart, 
  Download, 
  Eye, 
  Calendar,
  Music2,
  Disc3,
  Clock,
  TrendingUp,
  User,
  Mail,
  Building2
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Lock, Globe, Copy, Check, RefreshCw, Loader2 } from "lucide-react";

export default function TrackDetail() {
  const params = useParams<{ id: string; username?: string }>();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isLiked, setIsLiked] = useState(false);
  const [localIsPrivate, setLocalIsPrivate] = useState<boolean | null>(null);
  const [localPrivateToken, setLocalPrivateToken] = useState<string | null>(null);
  const [localPrivateViews, setLocalPrivateViews] = useState<number>(0);
  const [privateLinkCopied, setPrivateLinkCopied] = useState(false);
  const utils = trpc.useUtils();

  const trackId = parseInt(params.id || "0");
  
  const { data: track, isLoading } = trpc.tracks.getById.useQuery({ id: trackId });

  // Sync privacy state from track data
  useEffect(() => {
    if (track) {
      setLocalIsPrivate((track as any).isPrivate ?? false);
      setLocalPrivateToken((track as any).privateToken ?? null);
      setLocalPrivateViews((track as any).privateViews ?? 0);
    }
  }, [track]);

  const setPrivacy = trpc.tracks.setPrivacy.useMutation({
    onSuccess: (data: any) => {
      const newPrivate = data.isPrivate !== undefined ? data.isPrivate : !localIsPrivate;
      setLocalIsPrivate(newPrivate);
      if (data.privateToken !== undefined) setLocalPrivateToken(data.privateToken);
      toast.success(newPrivate ? "🔒 Track ahora es PRIVADO — no visible en Explore" : "🌐 Track ahora es público — visible en Explore");
      utils.tracks.getById.invalidate({ id: trackId });
    },
  });

  const regenerateToken = trpc.tracks.regeneratePrivateToken.useMutation({
    onSuccess: (data: any) => {
      setLocalPrivateToken(data.privateToken);
      setLocalPrivateViews(0); // Reset counter on new token
      toast.success("🔄 Nuevo link privado generado — el anterior ya no funciona");
    },
  });

  const CANONICAL_DOMAIN = "https://www.onlydjss.com";
  const copyPrivateLink = async () => {
    if (!localPrivateToken) return;
    const url = `${CANONICAL_DOMAIN}/track/private/${localPrivateToken}`;
    await navigator.clipboard.writeText(url);
    setPrivateLinkCopied(true);
    toast.success("Link privado copiado", { description: url, duration: 4000 });
    setTimeout(() => setPrivateLinkCopied(false), 3000);
  };

  const isOwner = isAuthenticated && track && (user as any)?.id === (track as any)?.userId;

  // Redirect to canonical URL /dj/:username/track/:id once track data is loaded
  useEffect(() => {
    if (track && !params.username && track.username) {
      // Silently replace URL to canonical form without re-rendering
      window.history.replaceState(null, "", `/dj/${track.username}/track/${track.id}`);
    }
  }, [track, params.username]);
  // Related tracks will be added later
  const relatedTracks: any[] = [];

  // Like functionality will be added later
  const likeMutation = {
    mutate: () => {
      toast.info("Like feature coming soon!");
    }
  };

  // ── Enviar a sello: abre el cliente de correo con borrador pre-redactado ──
  const sendToLabel = () => {
    if (!track) return;
    const canonicalUrl = track.username
      ? `https://www.onlydjss.com/dj/${track.username}/track/${track.id}`
      : `https://www.onlydjss.com/track/${track.id}`;

    const formatDur = (secs: number) => {
      if (!secs || isNaN(secs)) return "N/A";
      const m = Math.floor(secs / 60);
      const s = Math.floor(secs % 60).toString().padStart(2, "0");
      return `${m}:${s}`;
    };

    const trackType = track.trackType
      ? track.trackType.charAt(0).toUpperCase() + track.trackType.slice(1)
      : "Track";

    const subject = encodeURIComponent(
      `Demo Submission: "${track.title}" [${trackType}] by ${track.artist}`
    );

    const body = encodeURIComponent(
`Hello,

I hope this message finds you well. My name is ${track.artist} and I would like to submit the following track for your consideration:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRACK INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title:    ${track.title}
Artist:   ${track.artist}
Type:     ${trackType}
Genre:    ${track.genre || "N/A"}
BPM:      ${track.bpm || "N/A"}
Key:      ${track.musicalKey || "N/A"}
Duration: ${formatDur(track.durationSeconds ?? 0)}

🎧 Listen & Download:
${canonicalUrl}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The track is available for streaming and download at the link above. Please feel free to reach out if you need any additional information, stems, or alternative formats.

Thank you for your time and consideration.

Best regards,
${track.artist}
— Powered by ONLYDJS | www.onlydjss.com`
    );

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    toast.success("📧 Abriendo cliente de correo...", {
      description: "El borrador ya tiene todos los datos del track listos para enviar.",
      duration: 4000,
    });
  };

  const handleLike = () => {
    if (!isAuthenticated) {
      toast.error("Please login to like tracks");
      return;
    }
    likeMutation.mutate();
  };

  // Update Open Graph meta tags when track loads
  useEffect(() => {
    if (track) {
      // Update page title
      document.title = `${track.title} by ${track.artist} - ONLYDJS`;
      
      // Update or create Open Graph meta tags
      const updateMetaTag = (property: string, content: string) => {
        let tag = document.querySelector(`meta[property="${property}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute('property', property);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
      };

      updateMetaTag('og:title', `${track.title} by ${track.artist}`);
      updateMetaTag('og:description', `Listen to ${track.title} by ${track.artist} on ONLYDJS. ${track.genre} • ${track.bpm} BPM • ${track.musicalKey || 'N/A'} Key`);
      updateMetaTag('og:image', track.coverImageUrl || '/logo-new-gradient.webp');
      updateMetaTag('og:type', 'music.song');
      const canonicalUrl = track.username
        ? `https://www.onlydjss.com/dj/${track.username}/track/${track.id}`
        : `https://www.onlydjss.com/track/${track.id}`;
      updateMetaTag('og:url', canonicalUrl);
      updateMetaTag('og:audio', track.audioFileUrl);
      updateMetaTag('music:musician', track.artist);
    }
  }, [track]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Track Not Found</h1>
            <p className="text-muted-foreground mb-8">The track you're looking for doesn't exist.</p>
            <Button onClick={() => setLocation("/explore")}>
              Browse Tracks
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Cover Art */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur">
              <div className="aspect-square relative group">
                <img
                  src={track.coverImageUrl || "/placeholder-cover.png"}
                  alt={track.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <div className="flex gap-2 w-full">
                    <Button 
                      size="lg" 
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Play
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Eye className="h-4 w-4" />
                    <span className="text-xs">Plays</span>
                  </div>
                  <div className="text-2xl font-bold">{track.playCount?.toLocaleString() || 0}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Heart className="h-4 w-4" />
                    <span className="text-xs">Likes</span>
                  </div>
                  <div className="text-2xl font-bold">{track.likeCount || 0}</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Track Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Artist */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
                  {track.genre}
                </Badge>

              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {track.title}
              </h1>
              <div className="flex items-center gap-3 mb-6">
                <Button
                  variant="ghost"
                  className="text-lg hover:text-cyan-400 transition-colors p-0 h-auto"
                  onClick={() => setLocation(`/dj/${track.artist}`)}
                >
                  <User className="h-5 w-5 mr-2" />
                  {track.artist}
                </Button>
                <span className="text-muted-foreground">•</span>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(track.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Audio Player with Waveform */}
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-6">
                <WaveformPlayer
                  audioUrl={track.audioFileUrl}
                />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                variant={isLiked ? "default" : "outline"}
                onClick={handleLike}
                className={isLiked ? "bg-pink-500 hover:bg-pink-600" : ""}
              >
                <Heart className={`h-5 w-5 mr-2 ${isLiked ? "fill-current" : ""}`} />
                {isLiked ? "Liked" : "Like"}
              </Button>

              <DownloadButton 
                trackId={track.id} 
                trackTitle={track.title}
                artist={track.artist}
              />

              <AddToPlaylistButton
                trackId={track.id}
                trackTitle={track.title}
              />

              <ShareTrackButtons
                trackId={track.id}
                trackTitle={track.title}
                artistName={track.artist}
                djUsername={track.username || params.username}
              />

              {/* Enviar a sello */}
              <Button
                size="lg"
                onClick={sendToLabel}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-orange-500/20 border-0"
              >
                <Building2 className="h-5 w-5 mr-2" />
                Enviar a sello
              </Button>
            </div>

            {/* Privacy Panel — owner only */}
            {isOwner && localIsPrivate !== null && (
              <Card className="bg-card/50 backdrop-blur border-amber-500/20">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      {localIsPrivate ? (
                        <>
                          <Lock className="w-4 h-4 text-amber-400" />
                          <span className="text-sm font-semibold text-amber-400 uppercase tracking-wide">PRIVADO</span>
                          <span className="text-sm text-muted-foreground">— no visible en Explore</span>
                        </>
                      ) : (
                        <>
                          <Globe className="w-4 h-4 text-green-400" />
                          <span className="text-sm font-semibold text-green-400 uppercase tracking-wide">PÚBLICO</span>
                          <span className="text-sm text-muted-foreground">— visible en Explore</span>
                        </>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`gap-1.5 ${
                        localIsPrivate
                          ? "border-green-500/40 text-green-400 hover:bg-green-500/10"
                          : "border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                      }`}
                      onClick={() => setPrivacy.mutate({ id: trackId, isPrivate: !localIsPrivate })}
                      disabled={setPrivacy.isPending}
                    >
                      {setPrivacy.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : localIsPrivate ? (
                        <Globe className="w-4 h-4" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                      {localIsPrivate ? "Hacer público" : "Hacer privado"}
                    </Button>
                  </div>

                  {localIsPrivate && localPrivateToken && (
                    <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-border/40">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Eye className="w-4 h-4 text-violet-400" />
                        <span>
                          <span className="font-semibold text-violet-400">{localPrivateViews}</span>
                          {" "}{localPrivateViews === 1 ? "escucha" : "escuchas"} al link privado
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 border-violet-500/40 text-violet-400 hover:bg-violet-500/10"
                          onClick={copyPrivateLink}
                        >
                          {privateLinkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {privateLinkCopied ? "Copiado" : "Copiar link privado"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-muted-foreground hover:text-amber-400"
                          onClick={() => regenerateToken.mutate({ id: trackId })}
                          disabled={regenerateToken.isPending}
                          title="Genera un nuevo link e invalida el anterior"
                        >
                          <RefreshCw className={`w-4 h-4 ${regenerateToken.isPending ? 'animate-spin' : ''}`} />
                          Nuevo link
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Separator className="bg-border/50" />

            {/* Track Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Music2 className="h-4 w-4" />
                  <span>BPM</span>
                </div>
                <div className="text-xl font-bold">{track.bpm || "N/A"}</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Disc3 className="h-4 w-4" />
                  <span>Key</span>
                </div>
                <div className="text-xl font-bold">{track.musicalKey || "N/A"}</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Clock className="h-4 w-4" />
                  <span>Plays</span>
                </div>
                <div className="text-xl font-bold">
                  {track.playCount?.toLocaleString() || "0"}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <TrendingUp className="h-4 w-4" />
                  <span>Downloads</span>
                </div>
                <div className="text-xl font-bold">
                  {track.downloadCount?.toLocaleString() || "0"}
                </div>
              </div>
            </div>


          </div>
        </div>

        {/* Related Tracks */}
        {relatedTracks && relatedTracks.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Tracks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedTracks.map((relatedTrack: any) => (
                <Card
                  key={relatedTrack.id}
                  className="group cursor-pointer hover:border-cyan-500/50 transition-all duration-300 bg-card/50 backdrop-blur border-border/50"
                  onClick={() => setLocation(`/track/${relatedTrack.id}`)}
                >
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={relatedTrack.coverUrl || "/placeholder-cover.png"}
                      alt={relatedTrack.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button size="icon" className="rounded-full bg-cyan-500 hover:bg-cyan-600">
                        <Play className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate group-hover:text-cyan-400 transition-colors">
                      {relatedTrack.title}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {relatedTrack.artistName}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className="text-xs">
                        {relatedTrack.genre}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {relatedTrack.bpm} BPM
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
