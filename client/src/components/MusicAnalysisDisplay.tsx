import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Activity, Zap, Clock } from "lucide-react";

interface MusicAnalysisProps {
  bpm?: number;
  musicalKey?: string;
  energy?: number;
  mood?: string;
  structure?: {
    intro: { start: number; end: number } | null;
    build: { start: number; end: number }[];
    drop: { start: number; end: number }[];
    breakdown: { start: number; end: number }[];
    outro: { start: number; end: number } | null;
  };
  confidence?: {
    bpm: number;
    key: number;
  };
  compact?: boolean;
}

export function MusicAnalysisDisplay({
  bpm,
  musicalKey,
  energy,
  mood,
  structure,
  confidence,
  compact = false
}: MusicAnalysisProps) {
  if (!bpm && !musicalKey && !energy && !mood) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {bpm && (
          <Badge variant="outline" className="bg-primary/10 border-primary text-primary">
            <Music className="h-3 w-3 mr-1" />
            {bpm} BPM
          </Badge>
        )}
        {musicalKey && (
          <Badge variant="outline" className="bg-secondary/10 border-secondary text-secondary">
            <Activity className="h-3 w-3 mr-1" />
            {musicalKey}
          </Badge>
        )}
        {energy && (
          <Badge variant="outline" className="bg-accent/10 border-accent text-accent">
            <Zap className="h-3 w-3 mr-1" />
            {energy}/100
          </Badge>
        )}
        {mood && (
          <Badge variant="outline" className="bg-muted border-border">
            {mood}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="card-neon p-6 bg-card">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        <Activity className="h-5 w-5 mr-2 text-primary" />
        Análisis Musical con IA
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {bpm && (
          <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
            <Music className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-3xl font-bold text-primary">{bpm}</p>
            <p className="text-sm text-muted-foreground">BPM</p>
            {confidence?.bpm && (
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(confidence.bpm * 100)}% confianza
              </p>
            )}
          </div>
        )}

        {musicalKey && (
          <div className="text-center p-4 bg-secondary/10 rounded-lg border border-secondary/20">
            <Activity className="h-6 w-6 mx-auto mb-2 text-secondary" />
            <p className="text-3xl font-bold text-secondary">{musicalKey}</p>
            <p className="text-sm text-muted-foreground">Key</p>
            {confidence?.key && (
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(confidence.key * 100)}% confianza
              </p>
            )}
          </div>
        )}

        {energy !== undefined && (
          <div className="text-center p-4 bg-accent/10 rounded-lg border border-accent/20">
            <Zap className="h-6 w-6 mx-auto mb-2 text-accent" />
            <p className="text-3xl font-bold text-accent">{energy}</p>
            <p className="text-sm text-muted-foreground">Energía</p>
            <p className="text-xs text-muted-foreground mt-1">0-100</p>
          </div>
        )}

        {mood && (
          <div className="text-center p-4 bg-muted/50 rounded-lg border border-border">
            <div className="h-6 w-6 mx-auto mb-2 text-foreground">🎵</div>
            <p className="text-xl font-bold">{mood}</p>
            <p className="text-sm text-muted-foreground">Mood</p>
          </div>
        )}
      </div>

      {structure && (
        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            Estructura de la Canción
          </h4>
          
          <div className="space-y-2">
            {structure.intro && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="w-24">Intro</Badge>
                <span className="text-sm text-muted-foreground">
                  {formatTime(structure.intro.start)} - {formatTime(structure.intro.end)}
                </span>
              </div>
            )}

            {structure.build.map((section, i) => (
              <div key={`build-${i}`} className="flex items-center gap-2">
                <Badge variant="outline" className="w-24 bg-primary/10 border-primary text-primary">
                  Build {i + 1}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatTime(section.start)} - {formatTime(section.end)}
                </span>
              </div>
            ))}

            {structure.drop.map((section, i) => (
              <div key={`drop-${i}`} className="flex items-center gap-2">
                <Badge variant="outline" className="w-24 bg-accent/10 border-accent text-accent">
                  Drop {i + 1}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatTime(section.start)} - {formatTime(section.end)}
                </span>
              </div>
            ))}

            {structure.breakdown.map((section, i) => (
              <div key={`breakdown-${i}`} className="flex items-center gap-2">
                <Badge variant="outline" className="w-24 bg-secondary/10 border-secondary text-secondary">
                  Breakdown {i + 1}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatTime(section.start)} - {formatTime(section.end)}
                </span>
              </div>
            ))}

            {structure.outro && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="w-24">Outro</Badge>
                <span className="text-sm text-muted-foreground">
                  {formatTime(structure.outro.start)} - {formatTime(structure.outro.end)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
