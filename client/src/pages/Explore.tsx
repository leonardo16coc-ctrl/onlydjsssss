import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Music, Play, Download, Heart, TrendingUp } from "lucide-react";
import { MusicAnalysisDisplay } from "@/components/MusicAnalysisDisplay";
import { useState, useEffect } from "react";
import AdvancedFilters, { SearchFilters } from "@/components/AdvancedFilters";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import AudioPlayer from "@/components/AudioPlayer";
import DownloadButton from "@/components/DownloadButton";

export default function Explore() {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [offset, setOffset] = useState(0);
  const limit = 20;

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
          <h1 className="text-4xl font-bold mb-2 text-glow-cyan">Explorar Música</h1>
          <p className="text-muted-foreground">
            Descubre tracks profesionales para tus sets. Usa los filtros para encontrar música compatible.
          </p>
        </div>

        {/* Advanced Filters */}
        <AdvancedFilters
          onSearch={handleSearch}
          filterOptions={filterOptions}
        />

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="text-muted-foreground mt-4">Buscando tracks...</p>
          </div>
        ) : searchResults && searchResults.tracks.length > 0 ? (
          <>
            {/* Results Count */}
            <div className="mb-4 text-sm text-muted-foreground">
              {searchResults.total} tracks encontrados
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
                        Trending
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
                      <span className="text-muted-foreground">Por:</span>
                      <a 
                        href={`/dj/${track.artistInfo.username}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {track.artistInfo.djName || track.artistInfo.name}
                      </a>
                      {track.artistInfo.isVerified && (
                        <Badge variant="default" className="text-xs">
                          Verificado
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Download Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      {track.downloadCount || 0} descargas
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
                  {isLoading ? "Cargando..." : "Cargar más"}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl font-semibold mb-2">No se encontraron tracks</p>
            <p className="text-muted-foreground">
              Intenta ajustar los filtros o buscar con otros términos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
