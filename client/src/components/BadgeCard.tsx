import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, Target, Sparkles, CheckCircle, TrendingUp, Star, Award, Music, Disc } from "lucide-react";

interface BadgeCardProps {
  badgeType: string;
  unlocked: boolean;
  unlockedAt?: Date | null;
  progress?: number;
}

const BADGE_CONFIG: Record<string, {
  icon: any;
  title: string;
  description: string;
  color: string;
  requirement: string;
}> = {
  club_killer: {
    icon: Disc,
    title: "🎧 Club Killer",
    description: "Dominas la pista de baile",
    color: "cyan",
    requirement: "100+ descargas totales",
  },
  festival_weapon: {
    icon: Zap,
    title: "🚀 Festival Weapon",
    description: "Tus tracks destrozan festivales",
    color: "yellow",
    requirement: "Track en Top 10 Mainstage",
  },
  peak_time_master: {
    icon: Target,
    title: "🔥 Peak Time Master",
    description: "Experto en momentos peak",
    color: "red",
    requirement: "50+ tracks peak time",
  },
  ai_power_dj: {
    icon: Sparkles,
    title: "🧠 AI Power DJ",
    description: "Maestro de la IA musical",
    color: "purple",
    requirement: "10+ sets generados con IA",
  },
  verified_dj: {
    icon: CheckCircle,
    title: "💎 Verified DJ",
    description: "DJ verificado oficialmente",
    color: "blue",
    requirement: "Membresía verificada activa",
  },
  precision_master: {
    icon: Target,
    title: "🎯 Precision Master",
    description: "Perfil DJ optimizado al máximo",
    color: "green",
    requirement: "Profile Score 90+",
  },
  rising_star: {
    icon: TrendingUp,
    title: "🌟 Rising Star",
    description: "Estrella en ascenso",
    color: "pink",
    requirement: "100+ seguidores",
  },
  top_10_dj: {
    icon: Trophy,
    title: "🏆 Top 10 DJ",
    description: "Entre los mejores DJs",
    color: "gold",
    requirement: "Ranking global Top 10",
  },
  sound_designer: {
    icon: Music,
    title: "🎨 Sound Designer",
    description: "Creador prolífico de música",
    color: "indigo",
    requirement: "20+ tracks subidos",
  },
  bass_lord: {
    icon: Award,
    title: "🔊 Bass Lord",
    description: "Señor del Bass House",
    color: "orange",
    requirement: "Especialista en Bass House",
  },
};

export default function BadgeCard({ badgeType, unlocked, unlockedAt, progress = 0 }: BadgeCardProps) {
  const config = BADGE_CONFIG[badgeType] || BADGE_CONFIG.club_killer;
  const Icon = config.icon;
  
  const colorClasses = {
    cyan: "border-cyan-500/50 bg-cyan-500/10",
    yellow: "border-yellow-500/50 bg-yellow-500/10",
    red: "border-red-500/50 bg-red-500/10",
    purple: "border-purple-500/50 bg-purple-500/10",
    blue: "border-blue-500/50 bg-blue-500/10",
    green: "border-green-500/50 bg-green-500/10",
    pink: "border-pink-500/50 bg-pink-500/10",
    gold: "border-yellow-400/50 bg-yellow-400/10",
    indigo: "border-indigo-500/50 bg-indigo-500/10",
    orange: "border-orange-500/50 bg-orange-500/10",
  };
  
  const iconColorClasses = {
    cyan: "text-cyan-400",
    yellow: "text-yellow-400",
    red: "text-red-400",
    purple: "text-purple-400",
    blue: "text-blue-400",
    green: "text-green-400",
    pink: "text-pink-400",
    gold: "text-yellow-300",
    indigo: "text-indigo-400",
    orange: "text-orange-400",
  };
  
  return (
    <div 
      className={`relative rounded-lg border p-4 transition-all ${
        unlocked 
          ? `${colorClasses[config.color as keyof typeof colorClasses]} hover:scale-105` 
          : "border-slate-700 bg-slate-800/30 opacity-60"
      }`}
    >
      {/* Badge desbloqueado */}
      {unlocked && (
        <div className="absolute -top-2 -right-2">
          <div className="bg-green-500 rounded-full p-1">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
      
      {/* Icono */}
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-lg ${unlocked ? colorClasses[config.color as keyof typeof colorClasses] : "bg-slate-700/50"}`}>
          <Icon className={`w-6 h-6 ${unlocked ? iconColorClasses[config.color as keyof typeof iconColorClasses] : "text-gray-500"}`} />
        </div>
        
        {!unlocked && progress > 0 && (
          <Badge variant="outline" className="border-gray-500 text-gray-400 text-xs">
            {progress}%
          </Badge>
        )}
      </div>
      
      {/* Título y descripción */}
      <h3 className={`font-bold text-sm mb-1 ${unlocked ? "text-white" : "text-gray-500"}`}>
        {config.title}
      </h3>
      <p className={`text-xs mb-2 ${unlocked ? "text-gray-300" : "text-gray-600"}`}>
        {config.description}
      </p>
      
      {/* Requisito */}
      <p className={`text-xs ${unlocked ? "text-gray-400" : "text-gray-600"}`}>
        {config.requirement}
      </p>
      
      {/* Fecha de desbloqueo */}
      {unlocked && unlockedAt && (
        <p className="text-xs text-gray-500 mt-2">
          Desbloqueado: {new Date(unlockedAt).toLocaleDateString()}
        </p>
      )}
      
      {/* Barra de progreso para badges bloqueados */}
      {!unlocked && progress > 0 && (
        <div className="mt-3">
          <div className="w-full bg-slate-700 rounded-full h-1.5">
            <div 
              className="bg-cyan-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
