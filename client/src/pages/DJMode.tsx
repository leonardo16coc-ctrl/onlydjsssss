import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { 
  Activity, 
  TrendingUp, 
  Zap, 
  Music, 
  Target,
  Sparkles,
  Radio,
  Layers,
  BarChart3,
  Flame,
  Rocket,
  Heart
} from "lucide-react";
import { Link } from "wouter";
import DJDNABadge from "@/components/DJDNABadge";
import BadgeCard from "@/components/BadgeCard";

export default function DJMode() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [selectedTracks, setSelectedTracks] = useState<number[]>([]);
  const [setType, setSetType] = useState<"warmup" | "peak_time" | "closing" | "festival">("peak_time");

  // Queries
  const { data: profile, refetch: refetchProfile } = trpc.djMode.getMyProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: suggestions } = trpc.djMode.getSmartSuggestions.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: mySets } = trpc.djMode.getMySets.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: badges } = trpc.djMode.getMyBadges.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Mutations
  const updateProfileMutation = trpc.djMode.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Perfil DJ actualizado");
      refetchProfile();
    },
  });

  const buildSetMutation = trpc.djMode.buildAutoSet.useMutation({
    onSuccess: (data) => {
      toast.success(`Set "${data.setName}" creado exitosamente`);
      setSelectedTracks([]);
    },
  });

  useEffect(() => {
    if (isAuthenticated && profile) {
      // Actualizar perfil automáticamente al cargar
      updateProfileMutation.mutate();
    }
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando DJ MODE...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <Card className="max-w-md w-full bg-slate-900/50 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-cyan-400">🎛 DJ MODE</CardTitle>
            <CardDescription>Inicia sesión para acceder al cerebro del DJ moderno</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-gradient-to-r from-cyan-500 to-purple-500">
              <a href={getLoginUrl()}>Iniciar Sesión</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Parsear datos del perfil
  const favoriteGenres = profile?.favoriteGenres ? JSON.parse(profile.favoriteGenres) : [];
  const favoriteKeys = profile?.favoriteKeys ? JSON.parse(profile.favoriteKeys) : [];
  const favoriteMoods = profile?.favoriteMoods ? JSON.parse(profile.favoriteMoods) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <div className="border-b border-cyan-500/30 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                🎛 DJ MODE
              </h1>
              <p className="text-gray-400 mt-1">DJ Intelligence Platform</p>
            </div>
            <Badge variant="outline" className="border-cyan-500 text-cyan-400 text-lg px-4 py-2">
              Profile Score: {profile?.profileScore || 0}/100
            </Badge>
          </div>
        </div>
      </div>

      {/* DJ DNA Badge */}
      {profile && (
        <div className="container mx-auto px-4 py-6">
          <DJDNABadge profile={profile} size="lg" />
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/50">
            <TabsTrigger value="profile" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <Activity className="w-4 h-4 mr-2" />
              DJ Profile
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <Sparkles className="w-4 h-4 mr-2" />
              Smart Suggestions
            </TabsTrigger>
            <TabsTrigger value="setbuilder" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
              <Layers className="w-4 h-4 mr-2" />
              Auto Set Builder
            </TabsTrigger>
          </TabsList>

          {/* MÓDULO 1: DJ PROFILE ENGINE */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stats Cards */}
              <Card className="bg-slate-900/50 border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-cyan-400 flex items-center gap-2">
                    <Music className="w-5 h-5" />
                    Tracks Descargados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-white">{profile?.totalTracksDownloaded || 0}</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-purple-400 flex items-center gap-2">
                    <Radio className="w-5 h-5" />
                    Tracks Reproducidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-white">{profile?.totalTracksPlayed || 0}</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-pink-500/30">
                <CardHeader>
                  <CardTitle className="text-pink-400 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    BPM Promedio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-white">{profile?.avgBpm || "N/A"}</p>
                  {profile?.minBpm && profile?.maxBpm && (
                    <p className="text-sm text-gray-400 mt-2">
                      Rango: {profile.minBpm} - {profile.maxBpm}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Géneros Favoritos */}
            <Card className="bg-slate-900/50 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-400">🎵 Géneros Favoritos</CardTitle>
                <CardDescription>Basado en tu actividad reciente</CardDescription>
              </CardHeader>
              <CardContent>
                {favoriteGenres.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {favoriteGenres.map((g: any, idx: number) => (
                      <Badge 
                        key={idx} 
                        variant="outline" 
                        className="border-cyan-500 text-cyan-400 text-base px-4 py-2"
                      >
                        {g.genre} ({g.count})
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">Descarga o reproduce tracks para generar tu perfil</p>
                )}
              </CardContent>
            </Card>

            {/* Keys Favoritas */}
            <Card className="bg-slate-900/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-400">🎹 Tonalidades Preferidas</CardTitle>
                <CardDescription>Compatibilidad armónica (Camelot Wheel)</CardDescription>
              </CardHeader>
              <CardContent>
                {favoriteKeys.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {favoriteKeys.map((k: any, idx: number) => (
                      <Badge 
                        key={idx} 
                        variant="outline" 
                        className="border-purple-500 text-purple-400 text-base px-4 py-2"
                      >
                        {k.key} ({k.count})
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">Descarga o reproduce tracks para generar tu perfil</p>
                )}
              </CardContent>
            </Card>

            {/* Moods Favoritos */}
            {favoriteMoods.length > 0 && (
              <Card className="bg-slate-900/50 border-pink-500/30">
                <CardHeader>
                  <CardTitle className="text-pink-400">💫 Moods Favoritos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {favoriteMoods.map((m: any, idx: number) => (
                      <Badge 
                        key={idx} 
                        variant="outline" 
                        className="border-pink-500 text-pink-400 text-base px-4 py-2"
                      >
                        {m.mood} ({m.count})
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Badges */}
            <Card className="bg-slate-900/50 border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  🏆 Tus Badges
                </CardTitle>
                <CardDescription>Desbloquea badges completando desafíos</CardDescription>
              </CardHeader>
              <CardContent>
                {badges && badges.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {badges.map((badge) => (
                      <BadgeCard
                        key={badge.badgeType}
                        badgeType={badge.badgeType}
                        unlocked={badge.unlocked}
                        unlockedAt={badge.unlockedAt}
                        progress={badge.progress}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">Completa actividades para desbloquear badges</p>
                )}
              </CardContent>
            </Card>

            <Button 
              onClick={() => updateProfileMutation.mutate()}
              disabled={updateProfileMutation.isPending}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500"
            >
              {updateProfileMutation.isPending ? "Actualizando..." : "Actualizar Perfil Ahora"}
            </Button>
          </TabsContent>

          {/* MÓDULO 2: SMART DJ SUGGESTIONS */}
          <TabsContent value="suggestions" className="space-y-6">
            {/* Recomendado para ti */}
            <Card className="bg-slate-900/50 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                  <Flame className="w-5 h-5" />
                  🔥 Recomendado para ti
                </CardTitle>
                <CardDescription>Tracks perfectos para tu estilo</CardDescription>
              </CardHeader>
              <CardContent>
                {suggestions?.recommendedForYou && suggestions.recommendedForYou.length > 0 ? (
                  <div className="space-y-2">
                    {suggestions.recommendedForYou.slice(0, 5).map((track) => (
                      <Link key={track.id} href={`/explore?track=${track.id}`}>
                        <div className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer border border-cyan-500/20">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-white">{track.title}</p>
                              <p className="text-sm text-gray-400">{track.artist}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="border-cyan-500 text-cyan-400">
                                {track.bpm} BPM
                              </Badge>
                              {track.musicalKey && (
                                <Badge variant="outline" className="border-purple-500 text-purple-400 ml-2">
                                  {track.musicalKey}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">Descarga tracks para recibir recomendaciones personalizadas</p>
                )}
              </CardContent>
            </Card>

            {/* Sets Sugeridos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Warmup */}
              <Card className="bg-slate-900/50 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-blue-400 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Warmup Tracks
                  </CardTitle>
                  <CardDescription>Energía baja, BPM progresivo</CardDescription>
                </CardHeader>
                <CardContent>
                  {suggestions?.warmupTracks && suggestions.warmupTracks.length > 0 ? (
                    <div className="space-y-2">
                      {suggestions.warmupTracks.map((track) => (
                        <div key={track.id} className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="font-medium text-white text-sm">{track.title}</p>
                          <p className="text-xs text-gray-400">{track.artist}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No hay tracks disponibles</p>
                  )}
                </CardContent>
              </Card>

              {/* Peak Time */}
              <Card className="bg-slate-900/50 border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Peak Time Tracks
                  </CardTitle>
                  <CardDescription>Energía alta, drops masivos</CardDescription>
                </CardHeader>
                <CardContent>
                  {suggestions?.peakTimeTracks && suggestions.peakTimeTracks.length > 0 ? (
                    <div className="space-y-2">
                      {suggestions.peakTimeTracks.map((track) => (
                        <div key={track.id} className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="font-medium text-white text-sm">{track.title}</p>
                          <p className="text-xs text-gray-400">{track.artist}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No hay tracks disponibles</p>
                  )}
                </CardContent>
              </Card>

              {/* Closing */}
              <Card className="bg-slate-900/50 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-purple-400 flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Closing Tracks
                  </CardTitle>
                  <CardDescription>Energía descendente, emocional</CardDescription>
                </CardHeader>
                <CardContent>
                  {suggestions?.closingTracks && suggestions.closingTracks.length > 0 ? (
                    <div className="space-y-2">
                      {suggestions.closingTracks.map((track) => (
                        <div key={track.id} className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="font-medium text-white text-sm">{track.title}</p>
                          <p className="text-xs text-gray-400">{track.artist}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No hay tracks disponibles</p>
                  )}
                </CardContent>
              </Card>

              {/* Festival */}
              <Card className="bg-slate-900/50 border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="text-yellow-400 flex items-center gap-2">
                    <Rocket className="w-5 h-5" />
                    Festival Tracks
                  </CardTitle>
                  <CardDescription>Anthems, crowd control</CardDescription>
                </CardHeader>
                <CardContent>
                  {suggestions?.festivalTracks && suggestions.festivalTracks.length > 0 ? (
                    <div className="space-y-2">
                      {suggestions.festivalTracks.map((track) => (
                        <div key={track.id} className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="font-medium text-white text-sm">{track.title}</p>
                          <p className="text-xs text-gray-400">{track.artist}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No hay tracks disponibles</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Próximas Bombas */}
            <Card className="bg-slate-900/50 border-pink-500/30">
              <CardHeader>
                <CardTitle className="text-pink-400 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  🚀 Próximas Bombas
                </CardTitle>
                <CardDescription>Trending tracks de los últimos 7 días</CardDescription>
              </CardHeader>
              <CardContent>
                {suggestions?.trendingTracks && suggestions.trendingTracks.length > 0 ? (
                  <div className="space-y-2">
                    {suggestions.trendingTracks.map((track) => (
                      <Link key={track.id} href={`/explore?track=${track.id}`}>
                        <div className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer border border-pink-500/20">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-white">{track.title}</p>
                              <p className="text-sm text-gray-400">{track.artist}</p>
                            </div>
                            <Badge variant="outline" className="border-pink-500 text-pink-400">
                              {track.downloadCount} descargas
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No hay tracks trending disponibles</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* MÓDULO 3: AUTO SET BUILDER PRO */}
          <TabsContent value="setbuilder" className="space-y-6">
            <Card className="bg-slate-900/50 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-400">🎛 Auto Set Builder Pro</CardTitle>
                <CardDescription>
                  Genera sets automáticos con IA. Sube hasta 10 tracks y la IA creará el orden perfecto.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Tipo de Set
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button
                      variant={setType === "warmup" ? "default" : "outline"}
                      onClick={() => setSetType("warmup")}
                      className={setType === "warmup" ? "bg-blue-500" : ""}
                    >
                      Warmup
                    </Button>
                    <Button
                      variant={setType === "peak_time" ? "default" : "outline"}
                      onClick={() => setSetType("peak_time")}
                      className={setType === "peak_time" ? "bg-red-500" : ""}
                    >
                      Peak Time
                    </Button>
                    <Button
                      variant={setType === "closing" ? "default" : "outline"}
                      onClick={() => setSetType("closing")}
                      className={setType === "closing" ? "bg-purple-500" : ""}
                    >
                      Closing
                    </Button>
                    <Button
                      variant={setType === "festival" ? "default" : "outline"}
                      onClick={() => setSetType("festival")}
                      className={setType === "festival" ? "bg-yellow-500" : ""}
                    >
                      Festival
                    </Button>
                  </div>
                </div>

                <Separator className="bg-cyan-500/30" />

                <div>
                  <p className="text-sm text-gray-400 mb-4">
                    Selecciona tracks desde la página Explore y vuelve aquí para generar tu set.
                  </p>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" className="flex-1">
                      <Link href="/explore">Ir a Explore</Link>
                    </Button>
                    <Button
                      onClick={() => {
                        if (selectedTracks.length < 2) {
                          toast.error("Necesitas al menos 2 tracks para generar un set");
                          return;
                        }
                        buildSetMutation.mutate({
                          trackIds: selectedTracks,
                          setType: setType,
                        });
                      }}
                      disabled={selectedTracks.length < 2 || buildSetMutation.isPending}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500"
                    >
                      {buildSetMutation.isPending ? "Generando..." : `Generar Set (${selectedTracks.length} tracks)`}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mis Sets */}
            <Card className="bg-slate-900/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-400">📝 Mis Sets Generados</CardTitle>
              </CardHeader>
              <CardContent>
                {mySets && mySets.length > 0 ? (
                  <div className="space-y-3">
                    {mySets.map((set) => (
                      <div key={set.id} className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/20">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-white">{set.name}</p>
                            <p className="text-sm text-gray-400">{set.trackCount} tracks</p>
                          </div>
                          <Badge variant="outline" className="border-purple-500 text-purple-400">
                            {set.setType.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex gap-2 text-xs text-gray-400">
                          <span>BPM: {set.avgBpm}</span>
                          <span>•</span>
                          <span>Compatibilidad: {set.keyCompatibility}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No has generado sets todavía</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
