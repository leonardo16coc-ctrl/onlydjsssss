import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { DollarSign, Download, Music, TrendingUp } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Redirect } from "wouter";
import WeeklyChallengesCard from "@/components/WeeklyChallengesCard";

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();
  const { data: wallet } = trpc.wallet.get.useQuery();

  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8 text-glow-cyan">Dashboard</h1>

        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Cargando estadísticas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="card-neon p-6 bg-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Descargas Totales</p>
                <Download className="h-5 w-5 text-primary" />
              </div>
              <p className="text-3xl font-bold">{stats?.totalDownloads || 0}</p>
            </Card>

            <Card className="card-neon p-6 bg-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Tracks Subidos</p>
                <Music className="h-5 w-5 text-secondary" />
              </div>
              <p className="text-3xl font-bold">{stats?.totalTracks || 0}</p>
            </Card>

            <Card className="card-neon p-6 bg-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Ganancias Totales</p>
                <DollarSign className="h-5 w-5 text-accent" />
              </div>
              <p className="text-3xl font-bold">${stats?.totalEarnings.toFixed(2) || "0.00"}</p>
            </Card>

            <Card className="card-neon p-6 bg-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Este Mes</p>
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <p className="text-3xl font-bold">{stats?.monthlyDownloads || 0}</p>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="card-neon p-6 bg-card">
            <h2 className="text-2xl font-bold mb-4">Wallet</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Balance Disponible</span>
                <span className="text-2xl font-bold text-primary">
                  ${wallet?.availableBalance || "0.00"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Balance Pendiente</span>
                <span className="text-xl font-semibold">
                  ${wallet?.pendingBalance || "0.00"}
                </span>
              </div>
            </div>
          </Card>

          <Card className="card-neon p-6 bg-card">
            <h2 className="text-2xl font-bold mb-4">Actividad Reciente</h2>
            <p className="text-muted-foreground">Próximamente: historial de descargas y ganancias</p>
          </Card>
        </div>

        {/* Weekly Challenges */}
        <WeeklyChallengesCard />
      </div>
    </div>
  );
}