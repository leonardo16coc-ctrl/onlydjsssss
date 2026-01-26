import { useState } from "react";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RankingFilters } from "@/components/RankingFilters";
import { Flame, Zap, Trophy, TrendingUp, Users, Music, Sparkles } from "lucide-react";

export default function Mainstage() {
  const [country, setCountry] = useState<string | undefined>();
  const [month, setMonth] = useState<string | undefined>();

  const { data: allRankings, isLoading } = trpc.festivalRankings.getAllRankings.useQuery({
    limit: 10,
    country,
    month,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {isLoading ? (
        <div className="container py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-500 animate-pulse" />
              <p className="text-muted-foreground">Cargando MAINSTAGE MODE...</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="container py-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                AI FESTIVAL ENGINE
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              MAINSTAGE MODE
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              El Billboard del DJ moderno. Rankings globales actualizados en tiempo real con inteligencia artificial.
            </p>
          </div>

          {/* Filtros */}
          <RankingFilters
            country={country}
            month={month}
            onCountryChange={setCountry}
            onMonthChange={setMonth}
            onClearFilters={() => {
              setCountry(undefined);
              setMonth(undefined);
            }}
          />

          {/* Rankings Tabs */}
          <Tabs defaultValue="weapons" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 mb-8">
              <TabsTrigger value="weapons" className="flex items-center gap-2">
                <Flame className="w-4 h-4" />
                <span className="hidden sm:inline">Festival Weapons</span>
                <span className="sm:hidden">Weapons</span>
              </TabsTrigger>
              <TabsTrigger value="anthems" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Peak Time</span>
                <span className="sm:hidden">Peak</span>
              </TabsTrigger>
              <TabsTrigger value="bombs" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Mainstage Bombs</span>
                <span className="sm:hidden">Bombs</span>
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Trending</span>
                <span className="sm:hidden">Trend</span>
              </TabsTrigger>
              <TabsTrigger value="djs" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Top DJs</span>
                <span className="sm:hidden">DJs</span>
              </TabsTrigger>
              <TabsTrigger value="genres" className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                <span className="hidden sm:inline">Genres</span>
                <span className="sm:hidden">Genre</span>
              </TabsTrigger>
              <TabsTrigger value="drops" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Energy Drops</span>
                <span className="sm:hidden">Drops</span>
              </TabsTrigger>
            </TabsList>

            {/* Festival Weapons */}
            <TabsContent value="weapons">
              <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
                <div className="flex items-center gap-2 mb-4">
                  <Flame className="w-6 h-6 text-orange-500" />
                  <h2 className="text-2xl font-bold">🔥 Festival Weapons</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Los tracks más poderosos para festivales. Ordenados por Festival Score.
                </p>
                <div className="space-y-3">
                  {allRankings?.festivalWeapons.map((track, index) => (
                    <div
                      key={track.trackId}
                      className="flex items-center gap-4 p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                    >
                      <div className="flex-shrink-0 w-12 text-center">
                        <span className={`text-2xl font-bold ${
                          index === 0 ? "text-yellow-500" :
                          index === 1 ? "text-gray-400" :
                          index === 2 ? "text-orange-600" :
                          "text-muted-foreground"
                        }`}>
                          #{index + 1}
                        </span>
                      </div>
                      {track.coverImageUrl && (
                        <img
                          src={track.coverImageUrl}
                          alt={track.title || "Track cover"}
                          className="w-16 h-16 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{track.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                        <p className="text-xs text-muted-foreground">{track.genre}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-500">
                          {track.festivalScore}
                        </div>
                        <div className="text-xs text-muted-foreground">Festival Score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Peak Time Anthems */}
            <TabsContent value="anthems">
              <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-6 h-6 text-yellow-500" />
                  <h2 className="text-2xl font-bold">🚀 Peak Time Anthems</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Los anthems definitivos para el momento peak del set.
                </p>
                <div className="space-y-3">
                  {allRankings?.peakTimeAnthems.map((track, index) => (
                    <div
                      key={track.trackId}
                      className="flex items-center gap-4 p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                    >
                      <div className="flex-shrink-0 w-12 text-center">
                        <span className={`text-2xl font-bold ${
                          index === 0 ? "text-yellow-500" :
                          index === 1 ? "text-gray-400" :
                          index === 2 ? "text-orange-600" :
                          "text-muted-foreground"
                        }`}>
                          #{index + 1}
                        </span>
                      </div>
                      {track.coverImageUrl && (
                        <img
                          src={track.coverImageUrl}
                          alt={track.title || "Track cover"}
                          className="w-16 h-16 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{track.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                        <p className="text-xs text-muted-foreground">{track.genre}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-yellow-500">
                          {track.peakTimeScore}
                        </div>
                        <div className="text-xs text-muted-foreground">Peak Time Score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Mainstage Bombs */}
            <TabsContent value="bombs">
              <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                  <h2 className="text-2xl font-bold">🎆 Mainstage Bombs</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Tracks perfectos para el mainstage. Máxima compatibilidad.
                </p>
                <div className="space-y-3">
                  {allRankings?.mainstageBombs.map((track, index) => (
                    <div
                      key={track.trackId}
                      className="flex items-center gap-4 p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                    >
                      <div className="flex-shrink-0 w-12 text-center">
                        <span className={`text-2xl font-bold ${
                          index === 0 ? "text-yellow-500" :
                          index === 1 ? "text-gray-400" :
                          index === 2 ? "text-orange-600" :
                          "text-muted-foreground"
                        }`}>
                          #{index + 1}
                        </span>
                      </div>
                      {track.coverImageUrl && (
                        <img
                          src={track.coverImageUrl}
                          alt={track.title || "Track cover"}
                          className="w-16 h-16 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{track.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                        <p className="text-xs text-muted-foreground">{track.genre}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-500">
                          {track.mainstageCompatibilityScore}
                        </div>
                        <div className="text-xs text-muted-foreground">Mainstage Score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Global Trending */}
            <TabsContent value="trending">
              <Card className="p-6 bg-gradient-to-br from-green-500/10 to-cyan-500/10 border-green-500/30">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                  <h2 className="text-2xl font-bold">🌍 Global Trending</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Tracks con mayor crecimiento en los últimos 7 días.
                </p>
                <div className="space-y-3">
                  {allRankings?.globalTrending.map((track, index) => (
                    <div
                      key={track.trackId}
                      className="flex items-center gap-4 p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                    >
                      <div className="flex-shrink-0 w-12 text-center">
                        <span className={`text-2xl font-bold ${
                          index === 0 ? "text-yellow-500" :
                          index === 1 ? "text-gray-400" :
                          index === 2 ? "text-orange-600" :
                          "text-muted-foreground"
                        }`}>
                          #{index + 1}
                        </span>
                      </div>
                      {track.coverImageUrl && (
                        <img
                          src={track.coverImageUrl}
                          alt={track.title || "Track cover"}
                          className="w-16 h-16 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{track.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                        <p className="text-xs text-muted-foreground">{track.genre}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-500">
                          {track.downloadCount}
                        </div>
                        <div className="text-xs text-muted-foreground">Downloads (7d)</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Top Festival DJs */}
            <TabsContent value="djs">
              <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-bold">🏆 Top Festival DJs</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  DJs con más tracks de alta calidad en festivales.
                </p>
                <div className="space-y-3">
                  {allRankings?.topFestivalDJs.map((dj, index) => (
                    <div
                      key={dj.userId}
                      className="flex items-center gap-4 p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                    >
                      <div className="flex-shrink-0 w-12 text-center">
                        <span className={`text-2xl font-bold ${
                          index === 0 ? "text-yellow-500" :
                          index === 1 ? "text-gray-400" :
                          index === 2 ? "text-orange-600" :
                          "text-muted-foreground"
                        }`}>
                          #{index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">{dj.userName}</h3>
                        <p className="text-sm text-muted-foreground">{dj.trackCount} tracks</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-500">
                          {dj.trackCount}
                        </div>
                        <div className="text-xs text-muted-foreground">Tracks</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Top Mainstage Genres */}
            <TabsContent value="genres">
              <Card className="p-6 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/30">
                <div className="flex items-center gap-2 mb-4">
                  <Music className="w-6 h-6 text-pink-500" />
                  <h2 className="text-2xl font-bold">🎵 Top Mainstage Genres</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Géneros dominantes en el mainstage.
                </p>
                <div className="space-y-3">
                  {allRankings?.topMainstageGenres.map((genre, index) => (
                    <div
                      key={genre.genre}
                      className="flex items-center gap-4 p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                    >
                      <div className="flex-shrink-0 w-12 text-center">
                        <span className={`text-2xl font-bold ${
                          index === 0 ? "text-yellow-500" :
                          index === 1 ? "text-gray-400" :
                          index === 2 ? "text-orange-600" :
                          "text-muted-foreground"
                        }`}>
                          #{index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">{genre.genre}</h3>
                        <p className="text-sm text-muted-foreground">{genre.trackCount} tracks</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-pink-500">
                          {genre.trackCount}
                        </div>
                        <div className="text-xs text-muted-foreground">Tracks</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Top Energy Drops */}
            <TabsContent value="drops">
              <Card className="p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-6 h-6 text-red-500" />
                  <h2 className="text-2xl font-bold">⚡ Top Energy Drops</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Tracks con los drops más explosivos.
                </p>
                <div className="space-y-3">
                  {allRankings?.topEnergyDrops.map((track, index) => (
                    <div
                      key={track.trackId}
                      className="flex items-center gap-4 p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                    >
                      <div className="flex-shrink-0 w-12 text-center">
                        <span className={`text-2xl font-bold ${
                          index === 0 ? "text-yellow-500" :
                          index === 1 ? "text-gray-400" :
                          index === 2 ? "text-orange-600" :
                          "text-muted-foreground"
                        }`}>
                          #{index + 1}
                        </span>
                      </div>
                      {track.coverImageUrl && (
                        <img
                          src={track.coverImageUrl}
                          alt={track.title || "Track cover"}
                          className="w-16 h-16 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{track.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                        <p className="text-xs text-muted-foreground">{track.genre}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-500">
                          {track.dropImpactScore}
                        </div>
                        <div className="text-xs text-muted-foreground">Drop Impact</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
