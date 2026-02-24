import { useParams, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AudioPlayer from "@/components/AudioPlayer";
import ShareTrackButtons from "@/components/ShareTrackButtons";
import DownloadButton from "@/components/DownloadButton";
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
  User
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function TrackDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isLiked, setIsLiked] = useState(false);

  const trackId = parseInt(id || "0");
  
  const { data: track, isLoading } = trpc.tracks.getById.useQuery({ id: trackId });
  // Related tracks will be added later
  const relatedTracks: any[] = [];

  // Like functionality will be added later
  const likeMutation = {
    mutate: () => {
      toast.info("Like feature coming soon!");
    }
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
      updateMetaTag('og:url', `https://www.onlydjss.com/track/${track.id}`);
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

            {/* Audio Player */}
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-6">
                <AudioPlayer
                  audioUrl={track.audioFileUrl}
                  trackId={track.id}
                  trackTitle={track.title}
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

              <ShareTrackButtons
                trackId={track.id}
                trackTitle={track.title}
                artistName={track.artist}
              />
            </div>

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
