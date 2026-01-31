import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Download, Crown, Sparkles, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

/**
 * DownloadLimitsCard - Shows download limits and usage for current user
 */
export default function DownloadLimitsCard() {
  const [, setLocation] = useLocation();
  const { data: limits, isLoading } = trpc.downloads.getDownloadLimits.useQuery();
  const { data: stats } = trpc.downloads.getMyDownloadStats.useQuery();

  if (isLoading || !limits) {
    return null;
  }

  const { membershipStatus, dailyLimit, used, remaining, perTrackLimit } = limits;
  const percentage = dailyLimit === 0 ? 0 : (used / dailyLimit) * 100;

  const getMembershipColor = (status: string) => {
    switch (status) {
      case "verified":
        return "text-yellow-500";
      case "member":
        return "text-purple-500";
      default:
        return "text-gray-500";
    }
  };

  const getMembershipLabel = (status: string) => {
    switch (status) {
      case "verified":
        return "Studio";
      case "member":
        return "Pro";
      default:
        return "Free";
    }
  };

  const getProgressColor = () => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-cyan-500";
  };

  return (
    <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg mb-1">Descargas Disponibles</h3>
          <div className="flex items-center gap-2">
            <Crown className={`h-4 w-4 ${getMembershipColor(membershipStatus)}`} />
            <span className={`text-sm font-medium ${getMembershipColor(membershipStatus)}`}>
              Plan {getMembershipLabel(membershipStatus)}
            </span>
          </div>
        </div>
        {membershipStatus === "free" && (
          <Button
            size="sm"
            onClick={() => setLocation("/membership")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Upgrade
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Download count */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Hoy</span>
            <span className="text-sm font-medium">
              {membershipStatus === "member" || membershipStatus === "verified" ? (
                <span className={percentage >= 90 ? "text-red-500" : ""}>
                  {used} / {dailyLimit}
                </span>
              ) : (
                <span className="text-gray-500">0 / 0</span>
              )}
            </span>
          </div>
          {(membershipStatus === "member" || membershipStatus === "verified") && (
            <Progress value={percentage} className={`h-2 ${getProgressColor()}`} />
          )}
        </div>

        {/* Remaining downloads */}
        {(membershipStatus === "member" || membershipStatus === "verified") && (
          <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Descargas restantes hoy</span>
              <span className="text-2xl font-bold text-primary">{remaining}</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Máximo {perTrackLimit} descargas por track
            </div>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Download className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
              <span className="text-lg font-bold">{stats.totalDownloads}</span>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Este mes</span>
              </div>
              <span className="text-lg font-bold">{stats.thisMonthDownloads}</span>
            </div>
          </div>
        )}

        {/* Warning for low remaining */}
        {(membershipStatus === "member" || membershipStatus === "verified") && remaining <= 5 && remaining > 0 && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-xs text-yellow-600 dark:text-yellow-500">
              ⚠️ Te quedan solo {remaining} descargas hoy
            </p>
          </div>
        )}

        {/* Limit reached */}
        {(membershipStatus === "member" || membershipStatus === "verified") && remaining === 0 && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-xs text-red-600 dark:text-red-500 mb-2">
              🚫 Has alcanzado tu límite diario (20 descargas)
            </p>
            <p className="text-xs text-muted-foreground">
              Vuelve mañana para más descargas
            </p>
          </div>
        )}

        {/* Upgrade CTA for free users */}
        {membershipStatus === "free" && (
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-3">
              Actualiza a <span className="text-purple-500 font-medium">Pro ($4.99/mes)</span> para <span className="text-green-500 font-medium">20 descargas diarias</span>
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setLocation("/membership")}
              className="w-full"
            >
              Ver Planes
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
