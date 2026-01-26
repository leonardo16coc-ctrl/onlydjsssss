import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, CheckCircle2, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";

const challengeIcons: Record<string, string> = {
  generate_sets: "🎛️",
  download_tracks: "⬇️",
  play_tracks: "▶️",
  upload_tracks: "⬆️",
  reach_plays: "🔥",
  complete_profile: "✅",
  enter_rankings: "🏆",
  gain_followers: "👥",
  use_dj_mode: "🧠",
  genre_specialist: "🎵",
};

const challengeTitles: Record<string, string> = {
  generate_sets: "Maestro de Sets",
  download_tracks: "Coleccionista",
  play_tracks: "Oyente Activo",
  upload_tracks: "Creador",
  reach_plays: "Viral",
  complete_profile: "Perfil Completo",
  enter_rankings: "Top DJ",
  gain_followers: "Influencer",
  use_dj_mode: "DJ Mode Pro",
  genre_specialist: "Especialista",
};

const challengeDescriptions: Record<string, (target: number) => string> = {
  generate_sets: (target) => `Genera ${target} sets con IA`,
  download_tracks: (target) => `Descarga ${target} tracks`,
  play_tracks: (target) => `Reproduce ${target} tracks`,
  upload_tracks: (target) => `Sube ${target} tracks originales`,
  reach_plays: (target) => `Alcanza ${target} reproducciones`,
  complete_profile: () => "Completa tu perfil al 100%",
  enter_rankings: (target) => `Entra al Top ${target}`,
  gain_followers: (target) => `Consigue ${target} nuevos seguidores`,
  use_dj_mode: (target) => `Usa DJ MODE ${target} días`,
  genre_specialist: (target) => `Descarga ${target} tracks del mismo género`,
};

export default function WeeklyChallengesCard() {
  const { data: challenges, isLoading } = trpc.weeklyChallenges.getMyWeeklyChallenges.useQuery();

  if (isLoading) {
    return (
      <Card className="bg-slate-900/50 border-yellow-500/30">
        <CardHeader>
          <CardTitle className="text-yellow-400 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            🎯 Retos Semanales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Cargando retos...</p>
        </CardContent>
      </Card>
    );
  }

  if (!challenges || challenges.length === 0) {
    return null;
  }

  const completedCount = challenges.filter(c => c.completed).length;
  const totalCount = challenges.length;

  return (
    <Card className="bg-slate-900/50 border-yellow-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-yellow-400 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              🎯 Retos Semanales
            </CardTitle>
            <CardDescription>Completa retos para ganar badges exclusivos</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-yellow-400">
              {completedCount}/{totalCount}
            </p>
            <p className="text-xs text-gray-400">Completados</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {challenges.map((challenge) => {
          const progress = (challenge.currentValue / challenge.targetValue) * 100;
          const icon = challengeIcons[challenge.challengeType] || "🎯";
          const title = challengeTitles[challenge.challengeType] || "Reto";
          const description = challengeDescriptions[challenge.challengeType]?.(challenge.targetValue) || "Completa este reto";

          return (
            <div
              key={challenge.id}
              className={`p-4 rounded-lg border transition-all ${
                challenge.completed
                  ? "bg-green-500/10 border-green-500/50"
                  : "bg-slate-800/50 border-slate-700/50"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white">{title}</h4>
                      {challenge.completed && (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{description}</p>
                    {challenge.badgeAwarded && (
                      <Badge variant="outline" className="border-yellow-500 text-yellow-400 text-xs mt-2">
                        Badge: {challenge.badgeAwarded}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-cyan-400">
                    {challenge.currentValue}/{challenge.targetValue}
                  </p>
                  <p className="text-xs text-gray-400">{Math.round(progress)}%</p>
                </div>
              </div>

              <Progress
                value={progress}
                className={`h-2 ${
                  challenge.completed ? "bg-green-900/30" : "bg-slate-700/50"
                }`}
              />

              {challenge.completed && challenge.completedAt && (
                <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Completado el {new Date(challenge.completedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          );
        })}

        {/* Reset Info */}
        <div className="flex items-center gap-2 text-xs text-gray-400 pt-2 border-t border-slate-700">
          <Clock className="w-4 h-4" />
          Los retos se resetean cada lunes
        </div>
      </CardContent>
    </Card>
  );
}
