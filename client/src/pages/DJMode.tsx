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
  Heart,
  Share2,
  Info
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "wouter";
import DJDNABadge from "@/components/DJDNABadge";
import BadgeCard from "@/components/BadgeCard";
import SetDetailsModal from "@/components/SetDetailsModal";
import DJDNARadarChart from "@/components/DJDNARadarChart";
import BadgeUnlockedNotification from "@/components/BadgeUnlockedNotification";
import EnergyFlowChart from "@/components/EnergyFlowChart";
import ShareDJDNA from "@/components/ShareDJDNA";
import TopSharersLeaderboard from "@/components/TopSharersLeaderboard";
import { useNewBadges } from "@/hooks/useNewBadges";
import { useTranslation } from "react-i18next";

export default function DJMode() {
  const { t } = useTranslation();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [selectedTracks, setSelectedTracks] = useState<number[]>([]);
  const [setType, setSetType] = useState<"warmup" | "peak_time" | "closing" | "festival">("peak_time");
  const [selectedSetId, setSelectedSetId] = useState<number | null>(null);
  const [showSetDetails, setShowSetDetails] = useState(false);
  const [lastGeneratedSetId, setLastGeneratedSetId] = useState<number | null>(null);
  
  const utils = trpc.useUtils();

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

  const { data: setDetails } = trpc.djMode.getSetDetails.useQuery(
    { setId: selectedSetId! },
    { enabled: selectedSetId !== null }
  );

  const { data: lastGeneratedSetDetails } = trpc.djMode.getSetDetails.useQuery(
    { setId: lastGeneratedSetId! },
    { enabled: lastGeneratedSetId !== null }
  );

  // Badge notifications
  const { newBadge, clearNewBadge } = useNewBadges(badges);

  // Mutations
  const updateProfileMutation = trpc.djMode.updateProfile.useMutation({
    onSuccess: () => {
      toast.success(t("djMode.profileUpdated"));
      refetchProfile();
    },
  });

  const buildSetMutation = trpc.djMode.buildAutoSet.useMutation({
    onSuccess: (data) => {
      toast.success(t("djMode.setCreated", { name: data.setName }));
      setSelectedTracks([]);
      // Mostrar el set generado inmediatamente
      if (data && data.id) {
        setLastGeneratedSetId(data.id);
      }
      utils.djMode.getMySets.invalidate();
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
          <p className="text-gray-400">{t("djMode.loading")}</p>
        </div>
      </div>
    );
  }

  // Helper function to handle protected actions
  const handleProtectedAction = (action: () => void) => {
    if (!isAuthenticated) {
      toast.info(t("djMode.loginRequired"), {
        description: t("djMode.loginRequiredDesc"),
        action: {
          label: t("djMode.loginButton"),
          onClick: () => window.location.href = getLoginUrl(),
        },
      });
      return;
    }
    action();
  };

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
              <Link href="/">
                <div className="text-2xl font-black mb-2 cursor-pointer hover:opacity-80 transition-opacity bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  ONLYDJS
                </div>
              </Link>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                {t("djMode.loginTitle")}
              </h1>
              <p className="text-gray-400 mt-1">{t("djMode.subtitle")}</p>
            </div>
            <div className="flex items-center gap-3">
              {!isAuthenticated && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="border-yellow-500 text-yellow-400 bg-yellow-500/10 px-4 py-2 text-sm cursor-help flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        {t("djMode.demoMode")}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{t("djMode.demoModeTooltip")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <Badge variant="outline" className="border-cyan-500 text-cyan-400 text-lg px-4 py-2">
                {t("djMode.profileScore")}: {profile?.profileScore || 0}/100
              </Badge>
            </div>
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
          <TabsList className="grid w-full grid-cols-4 bg-slate-900/50">
            <TabsTrigger value="profile" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <Activity className="w-4 h-4 mr-2" />
              {t("djMode.tabProfile")}
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <Sparkles className="w-4 h-4 mr-2" />
              {t("djMode.tabSuggestions")}
            </TabsTrigger>
            <TabsTrigger value="setbuilder" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
              <Layers className="w-4 h-4 mr-2" />
              {t("djMode.tabSetBuilder")}
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400">
              <TrendingUp className="w-4 h-4 mr-2" />
              {t("djMode.tabLeaderboard")}
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
                    {t("djMode.tracksDownloaded")}
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
                    {t("djMode.tracksPlayed")}
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
                    {t("djMode.avgBpm")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-white">{profile?.avgBpm || "N/A"}</p>
                  {profile?.minBpm && profile?.maxBpm && (
                    <p className="text-sm text-gray-400 mt-2">
                      {t("djMode.bpmRange")}: {profile.minBpm} - {profile.maxBpm}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Géneros Favoritos */}
            <Card className="bg-slate-900/50 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-400">{t("djMode.favoriteGenres")}</CardTitle>
                <CardDescription>{t("djMode.favoriteGenresDesc")}</CardDescription>
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
                  <p className="text-gray-400">{t("djMode.noGenres")}</p>
                )}
              </CardContent>
            </Card>

            {/* Keys Favoritas */}
            <Card className="bg-slate-900/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-400">{t("djMode.favoriteKeys")}</CardTitle>
                <CardDescription>{t("djMode.favoriteKeysDesc")}</CardDescription>
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
                  <p className="text-gray-400">{t("djMode.noGenres")}</p>
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

            {/* DJ DNA Radar Chart */}
            {profile && (
              <Card className="bg-slate-900/50 border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-cyan-400 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    🧬 DJ DNA - Tu Huella Musical
                  </CardTitle>
                  <CardDescription>Visualización completa de tu identidad como DJ</CardDescription>
                </CardHeader>
                <CardContent>
                  <DJDNARadarChart profile={profile} size="lg" />
                </CardContent>
              </Card>
            )}

            {/* Share DJ DNA */}
            {profile && (
              <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-2 border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-cyan-400 flex items-center gap-2">
                    <Share2 className="w-5 h-5" />
                    📤 Compartir mi ADN DJ
                  </CardTitle>
                  <CardDescription>Comparte tu identidad musical en redes sociales</CardDescription>
                </CardHeader>
                <CardContent>
                  <ShareDJDNA profile={profile} />
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
              {/* {t("djMode.warmup")} */}
              <Card className="bg-slate-900/50 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-blue-400 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    {t("djMode.warmup")} Tracks
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
                    <p className="text-sm text-gray-400">{t("djMode.noFestivalTracks")}</p>
                  )}
                </CardContent>
              </Card>

              {/* {t("djMode.peakTime")} */}
              <Card className="bg-slate-900/50 border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    {t("djMode.peakTime")} Tracks
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
                    <p className="text-sm text-gray-400">{t("djMode.noFestivalTracks")}</p>
                  )}
                </CardContent>
              </Card>

              {/* {t("djMode.closing")} */}
              <Card className="bg-slate-900/50 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-purple-400 flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    {t("djMode.closing")} Tracks
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
                    <p className="text-sm text-gray-400">{t("djMode.noFestivalTracks")}</p>
                  )}
                </CardContent>
              </Card>

              {/* {t("djMode.festival")} */}
              <Card className="bg-slate-900/50 border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="text-yellow-400 flex items-center gap-2">
                    <Rocket className="w-5 h-5" />
                    {t("djMode.festival")} Tracks
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
                    <p className="text-sm text-gray-400">{t("djMode.noFestivalTracks")}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Próximas Bombas */}
            <Card className="bg-slate-900/50 border-pink-500/30">
              <CardHeader>
                <CardTitle className="text-pink-400 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {t("djMode.upcomingBombs")}
                </CardTitle>
                <CardDescription>{t("djMode.upcomingBombsDesc")}</CardDescription>
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
                              {track.downloadCount} {t("djMode.downloads")}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">{t("djMode.noTrendingTracks")}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* MÓDULO 3: AUTO SET BUILDER PRO */}
          <TabsContent value="setbuilder" className="space-y-6">
            <Card className="bg-slate-900/50 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-400">🎛 {t("djMode.tabSetBuilder")} Pro</CardTitle>
                <CardDescription>
                  {t("djMode.autoSetBuilderDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    {t("djMode.setType")}
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button
                      variant={setType === "warmup" ? "default" : "outline"}
                      onClick={() => handleProtectedAction(() => setSetType("warmup"))}
                      className={setType === "warmup" ? "bg-blue-500" : ""}
                    >
                      {t("djMode.warmup")}
                    </Button>
                    <Button
                      variant={setType === "peak_time" ? "default" : "outline"}
                      onClick={() => handleProtectedAction(() => setSetType("peak_time"))}
                      className={setType === "peak_time" ? "bg-red-500" : ""}
                    >
                      {t("djMode.peakTime")}
                    </Button>
                    <Button
                      variant={setType === "closing" ? "default" : "outline"}
                      onClick={() => handleProtectedAction(() => setSetType("closing"))}
                      className={setType === "closing" ? "bg-purple-500" : ""}
                    >
                      {t("djMode.closing")}
                    </Button>
                    <Button
                      variant={setType === "festival" ? "default" : "outline"}
                      onClick={() => handleProtectedAction(() => setSetType("festival"))}
                      className={setType === "festival" ? "bg-yellow-500" : ""}
                    >
                      {t("djMode.festival")}
                    </Button>
                  </div>
                </div>

                <Separator className="bg-cyan-500/30" />

                <div>
                  <p className="text-sm text-gray-400 mb-4">
                    {t("djMode.selectTracksDesc")}
                  </p>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" className="flex-1">
                      <Link href="/explore">{t("djMode.goToExplore")}</Link>
                    </Button>
                    <Button
                      onClick={() => handleProtectedAction(() => {
                        if (selectedTracks.length < 2) {
                          toast.error(t("djMode.minTracksError"));
                          return;
                        }
                        buildSetMutation.mutate({
                          trackIds: selectedTracks,
                          setType: setType,
                        });
                      })}
                      disabled={selectedTracks.length < 2 || buildSetMutation.isPending}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500"
                    >
                      {buildSetMutation.isPending ? t("djMode.generating") : `${t("djMode.generateSet")} (${selectedTracks.length} ${t("djMode.tracksCount", { count: selectedTracks.length })})`}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Set Generado - Resultado Inmediato */}
            {lastGeneratedSetDetails && (
              <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-2 border-cyan-500/50 animate-in fade-in slide-in-from-bottom-4">
                <CardHeader>
                  <CardTitle className="text-cyan-400 flex items-center gap-2">
                    <Sparkles className="w-6 h-6" />
                    {t("djMode.setGenerated")}: {lastGeneratedSetDetails.name}
                  </CardTitle>
                  <CardDescription>
                    {lastGeneratedSetDetails.tracks.length} tracks • BPM promedio: {lastGeneratedSetDetails.avgBpm} • {t("djMode.compatibility")}: {lastGeneratedSetDetails.keyCompatibility}%
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Energy Curve Timeline */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      {t("djMode.energyCurve")}
                    </h3>
                    <EnergyFlowChart tracks={lastGeneratedSetDetails.tracks} setType={lastGeneratedSetDetails.setType} />
                  </div>

                  <Separator className="bg-cyan-500/30" />

                  {/* Tracks con Transiciones */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      {t("djMode.mixingGuide")}
                    </h3>
                    <div className="space-y-4">
                      {lastGeneratedSetDetails.tracks.map((track, index) => (
                        <div key={track.id}>
                          {/* Track Card */}
                          <div className="p-4 bg-slate-800/50 rounded-lg border border-cyan-500/20">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold text-white">
                                  {index + 1}. {track.title}
                                </p>
                                <p className="text-sm text-gray-400">{track.artist}</p>
                              </div>
                              <Badge variant="outline" className="border-cyan-500 text-cyan-400">
                                {t("djMode.energy")}: {track.energy}/100
                              </Badge>
                            </div>
                            <div className="flex gap-3 text-xs text-gray-400">
                              <span>BPM: {track.bpm}</span>
                              <span>•</span>
                              <span>Key: {track.musicalKey}</span>
                            </div>
                          </div>

                          {/* Transición */}
                          {index < lastGeneratedSetDetails.tracks.length - 1 && lastGeneratedSetDetails.transitions && (
                            <div className="my-3 ml-8 p-3 bg-purple-500/10 border-l-2 border-purple-500 rounded-r-lg">
                              <p className="text-sm font-medium text-purple-400 mb-1 flex items-center gap-2">
                                {t("djMode.mixingTip")}
                              </p>
                              <p className="text-sm text-gray-300">
                                {lastGeneratedSetDetails.transitions[index]?.technique || "Transición suave"}
                              </p>
                              {lastGeneratedSetDetails.transitions[index]?.compatibility && (
                                <Badge variant="outline" className="mt-2 border-purple-500 text-purple-400 text-xs">
                                  {lastGeneratedSetDetails.transitions[index].compatibility}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-cyan-500/30" />

                  {/* Botón para cerrar */}
                  <Button
                    onClick={() => setLastGeneratedSetId(null)}
                    variant="outline"
                    className="w-full border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
                  >
                    {t("djMode.closeView")}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Mis Sets */}
            <Card className="bg-slate-900/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-400">{t("djMode.mySets")}</CardTitle>
              </CardHeader>
              <CardContent>
                {mySets && mySets.length > 0 ? (
                  <div className="space-y-3">
                    {mySets.map((set) => (
                      <div
                        key={set.id}
                        onClick={() => handleProtectedAction(() => {
                          setSelectedSetId(set.id);
                          setShowSetDetails(true);
                        })}
                        className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/20 hover:bg-slate-800 hover:border-purple-500/50 transition-all cursor-pointer"
                      >
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
                          <span>{t("djMode.compatibility")}: {set.keyCompatibility}%</span>
                        </div>
                        <p className="text-xs text-cyan-400 mt-2">{t("djMode.clickDetails")}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">{t("djMode.noSets")}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* MÓDULO 4: LEADERBOARD */}
          <TabsContent value="leaderboard" className="space-y-6">
            <TopSharersLeaderboard />
          </TabsContent>
        </Tabs>
      </div>

      {/* Set Details Modal */}
      <SetDetailsModal
        open={showSetDetails}
        onOpenChange={setShowSetDetails}
        setData={setDetails || null}
      />

      {/* Badge Unlocked Notification */}
      <BadgeUnlockedNotification
        badge={newBadge}
        onClose={clearNewBadge}
      />
    </div>
  );
}
