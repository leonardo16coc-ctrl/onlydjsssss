import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface DJDNARadarChartProps {
  profile: {
    avgBpm: number | null;
    minBpm: number | null;
    maxBpm: number | null;
    avgEnergy: number | null;
    profileScore: number;
    totalTracksDownloaded: number;
    totalTracksPlayed: number;
    favoriteGenres: string | null; // JSON
    favoriteKeys: string | null; // JSON
  };
  size?: "sm" | "md" | "lg";
}

export default function DJDNARadarChart({ profile, size = "md" }: DJDNARadarChartProps) {
  // Calcular dimensiones del DJ DNA
  const dimensions = calculateDimensions(profile);

  const chartData = [
    { dimension: "BPM Range", value: dimensions.bpmRange, fullMark: 100 },
    { dimension: "Energy", value: dimensions.energy, fullMark: 100 },
    { dimension: "Diversity", value: dimensions.diversity, fullMark: 100 },
    { dimension: "Key Mastery", value: dimensions.keyMastery, fullMark: 100 },
    { dimension: "Activity", value: dimensions.activity, fullMark: 100 },
  ];

  const sizeMap = {
    sm: 200,
    md: 300,
    lg: 400,
  };

  const height = sizeMap[size];

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="#334155" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "#64748b", fontSize: 10 }}
          />
          <Radar
            name="Tu DNA DJ"
            dataKey="value"
            stroke="#06b6d4"
            fill="#06b6d4"
            fillOpacity={0.6}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #06b6d4",
              borderRadius: "8px",
              color: "#fff",
            }}
            formatter={(value: number) => [`${value}/100`, "Score"]}
          />
          <Legend
            wrapperStyle={{ color: "#94a3b8", fontSize: 12 }}
            iconType="circle"
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Dimensiones con detalles */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
        <DimensionCard
          label="BPM Range"
          value={dimensions.bpmRange}
          color="cyan"
          detail={`${profile.minBpm || 0}-${profile.maxBpm || 0}`}
        />
        <DimensionCard
          label="Energy"
          value={dimensions.energy}
          color="purple"
          detail={`${profile.avgEnergy || 0}% avg`}
        />
        <DimensionCard
          label="Diversity"
          value={dimensions.diversity}
          color="pink"
          detail={`${JSON.parse(profile.favoriteGenres || "[]").length} géneros`}
        />
        <DimensionCard
          label="Key Mastery"
          value={dimensions.keyMastery}
          color="yellow"
          detail={`${JSON.parse(profile.favoriteKeys || "[]").length} keys`}
        />
        <DimensionCard
          label="Activity"
          value={dimensions.activity}
          color="green"
          detail={`${profile.totalTracksDownloaded + profile.totalTracksPlayed} total`}
        />
      </div>
    </div>
  );
}

function calculateDimensions(profile: DJDNARadarChartProps["profile"]) {
  // 1. BPM Range (0-100): Qué tan amplio es el rango de BPM
  const bpmRange = profile.minBpm && profile.maxBpm
    ? Math.min(100, ((profile.maxBpm - profile.minBpm) / 100) * 100)
    : 0;

  // 2. Energy (0-100): Nivel energético promedio
  const energy = profile.avgEnergy || 0;

  // 3. Diversity (0-100): Diversidad de géneros
  const genres = JSON.parse(profile.favoriteGenres || "[]");
  const diversity = Math.min(100, (genres.length / 5) * 100); // Max 5 géneros = 100%

  // 4. Key Mastery (0-100): Dominio de keys
  const keys = JSON.parse(profile.favoriteKeys || "[]");
  const keyMastery = Math.min(100, (keys.length / 12) * 100); // Max 12 keys = 100%

  // 5. Activity (0-100): Nivel de actividad
  const totalActivity = profile.totalTracksDownloaded + profile.totalTracksPlayed;
  const activity = Math.min(100, (totalActivity / 200) * 100); // Max 200 = 100%

  return {
    bpmRange: Math.round(bpmRange),
    energy: Math.round(energy),
    diversity: Math.round(diversity),
    keyMastery: Math.round(keyMastery),
    activity: Math.round(activity),
  };
}

interface DimensionCardProps {
  label: string;
  value: number;
  color: "cyan" | "purple" | "pink" | "yellow" | "green";
  detail: string;
}

function DimensionCard({ label, value, color, detail }: DimensionCardProps) {
  const colorClasses = {
    cyan: "border-cyan-500/30 text-cyan-400",
    purple: "border-purple-500/30 text-purple-400",
    pink: "border-pink-500/30 text-pink-400",
    yellow: "border-yellow-500/30 text-yellow-400",
    green: "border-green-500/30 text-green-400",
  };

  const bgClasses = {
    cyan: "bg-cyan-500/10",
    purple: "bg-purple-500/10",
    pink: "bg-pink-500/10",
    yellow: "bg-yellow-500/10",
    green: "bg-green-500/10",
  };

  return (
    <div className={`${bgClasses[color]} ${colorClasses[color]} border rounded-lg p-3 text-center`}>
      <p className="text-xs font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-75 mt-1">{detail}</p>
    </div>
  );
}
