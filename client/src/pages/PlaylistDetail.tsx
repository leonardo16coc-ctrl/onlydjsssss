import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AudioPlayer from "@/components/AudioPlayer";
import ShareTrackButtons from "@/components/ShareTrackButtons";
import { Music, Play, Lock, Globe, ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

export default function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const playlistId = parseInt(id || "0");

  const { data: playlist, isLoading, refetch } = trpc.playlists.getById.useQuery(
    { id: playlistId },
    { enabled: !!playlistId }
  );

  const removeTrackMutation = trpc.playlists.removeTrack.useMutation({
    onSuccess: () => {
      toast.success("Track removed from playlist");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove track");
    },
  });

  // Update meta tags for social sharing
  useEffect(() => {
    if (playlist) {
      document.title = `${playlist.name} - ONLYDJS`;
      
      // Update Open Graph meta tags
      const metaTags = [
        { property: "og:title", content: playlist.name },
        { property: "og:description", content: playlist.description || `Playlist with ${playlist.tracks?.length || 0} tracks` },
        { property: "og:url", content: `https://www.onlydjss.com/playlist/${playlist.id}` },
        { property: "og:type", content: "music.playlist" },
      ];

      metaTags.forEach(({ property, content }) => {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
          meta = document.createElement("meta");
          meta.setAttribute("property", property);
          document.head.appendChild(meta);
        }
        meta.setAttribute("content", content);
      });
    }
  }, [playlist]);

  const handleRemoveTrack = (trackId: number, trackTitle: string) => {
    if (confirm(`Remove "${trackTitle}" from this playlist?`)) {
      removeTrackMutation.mutate({
        playlistId,
        trackId,
      });
    }
  };

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

  if (!playlist) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Playlist not found</h1>
          <Button onClick={() => setLocation("/my-playlists")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Playlists
          </Button>
        </div>
      </div>
    );
  }

  const tracks = playlist.tracks || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8 max-w-7xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => setLocation("/my-playlists")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Playlists
        </Button>

        {/* Playlist Header */}
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8 mb-12">
          {/* Cover Image */}
          <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center border border-border/50">
            {playlist.coverImageUrl ? (
              <img
                src={playlist.coverImageUrl}
                alt={playlist.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Music className="h-32 w-32 text-muted-foreground opacity-50" />
            )}
          </div>

          {/* Playlist Info */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              {playlist.isPublic ? (
                <Globe className="h-5 w-5 text-cyan-400" />
              ) : (
                <Lock className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="text-sm text-muted-foreground">
                {playlist.isPublic ? "Public Playlist" : "Private Playlist"}
              </span>
            </div>

            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {playlist.name}
            </h1>

            {playlist.description && (
              <p className="text-lg text-muted-foreground mb-6">
                {playlist.description}
              </p>
            )}

            <div className="flex items-center gap-4 mb-6">
              <div className="text-sm">
                <span className="font-semibold text-cyan-400">{tracks.length}</span>
                <span className="text-muted-foreground"> tracks</span>
              </div>
            </div>

            {/* Share Buttons */}
            <ShareTrackButtons
              trackId={playlist.id}
              trackTitle={playlist.name}
              artistName="ONLYDJS Playlist"
            />
          </div>
        </div>

        {/* Tracks List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-6">Tracks</h2>

          {tracks.length === 0 ? (
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="py-20 text-center">
                <Music className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No tracks yet</h3>
                <p className="text-muted-foreground">
                  Add tracks to this playlist from the Discover page
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {tracks.map((track: any, index: number) => (
                <Card
                  key={track.id}
                  className="border-border/50 bg-card/50 backdrop-blur hover:border-cyan-500/50 transition-all"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Position */}
                      <div className="text-muted-foreground font-mono text-sm w-8 text-center">
                        {index + 1}
                      </div>

                      {/* Cover */}
                      <div className="w-16 h-16 rounded overflow-hidden bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex-shrink-0">
                        {track.coverUrl ? (
                          <img
                            src={track.coverUrl}
                            alt={track.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className="h-6 w-6 text-muted-foreground opacity-50" />
                          </div>
                        )}
                      </div>

                      {/* Track Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{track.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {track.artistName || "Unknown Artist"}
                        </p>
                      </div>

                      {/* Metadata */}
                      <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                        {track.bpm && <span>{track.bpm} BPM</span>}
                        {track.key && <span>{track.key}</span>}
                        {track.genre && <span>{track.genre}</span>}
                      </div>

                      {/* Audio Player */}
                      <div className="flex-shrink-0">
                        <AudioPlayer
                          audioUrl={track.audioUrl}
                          trackId={track.id}
                          trackTitle={track.title}
                        />
                      </div>

                      {/* Remove Button */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveTrack(track.id, track.title)}
                        className="flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
