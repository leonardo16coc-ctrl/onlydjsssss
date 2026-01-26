import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Music, Play, Download, Heart } from "lucide-react";
import { useState } from "react";

export default function Explore() {
  const [search, setSearch] = useState("");
  const { data: tracks, isLoading } = trpc.tracks.list.useQuery({ limit: 50 });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8 text-glow-cyan">Explorar Música</h1>
        
        <div className="mb-8">
          <Input
            placeholder="Buscar por título, artista, género..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-2xl bg-card border-border"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Cargando tracks...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks?.map((track) => (
              <Card key={track.id} className="card-neon p-4 bg-card">
                <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                  {track.coverImageUrl ? (
                    <img src={track.coverImageUrl} alt={track.title} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Music className="h-16 w-16 text-muted-foreground" />
                  )}
                </div>
                <h3 className="font-bold text-lg mb-1">{track.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{track.artist}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <span className="bg-primary/20 px-2 py-1 rounded">{track.bpm} BPM</span>
                  <span className="bg-secondary/20 px-2 py-1 rounded">{track.musicalKey}</span>
                  <span className="bg-accent/20 px-2 py-1 rounded">{track.genre}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 btn-neon">
                    <Play className="h-4 w-4 mr-1" />
                    Play
                  </Button>
                  <Button size="sm" variant="outline">
                    <Heart className="h-4 w-4" />
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