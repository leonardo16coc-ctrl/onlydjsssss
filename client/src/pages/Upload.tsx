import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/_core/hooks/useAuth";
import { Upload as UploadIcon, Sparkles, Loader2, Image as ImageIcon, CheckCircle2, Lock, CreditCard, Music, TrendingUp, DollarSign, Zap, ArrowRight } from "lucide-react";
import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { MusicAnalysisDisplay } from "@/components/MusicAnalysisDisplay";
import AudioPlayer from "@/components/AudioPlayer";
import WaveformPlayer from "@/components/WaveformPlayer";
import UploadLimitsCard from "@/components/UploadLimitsCard";
import { useLocation, Link } from "wouter";

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
      
      // Validate file size (200MB max)
      if (file.size > 200 * 1024 * 1024) {
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
    if (!audioFile) return;
    
    setIsUploadingAudio(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append("file", audioFile);
      
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });
      
      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setUploadedAudio({
            fileKey: response.fileKey,
            fileUrl: response.fileUrl,
          });
          setAudioUploaded(true);
          toast.success("Audio subido exitosamente");
        } else {
          throw new Error("Error al subir el audio");
        }
        setIsUploadingAudio(false);
      });
      
      xhr.addEventListener("error", () => {
        toast.error("Error al subir el audio");
        setIsUploadingAudio(false);
      });

      xhr.addEventListener("timeout", () => {
        toast.error("Tiempo de espera agotado. El archivo es muy grande o la conexión es lenta.");
        setIsUploadingAudio(false);
      });

      xhr.timeout = 300000; // 5 minutes timeout
      
      xhr.open("POST", "/api/upload/audio");
      xhr.send(formData);
      
    } catch (error: any) {
      toast.error(error.message || "Error al subir el audio");
      setIsUploadingAudio(false);
    }
  };

  const handleUploadCover = async () => {
    if (!coverImage) return;
    
    setIsUploadingCover(true);
    
    try {
      const formData = new FormData();
      formData.append("file", coverImage);
      
      const response = await fetch("/api/upload/cover", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Error al subir la portada");
      }
      
      const data = await response.json();
      setUploadedCover({
        fileKey: data.fileKey,
        fileUrl: data.fileUrl,
      });
      setCoverUploaded(true);
      toast.success("Portada subida exitosamente");
    } catch (error: any) {
      toast.error(error.message || "Error al subir la portada");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleAnalyzeAudio = async (audioUrl?: string) => {
    const urlToAnalyze = audioUrl || uploadedAudio?.fileUrl;
    
    if (!urlToAnalyze) {
      toast.error("No hay audio para analizar");
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      const result = await analyzeAudio.mutateAsync({
        audioFileUrl: urlToAnalyze,
      });
      
      setAnalysisResult(result);
      
      // Auto-fill fields
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
    // Validation
    if (!title || !artist || !genre || !trackType) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }
    
    if (!uploadedAudio) {
      toast.error("Por favor sube un archivo de audio");
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
      
      toast.success("Track publicado exitosamente!");
      
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-20 border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Share Your Music
              </span>
              <br />
              <span className="text-white">with the World</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Upload your tracks, let AI analyze them, and start earning from every download. Join thousands of DJs monetizing their music.
            </p>
            
            {/* Benefits Pills */}
            <div className="flex flex-wrap gap-3 justify-center">
              <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-full px-4 py-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-slate-300">AI Analysis</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-full px-4 py-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-sm text-slate-300">Earn Money</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-full px-4 py-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-slate-300">Grow Audience</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Onboarding */}
      <section className="py-12 bg-slate-900/50">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-white">
              How It Works
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative group">
                <Card className="p-6 bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-all text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg shadow-cyan-500/20">
                    <span className="text-xl font-bold text-white">1</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">Upload Your Track</h3>
                  <p className="text-sm text-slate-400">Upload MP3 or WAV files up to 100MB. Add cover art to make it stand out.</p>
                </Card>
                <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-cyan-500/50 to-purple-500/50"></div>
              </div>

              <div className="relative group">
                <Card className="p-6 bg-slate-900/50 border-slate-800 hover:border-purple-500/50 transition-all text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg shadow-purple-500/20">
                    <span className="text-xl font-bold text-white">2</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">AI Analysis</h3>
                  <p className="text-sm text-slate-400">Our AI automatically detects BPM, key, energy, and structure in seconds.</p>
                </Card>
                <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-purple-500/50 to-pink-500/50"></div>
              </div>

              <div className="relative group">
                <Card className="p-6 bg-slate-900/50 border-slate-800 hover:border-pink-500/50 transition-all text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg shadow-pink-500/20">
                    <span className="text-xl font-bold text-white">3</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">Publish & Earn</h3>
                  <p className="text-sm text-slate-400">Publish your track and earn from every download. Track earnings in real-time.</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Upload Form */}
      <div className="container py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Upload Steps */}
            <div className="lg:col-span-2 space-y-6">
              {/* Audio File Upload */}
              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                    <Music className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="font-bold text-lg text-white">{t('upload.audioFile')}</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="audio-file" className="text-slate-300">
                      Upload MP3 or WAV (max 100MB)
                    </Label>
                    <Input
                      id="audio-file"
                      type="file"
                      accept="audio/mpeg,audio/mp3,audio/wav"
                      onChange={handleAudioFileChange}
                      className="mt-2 bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  {audioFile && !audioUploaded && (
                    <div className="space-y-3">
                      <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                        <p className="text-sm font-medium mb-1 text-white">{audioFile.name}</p>
                        <p className="text-xs text-slate-400">
                          {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>

                      {/* Audio Preview */}
                      {audioPreviewUrl && (
                        <div>
                          <Label className="mb-2 block text-slate-300">Preview</Label>
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
                        className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                      >
                        {isUploadingAudio ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading... {uploadProgress}%
                          </>
                        ) : (
                          <>
                            <UploadIcon className="h-4 w-4 mr-2" />
                            Upload Audio
                          </>
                        )}
                      </Button>

                      {isUploadingAudio && (
                        <div className="space-y-2">
                          <Progress value={uploadProgress} className="w-full" />
                          <p className="text-xs text-center text-slate-400">
                            {uploadProgress}% completed
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {audioUploaded && uploadedAudio && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="font-medium text-green-500">Audio uploaded successfully</span>
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
              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="font-bold text-lg text-white">{t('upload.coverImage')}</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cover-image" className="text-slate-300">
                      JPG or PNG (max 10MB)
                    </Label>
                    <Input
                      id="cover-image"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="mt-2 bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  {coverPreview && (
                    <div className="space-y-3">
                      <div className="aspect-square bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
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
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                        >
                          {isUploadingCover ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <ImageIcon className="h-4 w-4 mr-2" />
                              Upload Cover
                            </>
                          )}
                        </Button>
                      )}

                      {coverUploaded && (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span className="font-medium text-green-500">Cover uploaded</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>

              {/* AI Analysis */}
              {audioUploaded && (
                <Card className="p-6 bg-gradient-to-br from-pink-500/10 to-pink-500/5 border-pink-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-pink-500/10 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-pink-400" />
                    </div>
                    <h3 className="font-bold text-lg text-white">AI Analysis</h3>
                  </div>
                  
                  {!analysisResult ? (
                    <Button
                      onClick={() => handleAnalyzeAudio()}
                      disabled={isAnalyzing}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
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
                        <span className="font-medium text-green-500">Analysis completed</span>
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

            {/* Right Column - Track Info & Tips */}
            <div className="space-y-6">
              {/* Track Info */}
              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <h3 className="font-bold text-lg mb-4 text-white">{t('upload.trackInfo')}</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-slate-300">{t('upload.titleLabel')} *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t('upload.titlePlaceholder')}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="artist" className="text-slate-300">{t('upload.artistLabel')} *</Label>
                    <Input
                      id="artist"
                      value={artist}
                      onChange={(e) => setArtist(e.target.value)}
                      placeholder={t('upload.artistPlaceholder')}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="genre" className="text-slate-300">{t('upload.genreLabel')} *</Label>
                    <Select value={genre} onValueChange={setGenre}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Select genre" />
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
                    <Label htmlFor="trackType" className="text-slate-300">{t('upload.typeLabel')} *</Label>
                    <Select value={trackType} onValueChange={setTrackType}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Select type" />
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
                      <Label htmlFor="bpm" className="text-slate-300">BPM</Label>
                      <Input
                        id="bpm"
                        type="number"
                        value={bpm}
                        onChange={(e) => setBpm(e.target.value)}
                        placeholder="128"
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="key" className="text-slate-300">Key</Label>
                      <Input
                        id="key"
                        value={musicalKey}
                        onChange={(e) => setMusicalKey(e.target.value)}
                        placeholder="Am"
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Pro Tips */}
              <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/20">
                <h3 className="font-bold text-lg mb-4 text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  Pro Tips
                </h3>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Use high-quality WAV files for best sound</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Add eye-catching cover art to stand out</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Let AI analyze for accurate BPM & key</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Use descriptive titles for better discovery</span>
                  </li>
                </ul>
              </Card>

              {/* Publish Button */}
              <Button
                onClick={handleSubmit}
                disabled={createTrack.isPending || !uploadedAudio}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 h-14 text-lg shadow-lg shadow-pink-500/20"
                size="lg"
              >
                {createTrack.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <UploadIcon className="h-5 w-5 mr-2" />
                    {t('upload.publish')}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>

              {isFreeUser && (
                <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <p className="text-sm text-slate-400 mb-2">
                    💎 Upgrade to Pro to unlock:
                  </p>
                  <ul className="text-xs text-slate-500 space-y-1">
                    <li>• Real-time earnings dashboard</li>
                    <li>• Advanced analytics</li>
                    <li>• Priority support</li>
                  </ul>
                  <Link href="/membership">
                    <Button variant="outline" size="sm" className="mt-3 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
                      Upgrade Now
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Upload Limits Info */}
          {isAuthenticated && (
            <div className="mt-12 pt-8 border-t border-slate-800">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-sm font-medium text-slate-400 mb-4 text-center">
                  📋 Limits & Formats
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
