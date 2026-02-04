import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { trpc } from "../lib/trpc";
import { Loader2, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Link } from "wouter";

export function AIAnalyzer() {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);
  const [result, setResult] = useState<{
    bpm: number;
    musicalKey: string;
    camelotKey?: string;
  } | null>(null);

  const analyzeAudio = trpc.aiAnalyzer.analyzeAudio.useMutation();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // Check file size (max 1000MB)
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > 1000) {
        toast.error(t("aiAnalyzer.fileTooLarge", { size: fileSizeMB.toFixed(2) }));
        return;
      }

      setResult(null);
      setUploading(true);
      setUploadProgress(0);

      try {
        // Convert file to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const audioBase64 = await base64Promise;
        setUploadProgress(50);
        setUploading(false);

        // Start analyzing
        setAnalyzing(true);

        // Analyze audio using aiAnalyzer (librosa-based)
        const analysis = await analyzeAudio.mutateAsync({
          audioBase64,
          filename: file.name,
        });

        setUploadProgress(100);

        setResult({
          bpm: analysis.bpm || 0,
          musicalKey: analysis.key || "Unknown",
          camelotKey: analysis.camelotKey || "?",
        });

        toast.success(t("aiAnalyzer.analysisComplete"));
      } catch (error: any) {
        console.error("Analysis error:", error);
        toast.error(error.message || t("aiAnalyzer.analysisFailed"));
      } finally {
        setUploading(false);
        setAnalyzing(false);
      }
    },
    [analyzeAudio, t]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/wav": [".wav"],
      "audio/mpeg": [".mp3"],
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 py-16">
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-bold mb-2">
          <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            AI BPM & KEY ANALYZER
          </span>
        </h2>
        <p className="text-sm text-blue-300 font-semibold uppercase tracking-wider">
          {t("aiAnalyzer.subtitle")}
        </p>
      </div>

      {/* Main Analyzer Card */}
      <div className="relative">
        {/* Glassmorphism Card */}
        <div className="relative bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-cyan-900/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl -z-10" />

          {/* Logo Circle (Shazam style) */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Outer glow ring */}
              <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 blur-2xl opacity-60 ${analyzing ? "animate-pulse" : ""}`} />
              
              {/* Glass sphere container */}
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-purple-600/80 via-blue-600/80 to-cyan-600/80 backdrop-blur-sm border-4 border-white/20 flex items-center justify-center shadow-2xl overflow-hidden">
                {/* Inner glass sphere effect */}
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/30 blur-md" />
                
                {/* Logo */}
                {uploading || analyzing ? (
                  <Loader2 className="w-16 h-16 text-white animate-spin relative z-10" />
                ) : (
                  <img
                    src="/logo-circle.webp"
                    alt="ONLYDJS"
                    className="w-20 h-20 object-contain relative z-10"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Drop Zone */}
          <div
            {...getRootProps()}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 mb-6 ${isDragActive ? "border-cyan-400 bg-cyan-500/10" : "border-white/30 hover:border-purple-400 hover:bg-purple-500/5"} ${result || uploading ? "opacity-50 pointer-events-none" : ""}`}
          >
            <input {...getInputProps()} disabled={!!result || uploading} />
            <Upload className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-semibold text-white mb-1">
              {isDragActive
                ? t("aiAnalyzer.dropHere")
                : t("aiAnalyzer.dropZone")}
            </p>
            <p className="text-xs text-gray-400">
              {t("aiAnalyzer.supportedFormats")} • {t("aiAnalyzer.maxSize")}
            </p>
          </div>

          {/* Results - Integrated Bars */}
          {result && !analyzing && (
            <div className="space-y-4">
              {/* BPM Bar */}
              <div className="relative bg-gradient-to-r from-blue-600/30 to-cyan-600/30 backdrop-blur-sm rounded-full p-4 border-2 border-blue-400/50 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-lg -z-10" />
                <div className="flex items-center justify-between px-4">
                  <div className="text-5xl font-black text-white">
                    {result.bpm}
                  </div>
                  <div className="text-2xl font-bold text-blue-300 uppercase tracking-wider">
                    BPM
                  </div>
                </div>
              </div>

              {/* Key Bar */}
              <div className="relative bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-sm rounded-full p-4 border-2 border-purple-400/50 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-lg -z-10" />
                <div className="flex items-center justify-between px-4">
                  <div className="text-4xl font-black text-white">
                    {result.musicalKey.split(' ')[0]}
                  </div>
                  <div className="text-xl font-bold text-purple-300 uppercase tracking-wider">
                    {result.musicalKey.split(' ')[1]?.substring(0, 3)}
                  </div>
                  <div className="text-sm text-gray-300">
                    {t("aiAnalyzer.camelot")}: <span className="font-bold text-white">{result.camelotKey}</span>
                  </div>
                </div>
              </div>

              {/* Analyzer Label */}
              <div className="text-center">
                <p className="text-xs text-gray-400 uppercase tracking-widest">
                  ONLYDJS ANALYZER
                </p>
              </div>

              {/* CTA */}
              <div className="text-center pt-4">
                <p className="text-gray-300 mb-4">{t("aiAnalyzer.ctaText")}</p>
                <Link href="/upload">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8"
                  >
                    {t("aiAnalyzer.ctaButton")}
                  </Button>
                </Link>
              </div>

              {/* Analyze Another */}
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => setResult(null)}
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  {t("aiAnalyzer.analyzeAnother")}
                </Button>
              </div>
            </div>
          )}

          {/* Uploading State */}
          {uploading && (
            <div className="text-center py-8">
              <Loader2 className="w-16 h-16 mx-auto mb-4 text-cyan-400 animate-spin" />
              <p className="text-xl font-semibold text-white mb-2">
                Subiendo archivo...
              </p>
              <div className="w-full max-w-md mx-auto mt-4">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2">{uploadProgress}%</p>
              </div>
            </div>
          )}

          {/* Analyzing State */}
          {analyzing && !uploading && (
            <div className="text-center py-8">
              <Loader2 className="w-16 h-16 mx-auto mb-4 text-cyan-400 animate-spin" />
              <p className="text-xl font-semibold text-white mb-2">
                {t("aiAnalyzer.analyzing")}
              </p>
              <p className="text-sm text-gray-400">
                {t("aiAnalyzer.analyzingSubtext")}
              </p>
            </div>
          )}

          {/* Footer */}
          {!result && !analyzing && !uploading && (
            <div className="text-center mt-6 pt-4 border-t border-white/10">
              <p className="text-sm text-gray-400">
                {t("aiAnalyzer.footer")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
