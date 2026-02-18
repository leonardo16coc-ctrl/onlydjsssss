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
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { MusicAnalysisDisplay } from "@/components/MusicAnalysisDisplay";
import AudioPlayer from "@/components/AudioPlayer";
import WaveformPlayer from "@/components/WaveformPlayer";
import UploadLimitsCard from "@/components/UploadLimitsCard";
import { useLocation } from "wouter";

export default function Upload() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
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
        toast.error(t('upload.invalidFormat'));
        return;
      }
      
      // Validate file size (100MB max)
      if (file.size > 100 * 1024 * 1024) {
        toast.error(t('upload.fileTooLarge'));
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
        toast.error(t('upload.imageOnly'));
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('upload.imageTooLarge'));
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
      toast.error(t('upload.chooseFile'));
      return;
    }

    setIsUploadingAudio(true);
    setUploadProgress(0);

    return new Promise<void>((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", audioFile);

      const xhr = new XMLHttpRequest();
      
      // Set timeout to 5 minutes (300000ms) for large files
      xhr.timeout = 300000;

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        setIsUploadingAudio(false);
        
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            setUploadedAudio({
              fileKey: data.fileKey,
              fileUrl: data.fileUrl,
            });
            setAudioUploaded(true);
            setUploadProgress(100);
            toast.success(t('upload.uploadSuccess'));
            
            // Note: Auto-analysis is now triggered by WaveformPlayer's onAnalysisComplete
            resolve();
          } catch (error) {
            toast.error("Error al procesar la respuesta del servidor");
            reject(error);
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            toast.error(error.error || "Error al subir el archivo");
          } catch {
            toast.error("Error al subir el archivo");
          }
          reject(new Error("Upload failed"));
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        setIsUploadingAudio(false);
        toast.error("Error de red al subir el archivo");
        reject(new Error("Network error"));
      });

      // Handle abort
      xhr.addEventListener('abort', () => {
        setIsUploadingAudio(false);
        toast.error("Subida cancelada");
        reject(new Error("Upload aborted"));
      });
      
      // Handle timeout
      xhr.addEventListener('timeout', () => {
        setIsUploadingAudio(false);
        toast.error("Tiempo de espera agotado. El archivo es muy grande o la conexión es lenta.");
        reject(new Error("Upload timeout"));
      });

      // Send request
      xhr.open('POST', '/api/upload/audio');
      xhr.send(formData);
    });
  };

  const handleUploadCover = async () => {
    if (!coverImage) {
      toast.error(t('upload.chooseFile'));
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
      toast.success(t('upload.uploadSuccess'));
    } catch (error: any) {
      toast.error(error.message || "Error al subir la portada");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleAnalyzeAudio = async (audioUrl?: string) => {
    const urlToAnalyze = audioUrl || uploadedAudio?.fileUrl;
    if (!urlToAnalyze) {
      toast.error(t('upload.uploadAudio'));
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeAudio.mutateAsync({ audioFileUrl: urlToAnalyze });
      setAnalysisResult(result);
      
      // Auto-fill form fields
      if (result.bpm) setBpm(result.bpm.toString());
      if (result.musicalKey) setMusicalKey(result.musicalKey);
      
      toast.success(t('upload.analysisComplete'));
    } catch (error: any) {
      toast.error(error.message || "Error al analizar el audio");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!uploadedAudio) {
      toast.error(t('upload.uploadAudio'));
      return;
    }
    if (!title || !artist || !genre || !trackType) {
      toast.error(t('common.error'));
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

      toast.success(t('upload.publishSuccess'));
      
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
              {t('upload.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('upload.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - File Uploads */}
            <div className="space-y-6">
              {/* Audio File Upload */}
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">{t('upload.audioFile')}</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="audio-file">
                      {t('upload.audioFileDesc')}
                    </Label>
                    <Input
                      id="audio-file"
                      type="file"
                      accept="audio/mpeg,audio/mp3,audio/wav"
                      onChange={handleAudioFileChange}
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
                          disabled={isUploadingAudio}
                          className="w-full"
                        >
                        {isUploadingAudio ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Subiendo... {uploadProgress}%
                          </>
                        ) : (
                          <>
                            <UploadIcon className="h-4 w-4 mr-2" />
                            Subir Audio
                          </>
                        )}
                      </Button>

                      {isUploadingAudio && (
                        <div className="space-y-2">
                          <Progress value={uploadProgress} className="w-full" />
                          <p className="text-xs text-center text-muted-foreground">
                            {uploadProgress}% completado
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {audioUploaded && uploadedAudio && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="font-medium text-green-500">Audio subido</span>
                      </div>
                      
                      {/* Uploaded Audio Waveform */}
                      <WaveformPlayer
                        audioUrl={uploadedAudio.fileUrl}
                        autoAnalyze={true}
                        onAnalysisComplete={(duration) => {
                          console.log("Audio duration:", duration);
                          // Trigger automatic analysis only once
                          if (!analysisResult && !isAnalyzing) {
                            handleAnalyzeAudio(uploadedAudio.fileUrl);
                          }
                        }}
                        onReady={() => {
                          console.log("Waveform ready");
                        }}
                      />
                    </div>
                  )}
                </div>
              </Card>

              {/* Cover Image Upload */}
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">{t('upload.coverImage')}</h3>
                
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
                          disabled={isUploadingCover}
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
                      disabled={isAnalyzing}
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
                          {t('upload.analyzeWithAI')}
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
                <h3 className="font-bold text-lg mb-4">{t('upload.trackInfo')}</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">{t('upload.titleLabel')} *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t('upload.titlePlaceholder')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="artist">{t('upload.artistLabel')} *</Label>
                    <Input
                      id="artist"
                      value={artist}
                      onChange={(e) => setArtist(e.target.value)}
                      placeholder={t('upload.artistPlaceholder')}                    />
                  </div>

                  <div>
                    <Label htmlFor="genre">{t('upload.genreLabel')} *</Label>
                    <Select value={genre} onValueChange={setGenre}>
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
                    <Label htmlFor="trackType">{t('upload.typeLabel')} *</Label>
                    <Select value={trackType} onValueChange={setTrackType}>
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
                        />
                    </div>

                    <div>
                      <Label htmlFor="key">Clave Musical</Label>
                        <Input
                          id="key"
                          value={musicalKey}
                          onChange={(e) => setMusicalKey(e.target.value)}
                          placeholder="Am"
                        />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={createTrack.isPending || !uploadedAudio}
                className="w-full btn-neon glow-pink h-14 text-lg"
                size="lg"
              >
                {createTrack.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <UploadIcon className="h-5 w-5 mr-2" />
                    {t('upload.publish')}
                  </>
                )}
              </Button>

              {isFreeUser && (
                <div className="text-center space-y-2 mt-4">
                  <p className="text-sm text-muted-foreground">
                    🎵 Track publicado con éxito. Suscríbete por $4.99/mes para ver tus estadísticas y ganancias reales.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Limits Info - Informativo al final */}
          {isAuthenticated && (
            <div className="mt-12 pt-8 border-t border-border/30">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-sm font-medium text-muted-foreground mb-4 text-center">
                  📋 Información de Límites y Formatos
                </h3>
                <UploadLimitsCard compact={true} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
