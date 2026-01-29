import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Trophy, TrendingUp, User } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Rankings() {
  const { t } = useTranslation();
  const { data: topDJs } = trpc.rankings.topDJs.useQuery({ limit: 100 });
  const { data: trending } = trpc.rankings.trending.useQuery({ days: 7, limit: 50 });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8 text-glow-purple">
          <Trophy className="inline h-10 w-10 mr-2" />
          {t('rankings.title')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="card-neon p-6 bg-card">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Trophy className="h-6 w-6 mr-2 text-primary" />
              {t('rankings.topDJs')}
            </h2>
            <div className="space-y-3">
              {topDJs?.slice(0, 10).map((dj, index) => (
                <div key={dj.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary w-8">#{index + 1}</div>
                  <User className="h-8 w-8 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-semibold">{dj.djName || dj.name}</p>
                    <p className="text-sm text-muted-foreground">{dj.totalDownloads} {t('rankings.downloads')}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="card-neon p-6 bg-card">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-accent" />
              {t('rankings.trending')}
            </h2>
            <div className="space-y-3">
              {trending?.slice(0, 10).map((track, index) => (
                <div key={track.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-accent w-8">#{index + 1}</div>
                  <div className="flex-1">
                    <p className="font-semibold">{track.title}</p>
                    <p className="text-sm text-muted-foreground">{track.artist}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">{track.downloadCount} {t('rankings.dls')}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
