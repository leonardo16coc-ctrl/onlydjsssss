import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Upload as UploadIcon,
  Sparkles,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  Music,
  X,
  CloudUpload,
  CreditCard,
  Lock,
  Globe,
  Copy,
  RefreshCw,
} from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { MusicAnalysisDisplay } from "@/components/MusicAnalysisDisplay";
import WaveformPlayer from "@/components/WaveformPlayer";
import { useLocation, Link } from "wouter";
import Navbar from "@/components/Navbar";

// ── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      {[
        { n: 1, label: "Subir audio" },
        { n: 2, label: "Información de la pista" },
      ].map(({ n, label }, i) => (
        <div key={n} className="flex items-center gap-3">
          {i > 0 && <div className={`h-px w-10 ${step > 1 ? "bg-primary" : "bg-border"}`} />}
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === n
                  ? "bg-primary text-primary-foreground"
                  : step > n
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step > n ? <CheckCircle2 className="w-4 h-4" /> : n}
            </div>
            <span
              className={`text-sm font-medium hidden sm:block ${
                step === n ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Upload() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  // ── Step state ──────────────────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2>(1);

  // ── Form fields ─────────────────────────────────────────────────────────────
  const [title, setTitle]         = useState("");
  const [artist, setArtist]       = useState("");
  const [genre, setGenre]         = useState<string>("");
  const [trackType, setTrackType] = useState<string>("");
  const [bpm, setBpm]             = useState("");
  const [musicalKey, setMusicalKey] = useState("");
  const [description, setDescription] = useState("");

  // ── File states ─────────────────────────────────────────────────────────────
  const [isPrivate, setIsPrivate]         = useState(false);
  const [isPrivateDemo, setIsPrivateDemo] = useState(false);
  const [canDownload, setCanDownload]     = useState(true);
  const [audioFile, setAudioFile]         = useState<File | null>(null);
  const [coverImage, setCoverImage]       = useState<File | null>(null);
  const [coverPreview, setCoverPreview]   = useState<string | null>(null);
  const [isDragging, setIsDragging]       = useState(false);

  // ── Upload states ───────────────────────────────────────────────────────────
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [uploadProgress, setUploadProgress]     = useState(0);
  const [audioUploaded, setAudioUploaded]       = useState(false);
  const [coverUploaded, setCoverUploaded]       = useState(false);

  const [uploadedAudio, setUploadedAudio] = useState<{ fileKey: string; fileUrl: string } | null>(null);
  const [uploadedCover, setUploadedCover] = useState<{ fileKey: string; fileUrl: string } | null>(null);

  // ── Analysis ────────────────────────────────────────────────────────────────
  const [isAnalyzing, setIsAnalyzing]   = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const analyzeAudio = trpc.musicAnalysis.analyze.useMutation();
  const createTrack  = trpc.tracks.create.useMutation();

  const isFreeUser = user?.membershipStatus === "free";
  const canMonetize = isAuthenticated && !isFreeUser;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const validateAudio = (file: File) => {
    const validTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/wave", "audio/x-wav"];
    if (!validTypes.includes(file.type)) { toast.error(t("upload.invalidFormat")); return false; }
    if (file.size > 200 * 1024 * 1024)  { toast.error(t("upload.fileTooLarge"));  return false; }
    return true;
  };

  const handleAudioFile = (file: File) => {
    if (!validateAudio(file)) return;
    setAudioFile(file);
    setAudioUploaded(false);
    setUploadedAudio(null);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleAudioFile(file);
  }, []);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error(t("upload.imageOnly")); return; }
    if (file.size > 10 * 1024 * 1024)   { toast.error(t("upload.imageTooLarge")); return; }
    setCoverImage(file);
    setCoverUploaded(false);
    setUploadedCover(null);
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
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
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
      });
      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const res = JSON.parse(xhr.responseText);
          setUploadedAudio({ fileKey: res.fileKey, fileUrl: res.fileUrl });
          setAudioUploaded(true);
          toast.success("Audio subido exitosamente");
          setStep(2);
        } else {
          toast.error("Error al subir el audio");
        }
        setIsUploadingAudio(false);
      });
      xhr.addEventListener("error",   () => { toast.error("Error al subir el audio"); setIsUploadingAudio(false); });
      xhr.addEventListener("timeout", () => { toast.error("Tiempo de espera agotado"); setIsUploadingAudio(false); });
      xhr.timeout = 300000;
      xhr.open("POST", "/api/upload/audio");
      xhr.send(formData);
    } catch (err: any) {
      toast.error(err.message || "Error al subir el audio");
      setIsUploadingAudio(false);
    }
  };

  const handleUploadCover = async () => {
    if (!coverImage) return;
    setIsUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", coverImage);
      const res = await fetch("/api/upload/cover", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Error al subir la portada");
      const data = await res.json();
      setUploadedCover({ fileKey: data.fileKey, fileUrl: data.fileUrl });
      setCoverUploaded(true);
      toast.success("Portada subida exitosamente");
    } catch (err: any) {
      toast.error(err.message || "Error al subir la portada");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleAnalyzeAudio = async (audioUrl?: string) => {
    const url = audioUrl || uploadedAudio?.fileUrl;
    if (!url) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeAudio.mutateAsync({ audioFileUrl: url });
      setAnalysisResult(result);
      if (result.bpm)        setBpm(result.bpm.toString());
      if (result.musicalKey) setMusicalKey(result.musicalKey);
      toast.success("Análisis completado");
    } catch (err: any) {
      toast.error(err.message || "Error al analizar el audio");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
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
        title, artist,
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
        isPrivate: isPrivateDemo ? false : isPrivate,
        isPrivateDemo,
        canDownload,
      });
      if (isPrivateDemo) {
        toast.success("¡Demo privado subido! Copia el link desde tu perfil.");
        setTimeout(() => setLocation("/profile"), 1500);
      } else {
        toast.success("¡Track publicado exitosamente!");
        setTimeout(() => setLocation("/explore"), 1500);
      }
    } catch (err: any) {
      toast.error(err.message || "Error al publicar el track");
    }
  };

  // ── Not authenticated ─────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <Music className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Inicia sesión para subir tracks</h2>
          <p className="text-muted-foreground mb-6">Necesitas una cuenta para publicar música en ONLYDJS.</p>
          <Link href="/login">
            <Button className="bg-primary hover:bg-primary/90">Iniciar sesión</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Free users can upload — membership only needed for monetization

  // ════════════════════════════════════════════════════════════════════════════
  // STEP 1 — Drop zone
  // ════════════════════════════════════════════════════════════════════════════
  if (step === 1) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Page header */}
        <div className="border-b border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Music className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-semibold">Subir track</h1>
            </div>
            <StepIndicator step={1} />
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          {/* Quality hint */}
          <p className="text-sm text-muted-foreground mb-6">
            Para obtener la mejor calidad, utiliza archivos{" "}
            <span className="text-foreground font-medium">WAV o MP3</span>.
            El tamaño máximo del archivo es de <span className="text-foreground font-medium">200 MB</span>.
          </p>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !audioFile && audioInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl transition-colors cursor-pointer
              ${isDragging
                ? "border-primary bg-primary/5"
                : audioFile
                ? "border-border bg-muted/20 cursor-default"
                : "border-border hover:border-primary/50 hover:bg-muted/20"
              }
            `}
            style={{ minHeight: 280 }}
          >
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/mpeg,audio/mp3,audio/wav"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAudioFile(f); }}
            />

            {!audioFile ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center select-none">
                <CloudUpload className={`w-14 h-14 mb-5 transition-colors ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-base font-semibold mb-3">
                  {isDragging ? "Suelta el archivo aquí" : "Arrastra y suelta tu archivo de audio"}
                </p>
                <Button
                  variant="outline"
                  className="rounded-full px-6"
                  onClick={(e) => { e.stopPropagation(); audioInputRef.current?.click(); }}
                >
                  Elegir archivo
                </Button>
              </div>
            ) : (
              <div className="p-6">
                {/* File info row */}
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg mb-5">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Music className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{audioFile.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAudioFile(null);
                      setUploadProgress(0);
                    }}
                    className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Upload progress */}
                {isUploadingAudio && (
                  <div className="mb-5 space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Subiendo…</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-1.5" />
                  </div>
                )}

                {/* Upload button */}
                {!audioUploaded && (
                  <Button
                    onClick={(e) => { e.stopPropagation(); handleUploadAudio(); }}
                    disabled={isUploadingAudio}
                    className="w-full rounded-full h-11 bg-primary hover:bg-primary/90"
                  >
                    {isUploadingAudio ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Subiendo… {uploadProgress}%</>
                    ) : (
                      <><UploadIcon className="w-4 h-4 mr-2" />Subir audio</>
                    )}
                  </Button>
                )}

                {audioUploaded && (
                  <div className="flex items-center gap-2 text-sm text-green-500 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Audio subido — continuando…
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // STEP 2 — Track info (SoundCloud-style: cover left, fields right)
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Sticky top bar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Music className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-sm font-medium truncate text-muted-foreground">
              {audioFile?.name || "Track"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StepIndicator step={2} />
            <Button
              onClick={handleSubmit}
              disabled={createTrack.isPending || !uploadedAudio}
              className="rounded-full px-6 h-9 bg-primary hover:bg-primary/90 flex-shrink-0"
            >
              {createTrack.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Publicando…</>
              ) : (
                "Publicar"
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">

          {/* ── LEFT: Cover art ─────────────────────────────────────────── */}
          <div className="space-y-3">
            {/* Cover image square */}
            <div
              className="aspect-square rounded-xl border-2 border-dashed border-border bg-muted/20 overflow-hidden relative group cursor-pointer"
              onClick={() => coverInputRef.current?.click()}
            >
              {coverPreview ? (
                <>
                  <img src={coverPreview} alt="Portada" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <ImageIcon className="w-6 h-6 text-white" />
                    <p className="text-xs text-white font-medium">Cambiar portada</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground select-none">
                  <ImageIcon className="w-10 h-10" />
                  <p className="text-sm font-medium">Añadir portada</p>
                  <p className="text-xs text-center px-4">JPG o PNG, máx 10 MB</p>
                </div>
              )}
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverChange}
            />

            {/* Upload cover button */}
            {coverImage && !coverUploaded && (
              <Button
                onClick={handleUploadCover}
                disabled={isUploadingCover}
                variant="outline"
                className="w-full rounded-full h-9 text-sm"
              >
                {isUploadingCover ? (
                  <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Subiendo…</>
                ) : (
                  <><UploadIcon className="w-3.5 h-3.5 mr-2" />Subir portada</>
                )}
              </Button>
            )}
            {coverUploaded && (
              <div className="flex items-center gap-1.5 text-xs text-green-500 font-medium px-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Portada subida
              </div>
            )}

            {/* Waveform preview (compact) */}
            {uploadedAudio && (
              <div className="mt-2">
                <WaveformPlayer
                  audioUrl={uploadedAudio.fileUrl}
                  autoAnalyze={false}
                  onAnalysisComplete={() => {
                    if (!analysisResult && !isAnalyzing) handleAnalyzeAudio(uploadedAudio.fileUrl);
                  }}
                  onReady={() => {}}
                />
              </div>
            )}
          </div>

          {/* ── RIGHT: Metadata fields ──────────────────────────────────── */}
          <div className="space-y-0 divide-y divide-border">

            {/* Title */}
            <div className="py-5 first:pt-0">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Título de la pista <span className="text-destructive">*</span>
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("upload.titlePlaceholder")}
                className="border-0 border-b border-border rounded-none px-0 h-10 text-base bg-transparent focus-visible:ring-0 focus-visible:border-primary"
              />
            </div>

            {/* Artist */}
            <div className="py-5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Artista(s) principal(es) <span className="text-destructive">*</span>
              </Label>
              <Input
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder={t("upload.artistPlaceholder")}
                className="border-0 border-b border-border rounded-none px-0 h-10 text-base bg-transparent focus-visible:ring-0 focus-visible:border-primary"
              />
            </div>

            {/* Genre */}
            <div className="py-5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Género <span className="text-destructive">*</span>
              </Label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger className="border-0 border-b border-border rounded-none px-0 h-10 text-base bg-transparent focus:ring-0 shadow-none">
                  <SelectValue placeholder="Añadir o buscar género" />
                </SelectTrigger>
                <SelectContent>
                  {["Tech House","Bass House","Afro House","Techno","Melodic Techno","Big Room","EDM","Hard Techno","Latin","Reggaeton","Hip-Hop","Open Format"].map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Track type */}
            <div className="py-5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Tipo de pista <span className="text-destructive">*</span>
              </Label>
              <Select value={trackType} onValueChange={setTrackType}>
                <SelectTrigger className="border-0 border-b border-border rounded-none px-0 h-10 text-base bg-transparent focus:ring-0 shadow-none">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {["Extended Mix","Edit","Mashup","Remix","Rework"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* BPM + Key */}
            <div className="py-5">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">BPM</Label>
                  <Input
                    type="number"
                    value={bpm}
                    onChange={(e) => setBpm(e.target.value)}
                    placeholder="128"
                    className="border-0 border-b border-border rounded-none px-0 h-10 text-base bg-transparent focus-visible:ring-0 focus-visible:border-primary"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Tonalidad</Label>
                  <Input
                    value={musicalKey}
                    onChange={(e) => setMusicalKey(e.target.value)}
                    placeholder="Am"
                    className="border-0 border-b border-border rounded-none px-0 h-10 text-base bg-transparent focus-visible:ring-0 focus-visible:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="py-5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Descripción</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Las pistas con descripciones tienden a tener más reproducciones e interacciones."
                rows={3}
                className="w-full resize-none bg-transparent border-0 border-b border-border rounded-none px-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* AI Analysis */}
            <div className="py-5">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Análisis IA
                </Label>
                {!analysisResult && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAnalyzeAudio()}
                    disabled={isAnalyzing || !uploadedAudio}
                    className="h-7 text-xs gap-1.5 text-primary hover:text-primary"
                  >
                    {isAnalyzing ? (
                      <><Loader2 className="w-3 h-3 animate-spin" />Analizando…</>
                    ) : (
                      <><Sparkles className="w-3 h-3" />Analizar con IA</>
                    )}
                  </Button>
                )}
              </div>

              {analysisResult ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-green-500 font-medium mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Análisis completado — campos autocompletados
                  </div>
                  <MusicAnalysisDisplay
                    bpm={analysisResult.bpm}
                    musicalKey={analysisResult.key}
                    energy={analysisResult.energy}
                    mood={analysisResult.mood}
                    structure={analysisResult.structure}
                    compact={true}
                  />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  El análisis IA detecta BPM, tonalidad y energía automáticamente.
                </p>
              )}
            </div>

          </div>
        </div>

        {/* Privacy selector */}
        <div className="mt-6 p-4 rounded-xl border border-border bg-card">
          <p className="text-sm font-semibold mb-3">Visibilidad del track</p>
          <div className="grid grid-cols-3 gap-3">
            {/* Público */}
            <button
              type="button"
              onClick={() => { setIsPrivate(false); setIsPrivateDemo(false); }}
              className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                !isPrivate && !isPrivateDemo
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50"
              }`}
            >
              <Globe className="w-4 h-4 flex-shrink-0" />
              <div className="text-left">
                <p className="text-xs font-semibold">Público</p>
                <p className="text-xs opacity-70 hidden sm:block">Visible en Explore</p>
              </div>
            </button>
            {/* Privado con link */}
            <button
              type="button"
              onClick={() => { setIsPrivate(true); setIsPrivateDemo(false); }}
              className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                isPrivate && !isPrivateDemo
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50"
              }`}
            >
              <Lock className="w-4 h-4 flex-shrink-0" />
              <div className="text-left">
                <p className="text-xs font-semibold">Privado</p>
                <p className="text-xs opacity-70 hidden sm:block">Solo link secreto</p>
              </div>
            </button>
            {/* Private Demo */}
            <button
              type="button"
              onClick={() => { setIsPrivateDemo(true); setIsPrivate(false); }}
              className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                isPrivateDemo
                  ? "border-violet-500 bg-violet-500/10 text-violet-400"
                  : "border-border bg-background text-muted-foreground hover:border-violet-500/50"
              }`}
            >
              <Lock className="w-4 h-4 flex-shrink-0" />
              <div className="text-left">
                <p className="text-xs font-semibold">Private Demo</p>
                <p className="text-xs opacity-70 hidden sm:block">Ruta /demo/token</p>
              </div>
            </button>
          </div>

          {/* Private Demo info + download toggle */}
          {isPrivateDemo && (
            <div className="mt-4 space-y-3">
              <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/30 text-xs text-violet-300 flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>El track <strong>no aparecerá en Explore ni en tu perfil público</strong>. Solo accesible desde la ruta <code className="bg-violet-900/40 px-1 rounded">/demo/[token]</code>. Comparte el link por DM.</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">Permitir descarga</p>
                  <p className="text-xs text-muted-foreground">El receptor puede descargar el archivo</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCanDownload(v => !v)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    canDownload ? "bg-violet-500" : "bg-muted"
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    canDownload ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>
            </div>
          )}

          {isPrivate && !isPrivateDemo && (
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              Se generará un link único para compartir. El track no aparecerá en Explore ni en tu perfil público.
            </p>
          )}
        </div>

        {/* Monetization banner for free users */}
        {isFreeUser && (
          <div className="mt-6 p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold">¿Quieres cobrar por tus descargas?</p>
                <p className="text-xs text-muted-foreground">Activa tu membresía por $4.99/mes y empieza a monetizar tu música.</p>
              </div>
            </div>
            <Link href="/membership">
              <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90 flex-shrink-0">Ver planes</Button>
            </Link>
          </div>
        )}

        {/* Bottom action bar (mobile) */}
        <div className="mt-8 pt-6 border-t border-border flex items-center justify-between gap-4 lg:hidden">
          <Button variant="ghost" onClick={() => setStep(1)} className="text-sm">
            ← Volver
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createTrack.isPending || !uploadedAudio}
            className="rounded-full px-8 bg-primary hover:bg-primary/90"
          >
            {createTrack.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Publicando…</>
            ) : (
              "Publicar"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
