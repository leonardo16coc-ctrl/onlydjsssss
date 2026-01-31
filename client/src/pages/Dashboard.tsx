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
import { DollarSign, Download, Music, TrendingUp, Info } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTranslation } from "react-i18next";

import WeeklyChallengesCard from "@/components/WeeklyChallengesCard";

export default function Dashboard() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();
  const { data: wallet } = trpc.wallet.getBalance.useQuery();

  // Datos de ejemplo para usuarios no autenticados
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

  // Usar datos reales si está autenticado, sino mostrar datos demo
  const displayStats = isAuthenticated ? stats : demoStats;
  const displayWallet = isAuthenticated ? wallet : demoWallet;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-glow-cyan">{t("dashboard.title")}</h1>
          {!isAuthenticated && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="border-yellow-500 text-yellow-400 bg-yellow-500/10 px-4 py-2 text-sm cursor-help flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    {t("dashboard.demoMode")}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{t("dashboard.demoModeTooltip")}</p>
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

        {/* Weekly Challenges */}
        <WeeklyChallengesCard />
      </div>
    </div>
  );
}