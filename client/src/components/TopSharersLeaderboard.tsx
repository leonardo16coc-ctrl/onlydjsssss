import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Trophy, TrendingUp, Share2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

const formatLabels: Record<string, string> = {
  story: "📸 Story",
  square: "🟦 Square",
  banner: "🖥 Banner",
};

const medalEmojis = ["🥇", "🥈", "🥉"];

export default function TopSharersLeaderboard() {
  const [period, setPeriod] = useState<"month" | "week" | "all-time">("month");
  const { user } = useAuth();
  
  const { data, isLoading } = trpc.dnaAnalytics.getTopSharers.useQuery({
    period,
    limit: 10,
  });

  const userPosition = data?.leaderboard.find((entry) => entry.userId === user?.id)?.position;

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-500/10 via-cyan-500/10 to-pink-500/10 border-purple-500/20">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          Top DJs Compartidores
        </h2>
      </div>

      <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="week">Esta Semana</TabsTrigger>
          <TabsTrigger value="month">Este Mes</TabsTrigger>
          <TabsTrigger value="all-time">Todo el Tiempo</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        </div>
      ) : data?.leaderboard && data.leaderboard.length > 0 ? (
        <div className="space-y-3">
          {data.leaderboard.map((entry) => {
            const isCurrentUser = entry.userId === user?.id;
            const isTop3 = entry.position <= 3;

            return (
              <div
                key={entry.userId}
                className={`
                  flex items-center gap-4 p-4 rounded-lg transition-all duration-300
                  ${isCurrentUser ? "bg-cyan-500/20 border-2 border-cyan-500 scale-105" : "bg-black/20 border border-white/10"}
                  ${isTop3 ? "shadow-lg" : ""}
                  hover:scale-102 hover:bg-white/5
                `}
              >
                {/* Posición */}
                <div className="flex-shrink-0 w-12 text-center">
                  {isTop3 ? (
                    <span className="text-3xl">{medalEmojis[entry.position - 1]}</span>
                  ) : (
                    <span className="text-2xl font-bold text-gray-400">#{entry.position}</span>
                  )}
                </div>

                {/* Info del DJ */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white truncate">
                      {entry.userName}
                      {isCurrentUser && <span className="ml-2 text-xs text-cyan-400">(Tú)</span>}
                    </p>
                    {entry.membershipStatus !== "free" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">
                        PRO
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">
                    Formato favorito: {formatLabels[entry.favoriteFormat] || entry.favoriteFormat}
                  </p>
                </div>

                {/* Total Shares */}
                <div className="flex items-center gap-2 text-right">
                  <Share2 className="w-4 h-4 text-cyan-500" />
                  <div>
                    <p className="text-2xl font-bold text-cyan-400">{entry.totalShares}</p>
                    <p className="text-xs text-gray-400">shares</p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Posición del usuario si no está en top 10 */}
          {user && !userPosition && (
            <div className="mt-6 p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <p className="text-sm text-gray-400 text-center">
                Sigue compartiendo tu ADN DJ para entrar al Top 10 🚀
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">
            Aún no hay compartidores en este período.
            <br />
            ¡Sé el primero en compartir tu ADN DJ!
          </p>
        </div>
      )}
    </Card>
  );
}
