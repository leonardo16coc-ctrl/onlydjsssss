import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/_core/hooks/useAuth";
import { Redirect } from "wouter";
import { Upload as UploadIcon, Sparkles, Loader2, Image as ImageIcon, CheckCircle2 } from "lucide-react";
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
  
  // File states
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  // Upload states
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audioUploaded, setAudioUploaded] = useState(false);
  const [coverUploaded, setCoverUploaded] = useState(false);
  
  // Uploaded file data
  const [uploadedAudio, setUploadedAudio] = useState<{
    fileKey: string;
    fileUrl: string;
  } | null>(null);
  const [uploadedCover, setUploadedCover] = useState<{
    fileKey: string;
    fileUrl: string;
  } | null>(null);
  
  // Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const analyzeAudio = trpc.musicAnalysis.analyze.useMutation();
  const createTrack = trpc.tracks.create.useMutation();

  if (!isAuthenticated || user?.membershipStatus === "free") {
    return <Redirect to="/membership" />;
  }

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/wave", "audio/x-wav"];
      if (!validTypes.includes(file.type)) {
        toast.error("Formato no válido. Solo se aceptan MP3 y WAV");
        return;
      }
      
      // Validate file size (100MB max)
      if (file.size > 100 * 1024 * 1024) {
        toast.error("El archivo es demasiado grande. Máximo 100MB");
        return;
      }
      
      setAudioFile(file);
      setAudioUploaded(false);
      setUploadedAudio(null);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("Formato no válido. Solo se aceptan JPG, PNG y WebP");
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("La imagen es demasiado grande. Máximo 10MB");
        return;
      }
      
      setCoverImage(file);
      setCoverUploaded(false);
      setUploadedCover(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAudioToS3 = async () => {
    if (!audioFile || !user) return;

    setIsUploadingAudio(true);
    setUploadProgress(0);

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result?.toString().split(",")[1];
        if (!base64) {
          toast.error("Error al leer el archivo");
          setIsUploadingAudio(false);
          return;
        }

        // Upload to server
        const response = await fetch("/api/upload/audio", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            file: base64,
            mimeType: audioFile.type,
            fileName: audioFile.name,
            userId: user.id,
          }),
        });

        const result = await response.json();

        if (!response.ok || result.error) {
          toast.error(result.error || "Error al subir el archivo");
          setIsUploadingAudio(false);
          return;
        }

        setUploadedAudio({
          fileKey: result.fileKey,
          fileUrl: result.fileUrl,
        });
        setAudioUploaded(true);
        setUploadProgress(100);
        toast.success("¡Archivo de audio subido exitosamente!");
      };

      reader.onerror = () => {
        toast.error("Error al leer el archivo");
        setIsUploadingAudio(false);
      };

      reader.readAsDataURL(audioFile);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Error al subir el archivo");
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const uploadCoverToS3 = async () => {
    if (!coverImage || !user) return;

    setIsUploadingCover(true);

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result?.toString().split(",")[1];
        if (!base64) {
          toast.error("Error al leer la imagen");
          setIsUploadingCover(false);
          return;
        }

        // Upload to server
        const response = await fetch("/api/upload/image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            file: base64,
            mimeType: coverImage.type,
            fileName: coverImage.name,
            userId: user.id,
          }),
        });

        const result = await response.json();

        if (!response.ok || result.error) {
          toast.error(result.error || "Error al subir la imagen");
          setIsUploadingCover(false);
          return;
        }

        setUploadedCover({
          fileKey: result.fileKey,
          fileUrl: result.fileUrl,
        });
        setCoverUploaded(true);
        toast.success("¡Imagen cover subida exitosamente!");
      };

      reader.onerror = () => {
        toast.error("Error al leer la imagen");
        setIsUploadingCover(false);
      };

      reader.readAsDataURL(coverImage);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Error al subir la imagen");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedAudio || !genre || !trackType) {
      toast.error("Por favor sube un archivo y selecciona género y tipo de track");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeAudio.mutateAsync({
        audioFileUrl: uploadedAudio.fileUrl,
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
    
    if (!title || !artist || !genre || !trackType || !uploadedAudio) {
      toast.error("Por favor completa todos los campos requeridos y sube el archivo de audio");
      return;
    }

    try {
      await createTrack.mutateAsync({
        title,
        artist,
        audioFileKey: uploadedAudio.fileKey,
        audioFileUrl: uploadedAudio.fileUrl,
        coverImageKey: uploadedCover?.fileKey,
        coverImageUrl: uploadedCover?.fileUrl,
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
      setCoverImage(null);
      setCoverPreview(null);
      setUploadedAudio(null);
      setUploadedCover(null);
      setAudioUploaded(false);
      setCoverUploaded(false);
      setAnalysisResult(null);
    } catch (error) {
      toast.error("Error al crear el track");
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

            {/* Audio File Upload */}
            <div>
              <Label>Archivo de Audio * (MP3 320kbps o WAV, máx 100MB)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  accept="audio/mp3,audio/mpeg,audio/wav"
                  onChange={handleAudioFileChange}
                  className="hidden"
                  id="audio-upload"
                  disabled={isUploadingAudio}
                />
                <label htmlFor="audio-upload" className="cursor-pointer">
                  {audioUploaded ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle2 className="h-12 w-12 mb-4 text-primary" />
                      <p className="text-primary font-semibold">{audioFile?.name}</p>
                      <p className="text-xs text-muted-foreground mt-2">Subido exitosamente</p>
                    </div>
                  ) : audioFile ? (
                    <div className="flex flex-col items-center">
                      <UploadIcon className="h-12 w-12 mb-4 text-foreground" />
                      <p className="text-foreground font-semibold">{audioFile.name}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <>
                      <UploadIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Arrastra tu archivo aquí o haz clic para seleccionar</p>
                      <p className="text-xs text-muted-foreground mt-2">MP3 320kbps o WAV (máx 100MB)</p>
                    </>
                  )}
                </label>
              </div>
              
              {audioFile && !audioUploaded && (
                <Button
                  type="button"
                  onClick={uploadAudioToS3}
                  disabled={isUploadingAudio}
                  className="w-full mt-4 bg-primary hover:bg-primary/90"
                >
                  {isUploadingAudio ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Subiendo a S3...
                    </>
                  ) : (
                    <>
                      <UploadIcon className="h-5 w-5 mr-2" />
                      Subir Archivo de Audio
                    </>
                  )}
                </Button>
              )}
              
              {isUploadingAudio && (
                <Progress value={uploadProgress} className="mt-4" />
              )}
            </div>

            {/* Cover Image Upload */}
            <div>
              <Label>Imagen Cover (opcional, JPG/PNG/WebP, máx 10MB)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-secondary transition-colors">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleCoverImageChange}
                  className="hidden"
                  id="cover-upload"
                  disabled={isUploadingCover}
                />
                <label htmlFor="cover-upload" className="cursor-pointer">
                  {coverPreview ? (
                    <div className="flex flex-col items-center">
                      <img src={coverPreview} alt="Cover preview" className="h-32 w-32 object-cover rounded-lg mb-4" />
                      <p className="text-foreground font-semibold">{coverImage?.name}</p>
                      {coverUploaded && (
                        <p className="text-xs text-primary mt-2">Subido exitosamente</p>
                      )}
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Arrastra tu imagen aquí o haz clic para seleccionar</p>
                      <p className="text-xs text-muted-foreground mt-2">JPG, PNG o WebP (máx 10MB)</p>
                    </>
                  )}
                </label>
              </div>
              
              {coverImage && !coverUploaded && (
                <Button
                  type="button"
                  onClick={uploadCoverToS3}
                  disabled={isUploadingCover}
                  className="w-full mt-4 bg-secondary hover:bg-secondary/90"
                >
                  {isUploadingCover ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Subiendo imagen...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-5 w-5 mr-2" />
                      Subir Imagen Cover
                    </>
                  )}
                </Button>
              )}
            </div>

            {audioUploaded && genre && trackType && !analysisResult && (
              <Button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-accent hover:bg-accent/90 glow-purple"
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
              disabled={createTrack.isPending || !audioUploaded}
            >
              {createTrack.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Creando track...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Publicar Track
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
