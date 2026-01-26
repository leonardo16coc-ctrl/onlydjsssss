import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Sparkles, Play, Download } from "lucide-react";

export default function Mainstage() {
  const { data: tracks, isLoading } = trpc.rankings.mainstage.useQuery({ limit: 50 });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-glow-pink">
            <Sparkles className="inline h-12 w-12 mr-2" />
            MAINSTAGE EDITS
          </h1>
          <p className="text-xl text-muted-foreground">
            Tracks exclusivos para festivales y big stages
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Cargando tracks...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks?.map((track) => (
              <Card key={track.id} className="card-neon p-4 bg-card border-accent">
                <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center relative">
                  <Sparkles className="absolute top-2 right-2 h-6 w-6 text-accent" />
                  {track.coverImageUrl ? (
                    <img src={track.coverImageUrl} alt={track.title} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Sparkles className="h-16 w-16 text-accent" />
                  )}
                </div>
                <h3 className="font-bold text-lg mb-1">{track.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{track.artist}</p>
                <div className="flex items-center gap-2 text-xs mb-4">
                  <span className="bg-accent/20 px-2 py-1 rounded text-accent">{track.mainstageCategory}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-accent hover:bg-accent/90 glow-pink">
                    <Play className="h-4 w-4 mr-1" />
                    Play
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}