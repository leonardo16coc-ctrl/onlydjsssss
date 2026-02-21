import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, Users, TrendingUp, Clock, Instagram, Music } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function ScoutDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Queries
  const { data: overallStats, refetch: refetchOverall } = trpc.scoutStats.getOverallStats.useQuery();
  const { data: platformStats } = trpc.scoutStats.getByPlatform.useQuery();
  const { data: recentDJs } = trpc.scoutStats.getRecentDJs.useQuery();
  const { data: dailyStats } = trpc.scoutStats.getDailyStats.useQuery();
  const { data: topGenres } = trpc.scoutStats.getTopGenres.useQuery();
  const { data: schedulerStatus } = trpc.scoutControl.getStatus.useQuery();
  
  // Mutation
  const runScout = trpc.scoutControl.runScout.useMutation({
    onSuccess: () => {
      refetchOverall();
    },
  });
  
  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refetchOverall();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refetchOverall]);
  
  const handleRunScout = () => {
    if (confirm("¿Ejecutar scout manualmente? Esto puede tomar varios minutos.")) {
      runScout.mutate();
    }
  };
  
  const formatNextRun = (isoString: string | null) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleString("es", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-6">
      <div className="container max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Scout Dashboard</h1>
            <p className="text-slate-400">Sistema de descubrimiento automatizado 24/7</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <Clock className="w-4 h-4 mr-2" />
              Auto-refresh {autoRefresh ? "ON" : "OFF"}
            </Button>
            <Button
              onClick={handleRunScout}
              disabled={runScout.isPending || schedulerStatus?.scout?.isRunning}
            >
              {runScout.isPending || schedulerStatus?.scout?.isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Scout Now
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Total DJs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{overallStats?.total || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Discovered all-time</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-400">{overallStats?.todayCount || 0}</div>
              <p className="text-xs text-slate-500 mt-1">DJs discovered today</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Next Run</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-white">
                {formatNextRun(schedulerStatus?.scout?.nextRun || null)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Scheduled execution</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={schedulerStatus?.scout?.isRunning ? "default" : "secondary"}>
                {schedulerStatus?.scout?.isRunning ? "🟢 Running" : "⚪ Idle"}
              </Badge>
              <p className="text-xs text-slate-500 mt-2">
                Last: {schedulerStatus?.scout?.lastRun ? new Date(schedulerStatus.scout.lastRun).toLocaleTimeString() : "Never"}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Platform Distribution */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">DJs por Plataforma</CardTitle>
              <CardDescription>Distribución de descubrimientos</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platformStats || []}
                    dataKey="count"
                    nameKey="platform"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {(platformStats || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Daily Trend */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Tendencia Diaria</CardTitle>
              <CardDescription>Últimos 7 días</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyStats || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }} />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} name="DJs Discovered" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent DJs Table */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Últimos DJs Descubiertos</CardTitle>
            <CardDescription>Top 20 más recientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Platform</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Genre</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Followers</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Discovered</th>
                  </tr>
                </thead>
                <tbody>
                  {(recentDJs || []).map((dj) => (
                    <tr key={dj.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="py-3 px-4 text-white font-medium">
                        {dj.fullName || dj.soundcloudUsername || dj.instagramUsername || "Unknown"}
                      </td>
                      <td className="py-3 px-4">
                        {dj.soundcloudUsername && (
                          <Badge variant="outline" className="mr-1">
                            <Music className="w-3 h-3 mr-1" />
                            SC
                          </Badge>
                        )}
                        {dj.instagramUsername && (
                          <Badge variant="outline">
                            <Instagram className="w-3 h-3 mr-1" />
                            IG
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-300">{dj.primaryGenre || "N/A"}</td>
                      <td className="py-3 px-4 text-slate-300">
                        {(dj.soundcloudFollowers || dj.instagramFollowers || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={dj.discoveryStatus === "converted" ? "default" : "secondary"}>
                          {dj.discoveryStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {new Date(dj.discoveryDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        {/* Top Genres */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Top Géneros</CardTitle>
            <CardDescription>Géneros más populares descubiertos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {(topGenres || []).map((genre) => (
                <div key={genre.genre} className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-cyan-400">{genre.count}</div>
                  <div className="text-sm text-slate-300 mt-1">{genre.genre}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
