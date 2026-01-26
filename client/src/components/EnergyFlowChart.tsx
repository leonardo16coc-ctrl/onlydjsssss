import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface EnergyFlowChartProps {
  tracks: Array<{
    id: number;
    title: string;
    artist: string;
    energy?: number | null;
    position: number;
  }>;
  setType: "warmup" | "peak_time" | "closing" | "festival";
}

export default function EnergyFlowChart({ tracks, setType }: EnergyFlowChartProps) {
  // Preparar datos para la gráfica
  const chartData = tracks.map((track, index) => ({
    position: index + 1,
    energy: track.energy || 50,
    trackName: `${track.title.substring(0, 20)}...`,
    fullTitle: track.title,
    artist: track.artist,
  }));

  // Colores según tipo de set
  const getSetColor = () => {
    switch (setType) {
      case "warmup":
        return "#06b6d4"; // cyan
      case "peak_time":
        return "#ef4444"; // red
      case "closing":
        return "#a855f7"; // purple
      case "festival":
        return "#eab308"; // yellow
      default:
        return "#06b6d4";
    }
  };

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-cyan-500/50 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold text-sm mb-1">Track {data.position}</p>
          <p className="text-cyan-400 text-xs mb-1">{data.fullTitle}</p>
          <p className="text-gray-400 text-xs mb-2">{data.artist}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
            <p className="text-white text-sm font-bold">Energía: {data.energy}/100</p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Determinar fase del set basado en posición
  const getPhaseLabel = (position: number, total: number) => {
    const percentage = (position / total) * 100;
    if (percentage <= 20) return "Warmup";
    if (percentage <= 40) return "Build";
    if (percentage <= 60) return "Peak";
    if (percentage <= 80) return "Sustain";
    return "Closing";
  };

  return (
    <div className="w-full">
      {/* Título de la gráfica */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">📈 Curva de Energía del Set</h3>
        <p className="text-sm text-gray-400">
          Visualización profesional del flow energético
        </p>
      </div>

      {/* Gráfica */}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={getSetColor()} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={getSetColor()} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis 
            dataKey="position" 
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            label={{ value: 'Track Position', position: 'insideBottom', offset: -5, fill: '#64748b' }}
          />
          <YAxis 
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            domain={[0, 100]}
            label={{ value: 'Energy', angle: -90, position: 'insideLeft', fill: '#64748b' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="energy" 
            stroke={getSetColor()}
            strokeWidth={3}
            fill="url(#energyGradient)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Leyenda de fases */}
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-xs text-gray-400">Warmup</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
          <span className="text-xs text-gray-400">Build</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-xs text-gray-400">Peak</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span className="text-xs text-gray-400">Sustain</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span className="text-xs text-gray-400">Closing</span>
        </div>
      </div>

      {/* Estadísticas del set */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-3 border border-cyan-500/20">
          <p className="text-xs text-gray-400 mb-1">Energía Inicial</p>
          <p className="text-xl font-bold text-cyan-400">{chartData[0]?.energy || 0}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-red-500/20">
          <p className="text-xs text-gray-400 mb-1">Pico Máximo</p>
          <p className="text-xl font-bold text-red-400">
            {Math.max(...chartData.map(d => d.energy))}
          </p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-purple-500/20">
          <p className="text-xs text-gray-400 mb-1">Energía Final</p>
          <p className="text-xl font-bold text-purple-400">
            {chartData[chartData.length - 1]?.energy || 0}
          </p>
        </div>
      </div>
    </div>
  );
}
