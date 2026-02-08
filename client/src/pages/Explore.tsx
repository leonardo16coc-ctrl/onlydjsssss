import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Music, Play, Download, Heart, TrendingUp, Edit, Trash2 } from "lucide-react";
import { MusicAnalysisDisplay } from "@/components/MusicAnalysisDisplay";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import AdvancedFilters, { SearchFilters } from "@/components/AdvancedFilters";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import AudioPlayer from "@/components/AudioPlayer";
import DownloadButton from "@/components/DownloadButton";
import DownloadLimitsCard from "@/components/DownloadLimitsCard";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Explore() {
  const { isAuthenticated, user } = useAuth();
  const { t } = useTranslation();
  const [filters, setFilters] = useState<SearchFilters>({});
  const [offset, setOffset] = useState(0);
  const limit = 20;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState<{ id: number; title: string } | null>(null);

  const utils = trpc.useUtils();
  const deleteTrackMutation = trpc.tracks.delete.useMutation({
    onSuccess: () => {
      toast.success("Track eliminado correctamente");
      utils.search.advancedSearch.invalidate();
      setDeleteDialogOpen(false);
      setTrackToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message || "Error al eliminar el track");
    },
  });

  // Get filter options
  const { data: filterOptions } = trpc.search.getFilterOptions.useQuery();

  // Search with filters
  const { data: searchResults, isLoading, refetch } = trpc.search.advancedSearch.useQuery({
    ...filters,
    limit,
    offset,
  });

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setOffset(0);
  };

  const handleLoadMore = () => {
    setOffset(prev => prev + limit);
  };

  useEffect(() => {
    refetch();
  }, [filters, offset]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-glow-cyan">{t('explore.title')}</h1>
          <p className="text-muted-foreground">
            {t('explore.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Advanced Filters */}
          <div className="lg:col-span-3">
            <AdvancedFilters
              onSearch={handleSearch}
              filterOptions={filterOptions}
            />
          </div>
          
          {/* Download Limits Card */}
          {isAuthenticated && (
            <div className="lg:col-span-1">
              <DownloadLimitsCard />
            </div>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="text-muted-foreground mt-4">{t('explore.searchingTracks')}</p>
          </div>
        ) : searchResults && searchResults.tracks.length > 0 ? (
          <>
            {/* Results Count */}
            <div className="mb-4 text-sm text-muted-foreground">
              {searchResults.total} {t('explore.tracksFound')}
            </div>

            {/* Tracks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.tracks.map((track) => (
                <Card key={track.id} className="card-neon p-4 bg-card hover:border-primary/50 transition-all">
                  {/* Cover Image */}
                  <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center overflow-hidden relative group">
                    {track.coverImageUrl ? (
                      <img 
                        src={track.coverImageUrl} 
                        alt={track.title} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <Music className="h-16 w-16 text-muted-foreground" />
                    )}
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="icon" variant="ghost" className="text-white hover:text-primary">
                        <Play className="h-6 w-6" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-white hover:text-primary">
                        <Heart className="h-6 w-6" />
                      </Button>
                    </div>

                    {/* Trending Badge */}
                    {track.downloadCount && track.downloadCount > 100 && (
                      <Badge className="absolute top-2 right-2 bg-primary/90">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {t('explore.trending')}
                      </Badge>
                    )}
                  </div>

                  {/* Track Info */}
                  <h3 className="font-bold text-lg mb-1 truncate">{track.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2 truncate">{track.artist}</p>

                  {/* Genre & Type */}
                  <div className="flex gap-2 mb-3">
                    {track.genre && (
                      <Badge variant="secondary" className="text-xs">
                        {track.genre}
                      </Badge>
                    )}
                    {track.trackType && (
                      <Badge variant="outline" className="text-xs">
                        {track.trackType}
                      </Badge>
                    )}
                  </div>

                  {/* Music Analysis */}
                  <div className="mb-4">
                    <MusicAnalysisDisplay
                      bpm={track.bpm || undefined}
                      musicalKey={track.musicalKey || undefined}
                      energy={track.energy || undefined}
                      compact
                    />
                  </div>

                  {/* Artist Info */}
                  {track.artistInfo && (
                    <div className="flex items-center gap-2 mb-4 text-sm">
                      <span className="text-muted-foreground">{t('explore.by')}</span>
                      <a 
                        href={`/dj/${track.artistInfo.username}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {track.artistInfo.djName || track.artistInfo.name}
                      </a>
                      {track.artistInfo.isVerified && (
                        <Badge variant="default" className="text-xs">
                          {t('explore.verified')}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Download Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      {track.downloadCount || 0} {t('explore.downloads')}
                    </span>
                  </div>

                  {/* Audio Player */}
                  {track.audioFileUrl && (
                    <div className="mb-4">
                      <AudioPlayer
                        audioUrl={track.audioFileUrl}
                        trackId={track.id}
                        trackTitle={`${track.artist} - ${track.title}`}
                        compact
                      />
                    </div>
                  )}

                  {/* Edit and Delete Buttons (only for track owner) */}
                  {user && track.userId === user.id && (
                    <div className="space-y-2 mb-2">
                      <Button
                        onClick={() => window.location.href = `/track/edit/${track.id}`}
                        variant="outline"
                        className="w-full"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Track
                      </Button>
                      <Button
                        onClick={() => {
                          setTrackToDelete({ id: track.id, title: track.title });
                          setDeleteDialogOpen(true);
                        }}
                        variant="destructive"
                        className="w-full"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar Track
                      </Button>
                    </div>
                  )}

                  {/* Download Button */}
                  <DownloadButton
                    trackId={track.id}
                    trackTitle={track.title}
                    artist={track.artist}
                    compact={false}
                  />
                </Card>
              ))}
            </div>

            {/* Load More */}
            {searchResults.hasMore && (
              <div className="text-center mt-8">
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? t('explore.loading') : t('explore.loadMore')}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl font-semibold mb-2">{t('explore.noTracksFound')}</p>
            <p className="text-muted-foreground">
              {t('explore.adjustFilters')}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar track?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar "{trackToDelete?.title}"? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (trackToDelete) {
                  deleteTrackMutation.mutate({ id: trackToDelete.id });
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
