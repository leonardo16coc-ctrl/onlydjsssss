import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/_core/hooks/useAuth";
import { Upload as UploadIcon, Sparkles, Loader2, Image as ImageIcon, CheckCircle2, Lock, CreditCard } from "lucide-react";
import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { MusicAnalysisDisplay } from "@/components/MusicAnalysisDisplay";
import AudioPlayer from "@/components/AudioPlayer";
import { useLocation } from "wouter";

export default function Upload() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState<string>("");
  const [trackType, setTrackType] = useState<string>("");
  const [bpm, setBpm] = useState("");
  const [musicalKey, setMusicalKey] = useState("");
  
  // File states
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
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

  const isFreeUser = !isAuthenticated || user?.membershipStatus === "free";

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
      
      // Create preview URL for audio player
      const previewUrl = URL.createObjectURL(file);
      setAudioPreviewUrl(previewUrl);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Solo se aceptan archivos de imagen");
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
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAudio = async () => {
    if (!audioFile) {
      toast.error("Selecciona un archivo de audio");
      return;
    }

    setIsUploadingAudio(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", audioFile);

      const response = await fetch("/api/upload/audio", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al subir el archivo");
      }

      const data = await response.json();
      setUploadedAudio({
        fileKey: data.fileKey,
        fileUrl: data.fileUrl,
      });
      setAudioUploaded(true);
      setUploadProgress(100);
      toast.success("Audio subido correctamente");

      // Auto-analyze after upload
      handleAnalyzeAudio(data.fileUrl);
    } catch (error: any) {
      toast.error(error.message || "Error al subir el audio");
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const handleUploadCover = async () => {
    if (!coverImage) {
      toast.error("Selecciona una imagen de portada");
      return;
    }

    setIsUploadingCover(true);

    try {
      const formData = new FormData();
      formData.append("file", coverImage);

      const response = await fetch("/api/upload/cover", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al subir la imagen");
      }

      const data = await response.json();
      setUploadedCover({
        fileKey: data.fileKey,
        fileUrl: data.fileUrl,
      });
      setCoverUploaded(true);
      toast.success("Portada subida correctamente");
    } catch (error: any) {
      toast.error(error.message || "Error al subir la portada");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleAnalyzeAudio = async (audioUrl?: string) => {
    const urlToAnalyze = audioUrl || uploadedAudio?.fileUrl;
    if (!urlToAnalyze) {
      toast.error("Primero sube el archivo de audio");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeAudio.mutateAsync({ audioFileUrl: urlToAnalyze });
      setAnalysisResult(result);
      
      // Auto-fill form fields
      if (result.bpm) setBpm(result.bpm.toString());
      if (result.musicalKey) setMusicalKey(result.musicalKey);
      
      toast.success("Análisis completado");
    } catch (error: any) {
      toast.error(error.message || "Error al analizar el audio");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    // Check membership
    if (isFreeUser) {
      toast.error("Necesitas una membresía activa para subir tracks", {
        description: "Suscríbete por $4.99/mes para subir música ilimitada",
        action: {
          label: "Suscribirse",
          onClick: () => setLocation("/membership"),
        },
      });
      return;
    }

    // Validate required fields
    if (!uploadedAudio) {
      toast.error("Primero sube el archivo de audio");
      return;
    }
    if (!title || !artist || !genre || !trackType) {
      toast.error("Completa todos los campos requeridos");
      return;
    }

    try {
      await createTrack.mutateAsync({
        title,
        artist,
        genre: genre as any,
        trackType: trackType as any,
        bpm: bpm ? parseInt(bpm) : undefined,
        musicalKey: musicalKey || undefined,
        audioFileKey: uploadedAudio.fileKey,
        audioFileUrl: uploadedAudio.fileUrl,
        coverImageKey: uploadedCover?.fileKey,
        coverImageUrl: uploadedCover?.fileUrl,
        energy: analysisResult?.energy,
        mood: analysisResult?.mood,
      });

      toast.success("Track publicado exitosamente");
      
      // Reset form
      setTitle("");
      setArtist("");
      setGenre("");
      setTrackType("");
      setBpm("");
      setMusicalKey("");
      setAudioFile(null);
      setAudioPreviewUrl(null);
      setCoverImage(null);
      setCoverPreview(null);
      setUploadedAudio(null);
      setUploadedCover(null);
      setAudioUploaded(false);
      setCoverUploaded(false);
      setAnalysisResult(null);
      
      // Redirect to explore
      setTimeout(() => setLocation("/explore"), 1500);
    } catch (error: any) {
      toast.error(error.message || "Error al publicar el track");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-gradient">
              Subir Track
            </h1>
            <p className="text-muted-foreground">
              Comparte tu música con la comunidad de DJs
            </p>
          </div>

          {/* Membership Warning for Free Users */}
          {isFreeUser && (
            <Card className="p-6 mb-6 border-primary bg-primary/5">
              <div className="flex items-start gap-4">
                <Lock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">Membresía Requerida</h3>
                  <p className="text-muted-foreground mb-4">
                    Necesitas una membresía activa para subir tracks. Suscríbete por solo $4.99/mes y obtén acceso ilimitado para subir y descargar música.
                  </p>
                  <Button
                    onClick={() => setLocation("/membership")}
                    className="btn-neon glow-pink"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Suscribirse Ahora
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - File Uploads */}
            <div className="space-y-6">
              {/* Audio File Upload */}
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Archivo de Audio</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="audio-file">
                      Archivo MP3 320kbps o WAV (máx 100MB)
                    </Label>
                    <Input
                      id="audio-file"
                      type="file"
                      accept="audio/mpeg,audio/mp3,audio/wav"
                      onChange={handleAudioFileChange}
                      disabled={isFreeUser}
                      className="mt-2"
                    />
                  </div>

                  {audioFile && !audioUploaded && (
                    <div className="space-y-3">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">{audioFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>

                      {/* Audio Preview */}
                      {audioPreviewUrl && (
                        <div>
                          <Label className="mb-2 block">Pre-escucha</Label>
                          <AudioPlayer
                            audioUrl={audioPreviewUrl}
                            trackId={0}
                            trackTitle={audioFile.name}
                            compact={false}
                          />
                        </div>
                      )}

                      <Button
                        onClick={handleUploadAudio}
                        disabled={isUploadingAudio || isFreeUser}
                        className="w-full"
                      >
                        {isUploadingAudio ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Subiendo...
                          </>
                        ) : (
                          <>
                            <UploadIcon className="h-4 w-4 mr-2" />
                            Subir Audio
                          </>
                        )}
                      </Button>

                      {isUploadingAudio && (
                        <Progress value={uploadProgress} className="w-full" />
                      )}
                    </div>
                  )}

                  {audioUploaded && uploadedAudio && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="font-medium text-green-500">Audio subido</span>
                      </div>
                      
                      {/* Uploaded Audio Player */}
                      <AudioPlayer
                        audioUrl={uploadedAudio.fileUrl}
                        trackId={0}
                        trackTitle={audioFile?.name || "Audio subido"}
                        compact={false}
                      />
                    </div>
                  )}
                </div>
              </Card>

              {/* Cover Image Upload */}
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Imagen de Portada</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cover-image">
                      Imagen JPG o PNG (máx 10MB)
                    </Label>
                    <Input
                      id="cover-image"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      disabled={isFreeUser}
                      className="mt-2"
                    />
                  </div>

                  {coverPreview && (
                    <div className="space-y-3">
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                        <img
                          src={coverPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {!coverUploaded && (
                        <Button
                          onClick={handleUploadCover}
                          disabled={isUploadingCover || isFreeUser}
                          className="w-full"
                          variant="outline"
                        >
                          {isUploadingCover ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Subiendo...
                            </>
                          ) : (
                            <>
                              <ImageIcon className="h-4 w-4 mr-2" />
                              Subir Portada
                            </>
                          )}
                        </Button>
                      )}

                      {coverUploaded && (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span className="font-medium text-green-500">Portada subida</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>

              {/* AI Analysis */}
              {audioUploaded && (
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4">Análisis con IA</h3>
                  
                  {!analysisResult ? (
                    <Button
                      onClick={() => handleAnalyzeAudio()}
                      disabled={isAnalyzing || isFreeUser}
                      className="w-full btn-neon glow-cyan"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analizando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Analizar con IA
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 mb-4">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="font-medium text-green-500">Análisis completado</span>
                      </div>
                      
                      <MusicAnalysisDisplay
                        bpm={analysisResult.bpm}
                        musicalKey={analysisResult.key}
                        energy={analysisResult.energy}
                        mood={analysisResult.mood}
                        structure={analysisResult.structure}
                        compact={false}
                      />
                    </div>
                  )}
                </Card>
              )}
            </div>

            {/* Right Column - Track Info */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Información del Track</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Nombre del track"
                      disabled={isFreeUser}
                    />
                  </div>

                  <div>
                    <Label htmlFor="artist">Artista *</Label>
                    <Input
                      id="artist"
                      value={artist}
                      onChange={(e) => setArtist(e.target.value)}
                      placeholder="Nombre del artista"
                      disabled={isFreeUser}
                    />
                  </div>

                  <div>
                    <Label htmlFor="genre">Género *</Label>
                    <Select value={genre} onValueChange={setGenre} disabled={isFreeUser}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un género" />
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
                        <SelectItem value="Latin">Latin</SelectItem>
                        <SelectItem value="Reggaeton">Reggaeton</SelectItem>
                        <SelectItem value="Hip-Hop">Hip-Hop</SelectItem>
                        <SelectItem value="Open Format">Open Format</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="trackType">Tipo de Track *</Label>
                    <Select value={trackType} onValueChange={setTrackType} disabled={isFreeUser}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo" />
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bpm">BPM</Label>
                      <Input
                        id="bpm"
                        type="number"
                        value={bpm}
                        onChange={(e) => setBpm(e.target.value)}
                        placeholder="128"
                        disabled={isFreeUser}
                      />
                    </div>

                    <div>
                      <Label htmlFor="key">Clave Musical</Label>
                      <Input
                        id="key"
                        value={musicalKey}
                        onChange={(e) => setMusicalKey(e.target.value)}
                        placeholder="Am"
                        disabled={isFreeUser}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={createTrack.isPending || !uploadedAudio || isFreeUser}
                className="w-full btn-neon glow-pink h-14 text-lg"
                size="lg"
              >
                {isFreeUser ? (
                  <>
                    <Lock className="h-5 w-5 mr-2" />
                    Suscríbete para Publicar
                  </>
                ) : createTrack.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <UploadIcon className="h-5 w-5 mr-2" />
                    Publicar Track
                  </>
                )}
              </Button>

              {isFreeUser && (
                <p className="text-center text-sm text-muted-foreground">
                  Necesitas una membresía activa para publicar tracks
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
