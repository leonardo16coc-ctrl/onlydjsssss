import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/_core/hooks/useAuth";
import { Redirect } from "wouter";
import { Upload as UploadIcon, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { MusicAnalysisDisplay } from "@/components/MusicAnalysisDisplay";

export default function Upload() {
  const { user, isAuthenticated } = useAuth();
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState<string>("");
  const [trackType, setTrackType] = useState<string>("");
  const [bpm, setBpm] = useState("");
  const [musicalKey, setMusicalKey] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const analyzeAudio = trpc.musicAnalysis.analyze.useMutation();
  const createTrack = trpc.tracks.create.useMutation();

  if (!isAuthenticated || user?.membershipStatus === "free") {
    return <Redirect to="/membership" />;
  }

  const handleAnalyze = async () => {
    if (!audioFile || !genre || !trackType) {
      toast.error("Por favor selecciona un archivo, género y tipo de track");
      return;
    }

    setIsAnalyzing(true);
    try {
      // In production, you would upload the file to S3 first
      // For now, we'll simulate with a dummy URL
      const dummyUrl = "https://example.com/audio.mp3";
      
      const result = await analyzeAudio.mutateAsync({
        audioFileUrl: dummyUrl,
        genre,
        trackType,
      });

      setAnalysisResult(result);
      
      // Auto-fill detected values
      if (result.bpm) setBpm(result.bpm.toString());
      if (result.musicalKey) setMusicalKey(result.musicalKey);
      
      toast.success("¡Análisis completado con IA!");
    } catch (error) {
      toast.error("Error al analizar el audio");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !artist || !genre || !trackType || !audioFile) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    try {
      // In production, upload file to S3 first
      const dummyFileKey = `tracks/${Date.now()}-${audioFile.name}`;
      const dummyFileUrl = "https://example.com/audio.mp3";

      await createTrack.mutateAsync({
        title,
        artist,
        audioFileKey: dummyFileKey,
        audioFileUrl: dummyFileUrl,
        genre: genre as any,
        trackType: trackType as any,
        bpm: bpm ? parseInt(bpm) : undefined,
        musicalKey: musicalKey || undefined,
      });

      toast.success("¡Track subido exitosamente!");
      
      // Reset form
      setTitle("");
      setArtist("");
      setGenre("");
      setTrackType("");
      setBpm("");
      setMusicalKey("");
      setAudioFile(null);
      setAnalysisResult(null);
    } catch (error) {
      toast.error("Error al subir el track");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-glow-cyan">
          <UploadIcon className="inline h-10 w-10 mr-2" />
          Subir Track
        </h1>

        <Card className="card-neon p-8 bg-card mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Título *</Label>
                <Input 
                  placeholder="Nombre del track" 
                  className="bg-background"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Artista *</Label>
                <Input 
                  placeholder="Tu nombre de DJ" 
                  className="bg-background"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Género *</Label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecciona género" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tech House">Tech House</SelectItem>
                    <SelectItem value="Bass House">Bass House</SelectItem>
                    <SelectItem value="Afro House">Afro House</SelectItem>
                    <SelectItem value="Techno">Techno</SelectItem>
                    <SelectItem value="Melodic Techno">Melodic Techno</SelectItem>
                    <SelectItem value="Big Room">Big Room</SelectItem>
                    <SelectItem value="EDM">EDM</SelectItem>
                    <SelectItem value="Hard Techno">Hard Techno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo de Track *</Label>
                <Select value={trackType} onValueChange={setTrackType}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Extended Mix">Extended Mix</SelectItem>
                    <SelectItem value="Edit">Edit</SelectItem>
                    <SelectItem value="Mashup">Mashup</SelectItem>
                    <SelectItem value="Remix">Remix</SelectItem>
                    <SelectItem value="Rework">Rework</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>BPM (opcional - detectado por IA)</Label>
                <Input 
                  type="number" 
                  placeholder="128" 
                  className="bg-background"
                  value={bpm}
                  onChange={(e) => setBpm(e.target.value)}
                />
              </div>
              <div>
                <Label>Key (opcional - detectado por IA)</Label>
                <Input 
                  placeholder="Am" 
                  className="bg-background"
                  value={musicalKey}
                  onChange={(e) => setMusicalKey(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Archivo de Audio *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  accept="audio/mp3,audio/wav"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="audio-upload"
                />
                <label htmlFor="audio-upload" className="cursor-pointer">
                  <UploadIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  {audioFile ? (
                    <p className="text-foreground font-semibold">{audioFile.name}</p>
                  ) : (
                    <p className="text-muted-foreground">Arrastra tu archivo aquí o haz clic para seleccionar</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">MP3 320kbps o WAV</p>
                </label>
              </div>
            </div>

            {audioFile && genre && trackType && !analysisResult && (
              <Button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-secondary hover:bg-secondary/90 glow-purple"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Analizando con IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Analizar con IA (BPM, Key, Estructura)
                  </>
                )}
              </Button>
            )}

            <Button 
              type="submit" 
              className="w-full btn-neon bg-primary hover:bg-primary/90 glow-cyan"
              disabled={createTrack.isPending}
            >
              {createTrack.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <UploadIcon className="h-5 w-5 mr-2" />
                  Subir Track
                </>
              )}
            </Button>
          </form>
        </Card>

        {analysisResult && (
          <MusicAnalysisDisplay
            bpm={analysisResult.bpm}
            musicalKey={analysisResult.musicalKey}
            energy={analysisResult.energy}
            mood={analysisResult.mood}
            structure={analysisResult.structure}
            confidence={analysisResult.confidence}
          />
        )}
      </div>
    </div>
  );
}
