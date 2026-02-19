import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { trpc } from "@/lib/trpc";
import { DollarSign, Download, Music, TrendingUp, Info, Play, Clock, Heart, ListMusic, Award, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTranslation } from "react-i18next";

import WeeklyChallengesCard from "@/components/WeeklyChallengesCard";

export default function Dashboard() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const isPremiumUser = isAuthenticated && user?.membershipStatus === "member";
  
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery(undefined, {
    enabled: isPremiumUser // Solo cargar stats si es premium
  });
  const { data: wallet } = trpc.wallet.getBalance.useQuery(undefined, {
    enabled: isPremiumUser // Solo cargar wallet si es premium
  });
  const { data: djScore } = trpc.earnings.getDJScore.useQuery(undefined, {
    enabled: isPremiumUser // Solo cargar djScore si es premium
  });
  const { data: monthlyMetrics } = trpc.earnings.getMonthlyMetrics.useQuery({ months: 6 }, {
    enabled: isPremiumUser // Solo cargar metrics si es premium
  });

  // Datos de ejemplo para usuarios FREE o no autenticados
  const demoStats = {
    totalDownloads: 1247,
    totalTracks: 89,
    totalEarnings: 3456.78,
    monthlyDownloads: 342
  };

  const demoWallet = {
    available: 1234.56,
    pending: 567.89
  };

  // Usar datos reales solo si es PREMIUM, sino mostrar datos demo
  const displayStats = isPremiumUser ? stats : demoStats;
  const displayWallet = isPremiumUser ? wallet : demoWallet;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-glow-cyan">Creator Hub</h1>
          {!isPremiumUser && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="border-yellow-500 text-yellow-400 bg-yellow-500/10 px-4 py-2 text-sm cursor-help flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    {isAuthenticated ? "Vista Demo (FREE)" : t("dashboard.demoMode")}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{isAuthenticated ? "Suscríbete por $4.99/mes para ver tus estadísticas reales y ganancias." : t("dashboard.demoModeTooltip")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {isLoading && isAuthenticated ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">{t("dashboard.loading")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="card-neon p-6 bg-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{t("dashboard.totalDownloads")}</p>
                <Download className="h-5 w-5 text-primary" />
              </div>
              <p className="text-3xl font-bold">{displayStats?.totalDownloads || 0}</p>
            </Card>

            <Card className="card-neon p-6 bg-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{t("dashboard.tracksUploaded")}</p>
                <Music className="h-5 w-5 text-secondary" />
              </div>
              <p className="text-3xl font-bold">{displayStats?.totalTracks || 0}</p>
            </Card>

            <Card className="card-neon p-6 bg-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{t("dashboard.totalEarnings")}</p>
                <DollarSign className="h-5 w-5 text-accent" />
              </div>
              <p className="text-3xl font-bold">${typeof displayStats?.totalEarnings === 'number' ? displayStats.totalEarnings.toFixed(2) : "0.00"}</p>
            </Card>

            <Card className="card-neon p-6 bg-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{t("dashboard.thisMonth")}</p>
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <p className="text-3xl font-bold">{displayStats?.monthlyDownloads || 0}</p>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="card-neon p-6 bg-card">
            <h2 className="text-2xl font-bold mb-4">{t("dashboard.wallet")}</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("dashboard.availableBalance")}</span>
                <span className="text-2xl font-bold text-primary">
                  ${displayWallet?.available.toFixed(2) || "0.00"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("dashboard.pendingBalance")}</span>
                <span className="text-xl font-semibold">
                  ${displayWallet?.pending.toFixed(2) || "0.00"}
                </span>
              </div>
            </div>
          </Card>

          <Card className="card-neon p-6 bg-card">
            <h2 className="text-2xl font-bold mb-4">{t("dashboard.recentActivity")}</h2>
            <p className="text-muted-foreground">{t("dashboard.recentActivityDesc")}</p>
          </Card>
        </div>

        {/* DJ Score Section (only for PRO members) */}
        {isAuthenticated && djScore?.isPro && (
          <div className="mt-8">
            <h2 className="text-3xl font-bold mb-6 text-glow-purple">DJ Score & Métricas</h2>
            
            {/* DJ Score Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* DJ Score Card */}
              <Card className="card-neon p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-purple-300">DJ Score</h3>
                  <Award className="h-6 w-6 text-purple-400" />
                </div>
                <p className="text-5xl font-bold text-purple-400 mb-2">
                  {djScore.djScore.toFixed(0)}
                </p>
                <p className="text-sm text-muted-foreground">Puntuación total basada en impacto</p>
              </Card>

              {/* Metrics Grid */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                <Card className="card-neon p-4 bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Download className="h-5 w-5 text-cyan-400" />
                      <p className="text-sm text-muted-foreground">Descargas</p>
                    </div>
                    {djScore.growth?.downloads !== null && djScore.growth?.downloads !== undefined && (
                      <Badge 
                        variant="outline" 
                        className={`flex items-center gap-1 ${
                          djScore.growth.downloads > 0 
                            ? 'border-green-500/50 bg-green-500/10 text-green-400' 
                            : djScore.growth.downloads < 0 
                            ? 'border-red-500/50 bg-red-500/10 text-red-400'
                            : 'border-gray-500/50 bg-gray-500/10 text-gray-400'
                        }`}
                      >
                        {djScore.growth.downloads > 0 ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : djScore.growth.downloads < 0 ? (
                          <ArrowDown className="h-3 w-3" />
                        ) : (
                          <Minus className="h-3 w-3" />
                        )}
                        <span className="text-xs font-semibold">
                          {Math.abs(djScore.growth.downloads).toFixed(1)}%
                        </span>
                      </Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold">{djScore.metrics.downloads}</p>
                  <p className="text-xs text-cyan-400 mt-1">40% del Score</p>
                </Card>

                <Card className="card-neon p-4 bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Play className="h-5 w-5 text-green-400" />
                      <p className="text-sm text-muted-foreground">Streams</p>
                    </div>
                    {djScore.growth?.streams !== null && djScore.growth?.streams !== undefined && (
                      <Badge 
                        variant="outline" 
                        className={`flex items-center gap-1 ${
                          djScore.growth.streams > 0 
                            ? 'border-green-500/50 bg-green-500/10 text-green-400' 
                            : djScore.growth.streams < 0 
                            ? 'border-red-500/50 bg-red-500/10 text-red-400'
                            : 'border-gray-500/50 bg-gray-500/10 text-gray-400'
                        }`}
                      >
                        {djScore.growth.streams > 0 ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : djScore.growth.streams < 0 ? (
                          <ArrowDown className="h-3 w-3" />
                        ) : (
                          <Minus className="h-3 w-3" />
                        )}
                        <span className="text-xs font-semibold">
                          {Math.abs(djScore.growth.streams).toFixed(1)}%
                        </span>
                      </Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold">{djScore.metrics.streams}</p>
                  <p className="text-xs text-green-400 mt-1">30% del Score</p>
                </Card>

                <Card className="card-neon p-4 bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-orange-400" />
                      <p className="text-sm text-muted-foreground">Minutos</p>
                    </div>
                    {djScore.growth?.minutesListened !== null && djScore.growth?.minutesListened !== undefined && (
                      <Badge 
                        variant="outline" 
                        className={`flex items-center gap-1 ${
                          djScore.growth.minutesListened > 0 
                            ? 'border-green-500/50 bg-green-500/10 text-green-400' 
                            : djScore.growth.minutesListened < 0 
                            ? 'border-red-500/50 bg-red-500/10 text-red-400'
                            : 'border-gray-500/50 bg-gray-500/10 text-gray-400'
                        }`}
                      >
                        {djScore.growth.minutesListened > 0 ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : djScore.growth.minutesListened < 0 ? (
                          <ArrowDown className="h-3 w-3" />
                        ) : (
                          <Minus className="h-3 w-3" />
                        )}
                        <span className="text-xs font-semibold">
                          {Math.abs(djScore.growth.minutesListened).toFixed(1)}%
                        </span>
                      </Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold">{djScore.metrics.minutesListened}</p>
                  <p className="text-xs text-orange-400 mt-1">20% del Score</p>
                </Card>

                <Card className="card-neon p-4 bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Heart className="h-5 w-5 text-pink-400" />
                      <p className="text-sm text-muted-foreground">Favoritos + Playlists</p>
                    </div>
                    {djScore.growth?.favoritesPlaylists !== null && djScore.growth?.favoritesPlaylists !== undefined && (
                      <Badge 
                        variant="outline" 
                        className={`flex items-center gap-1 ${
                          djScore.growth.favoritesPlaylists > 0 
                            ? 'border-green-500/50 bg-green-500/10 text-green-400' 
                            : djScore.growth.favoritesPlaylists < 0 
                            ? 'border-red-500/50 bg-red-500/10 text-red-400'
                            : 'border-gray-500/50 bg-gray-500/10 text-gray-400'
                        }`}
                      >
                        {djScore.growth.favoritesPlaylists > 0 ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : djScore.growth.favoritesPlaylists < 0 ? (
                          <ArrowDown className="h-3 w-3" />
                        ) : (
                          <Minus className="h-3 w-3" />
                        )}
                        <span className="text-xs font-semibold">
                          {Math.abs(djScore.growth.favoritesPlaylists).toFixed(1)}%
                        </span>
                      </Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold">{djScore.metrics.favoritesPlaylists}</p>
                  <p className="text-xs text-pink-400 mt-1">10% del Score</p>
                </Card>
              </div>
            </div>

            {/* DJ Score Breakdown Chart */}
            <Card className="card-neon p-6 bg-card mb-8">
              <h3 className="text-xl font-semibold mb-6">Composición del DJ Score</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Descargas (40%)", value: djScore.breakdown.fromDownloads, fill: "#22d3ee" },
                      { name: "Streams (30%)", value: djScore.breakdown.fromStreams, fill: "#4ade80" },
                      { name: "Minutos (20%)", value: djScore.breakdown.fromMinutes, fill: "#fb923c" },
                      { name: "Favoritos+Playlists (10%)", value: djScore.breakdown.fromFavoritesPlaylists, fill: "#f472b6" },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    dataKey="value"
                  >
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Monthly Metrics Charts */}
            {monthlyMetrics && monthlyMetrics.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Downloads Chart */}
                <Card className="card-neon p-6 bg-card">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Download className="h-5 w-5 text-cyan-400" />
                    Evolución de Descargas
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={monthlyMetrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#888" 
                        tick={{ fill: '#888' }}
                      />
                      <YAxis stroke="#888" tick={{ fill: '#888' }} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "8px",
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="downloads" 
                        stroke="#22d3ee" 
                        strokeWidth={3}
                        dot={{ fill: "#22d3ee", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                {/* Streams Chart */}
                <Card className="card-neon p-6 bg-card">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Play className="h-5 w-5 text-green-400" />
                    Evolución de Streams
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={monthlyMetrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#888" 
                        tick={{ fill: '#888' }}
                      />
                      <YAxis stroke="#888" tick={{ fill: '#888' }} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "8px",
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="streams" 
                        stroke="#4ade80" 
                        strokeWidth={3}
                        dot={{ fill: "#4ade80", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                {/* Minutes Listened Chart */}
                <Card className="card-neon p-6 bg-card">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-400" />
                    Evolución de Minutos Escuchados
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={monthlyMetrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#888" 
                        tick={{ fill: '#888' }}
                      />
                      <YAxis stroke="#888" tick={{ fill: '#888' }} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "8px",
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="minutesListened" 
                        stroke="#fb923c" 
                        strokeWidth={3}
                        dot={{ fill: "#fb923c", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                {/* Combined Chart */}
                <Card className="card-neon p-6 bg-card">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                    Todas las Métricas
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={monthlyMetrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#888" 
                        tick={{ fill: '#888' }}
                      />
                      <YAxis stroke="#888" tick={{ fill: '#888' }} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="downloads" 
                        stroke="#22d3ee" 
                        strokeWidth={2}
                        name="Descargas"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="streams" 
                        stroke="#4ade80" 
                        strokeWidth={2}
                        name="Streams"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="minutesListened" 
                        stroke="#fb923c" 
                        strokeWidth={2}
                        name="Minutos"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Weekly Challenges */}
        <WeeklyChallengesCard />
      </div>
    </div>
  );
}