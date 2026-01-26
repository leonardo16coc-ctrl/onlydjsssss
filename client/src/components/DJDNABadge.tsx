import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DJDNABadgeProps {
  profile: {
    avgBpm?: number | null;
    favoriteGenres?: string | null;
    favoriteKeys?: string | null;
    avgEnergy?: number | null;
  };
  size?: "sm" | "md" | "lg";
}

export default function DJDNABadge({ profile, size = "md" }: DJDNABadgeProps) {
  // Parsear datos
  const genres = profile.favoriteGenres ? JSON.parse(profile.favoriteGenres) : [];
  const keys = profile.favoriteKeys ? JSON.parse(profile.favoriteKeys) : [];
  
  // Obtener género principal
  const mainGenre = genres.length > 0 ? genres[0].genre : "Electronic";
  
  // Obtener key favorita
  const mainKey = keys.length > 0 ? keys[0].key : "Am";
  
  // Determinar momento preferido basado en energía
  const getMoment = (energy?: number | null) => {
    if (!energy) return "Versatile";
    if (energy < 50) return "Warmup";
    if (energy < 70) return "Build";
    if (energy < 85) return "Peak Time";
    return "Festival";
  };
  
  // Determinar nivel energético
  const getEnergyLevel = (energy?: number | null) => {
    if (!energy) return "Balanced Energy";
    if (energy < 50) return "Chill Energy";
    if (energy < 70) return "Medium Energy";
    if (energy < 85) return "High Energy";
    return "Festival Energy";
  };
  
  const moment = getMoment(profile.avgEnergy);
  const energyLevel = getEnergyLevel(profile.avgEnergy);
  
  // Construir DNA string
  const dnaString = `${profile.avgBpm || "128"} BPM · ${mainGenre} · ${mainKey} · ${moment} · ${energyLevel}`;
  
  // Tamaños
  const sizeClasses = {
    sm: "text-xs py-2 px-3",
    md: "text-sm py-3 px-4",
    lg: "text-base py-4 px-6",
  };
  
  return (
    <div className={`bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-cyan-500/30 rounded-lg ${sizeClasses[size]} backdrop-blur-sm`}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="font-semibold text-white">Tu ADN DJ:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* BPM */}
          <Badge variant="outline" className="border-cyan-500 text-cyan-400 font-mono">
            {profile.avgBpm || "128"} BPM
          </Badge>
          
          {/* Género */}
          <Badge variant="outline" className="border-purple-500 text-purple-400">
            {mainGenre}
          </Badge>
          
          {/* Key */}
          <Badge variant="outline" className="border-pink-500 text-pink-400 font-mono">
            {mainKey}
          </Badge>
          
          {/* Momento */}
          <Badge variant="outline" className="border-yellow-500 text-yellow-400">
            {moment}
          </Badge>
          
          {/* Energía */}
          <Badge variant="outline" className="border-red-500 text-red-400">
            {energyLevel}
          </Badge>
        </div>
      </div>
      
      {/* DNA String completo para copiar */}
      <div className="mt-2 text-xs text-gray-400 font-mono">
        {dnaString}
      </div>
    </div>
  );
}
