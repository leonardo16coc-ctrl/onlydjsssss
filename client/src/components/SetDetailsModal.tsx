import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import EnergyFlowChart from "./EnergyFlowChart";
import { Music, Zap, ArrowRight } from "lucide-react";

interface Track {
  id: number;
  title: string;
  artist: string;
  bpm: number | null;
  musicalKey: string | null;
  energy: number;
  position: number;
}

interface Transition {
  from: number;
  to: number;
  technique: string;
  compatibility: string;
  description?: string;
}

interface SetDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setData: {
    name: string;
    description: string | null;
    setType: string;
    avgBpm: number | null;
    keyCompatibility: number | null;
    tracks: Track[];
    transitions: Transition[];
  } | null;
}

const transitionIcons: Record<string, string> = {
  "Loop 8 beats": "🔁",
  "Echo out": "🔊",
  "Backspin": "⏪",
  "Reverb tail": "🌊",
  "Filter sweep": "🎚️",
  "Drop mix": "💥",
  "EQ blend": "🎛️",
  "Quick cut": "⚡",
};

const compatibilityColors: Record<string, string> = {
  "Perfecta": "text-green-400 border-green-500",
  "Buena": "text-cyan-400 border-cyan-500",
  "Moderada": "text-yellow-400 border-yellow-500",
};

export default function SetDetailsModal({ open, onOpenChange, setData }: SetDetailsModalProps) {
  if (!setData) return null;

  const { tracks, transitions } = setData;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl text-cyan-400 flex items-center gap-2">
            <Music className="w-6 h-6" />
            {setData.name}
          </DialogTitle>
          {setData.description && (
            <p className="text-sm text-gray-400 mt-2">{setData.description}</p>
          )}
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-cyan-500/20">
              <p className="text-xs text-gray-400 mb-1">Tipo de Set</p>
              <p className="text-lg font-semibold text-white capitalize">
                {setData.setType.replace('_', ' ')}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/20">
              <p className="text-xs text-gray-400 mb-1">BPM Promedio</p>
              <p className="text-lg font-semibold text-white">{setData.avgBpm || "N/A"}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-pink-500/20">
              <p className="text-xs text-gray-400 mb-1">Compatibilidad</p>
              <p className="text-lg font-semibold text-white">{setData.keyCompatibility}%</p>
            </div>
          </div>

          {/* Energy Flow Chart */}
          <div className="bg-slate-800/30 rounded-lg p-6 border border-cyan-500/20">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              📈 Curva de Energía del Set
            </h3>
            <EnergyFlowChart
              tracks={tracks.map(t => ({
                id: t.id,
                title: t.title,
                artist: t.artist,
                energy: t.energy,
                position: t.position,
              }))}
              setType={setData.setType as "warmup" | "peak_time" | "closing" | "festival"}
            />
          </div>

          {/* Tracks List */}
          <div className="bg-slate-800/30 rounded-lg p-6 border border-purple-500/20">
            <h3 className="text-lg font-semibold text-purple-400 mb-4">🎵 Tracks del Set</h3>
            <div className="space-y-3">
              {tracks.map((track, idx) => (
                <div key={track.id}>
                  <div className="flex items-start gap-4 p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm">
                      {track.position}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{track.title}</p>
                      <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                    </div>
                    <div className="flex gap-2">
                      {track.bpm && (
                        <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 text-xs">
                          {track.bpm} BPM
                        </Badge>
                      )}
                      {track.musicalKey && (
                        <Badge variant="outline" className="border-purple-500/50 text-purple-400 text-xs">
                          {track.musicalKey}
                        </Badge>
                      )}
                      <Badge variant="outline" className="border-pink-500/50 text-pink-400 text-xs">
                        {track.energy}% ⚡
                      </Badge>
                    </div>
                  </div>

                  {/* Transition to next track */}
                  {idx < tracks.length - 1 && transitions[idx] && (
                    <div className="ml-12 my-2 p-3 bg-slate-900/50 rounded-lg border-l-2 border-cyan-500/50">
                      <div className="flex items-center gap-2 mb-1">
                        <ArrowRight className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-medium text-cyan-400">
                          {transitionIcons[transitions[idx].technique] || "🎵"} {transitions[idx].technique}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${compatibilityColors[transitions[idx].compatibility] || "text-gray-400 border-gray-500"}`}
                        >
                          {transitions[idx].compatibility}
                        </Badge>
                      </div>
                      {transitions[idx].description && (
                        <p className="text-xs text-gray-400 ml-6">{transitions[idx].description}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Transitions Summary */}
          {transitions.length > 0 && (
            <div className="bg-slate-800/30 rounded-lg p-6 border border-yellow-500/20">
              <h3 className="text-lg font-semibold text-yellow-400 mb-4">🎛️ Guía de Mezcla</h3>
              <p className="text-sm text-gray-400 mb-4">
                Técnicas recomendadas para cada transición del set
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(
                  transitions.reduce((acc, t) => {
                    acc[t.technique] = (acc[t.technique] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([technique, count]) => (
                  <div
                    key={technique}
                    className="bg-slate-800/50 rounded-lg p-3 border border-cyan-500/20 text-center"
                  >
                    <div className="text-2xl mb-1">{transitionIcons[technique] || "🎵"}</div>
                    <p className="text-xs font-medium text-white">{technique}</p>
                    <p className="text-xs text-gray-400">{count}x</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
