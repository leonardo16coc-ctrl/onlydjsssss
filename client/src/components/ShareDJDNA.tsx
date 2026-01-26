import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Download, Copy, Check } from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "sonner";

interface ShareDJDNAProps {
  profile: {
    avgBpm: number | null;
    favoriteGenres: string | null;
    favoriteKeys: string | null;
    avgEnergy: number | null;
    preferredMoment?: string | null;
  };
}

export default function ShareDJDNA({ profile }: ShareDJDNAProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const getDNAString = () => {
    const bpm = profile.avgBpm ? `${Math.round(profile.avgBpm)} BPM` : "Variado";
    const genre = profile.favoriteGenres?.split(",")[0] || "Electronic";
    const key = profile.favoriteKeys?.split(",")[0] || "Am";
    const energy = profile.avgEnergy
      ? profile.avgEnergy > 70
        ? "High Energy"
        : profile.avgEnergy > 40
        ? "Balanced Energy"
        : "Chill Energy"
      : "Balanced Energy";

    return `${bpm} · ${genre} · ${key} · ${energy}`;
  };

  const generateImage = async () => {
    if (!cardRef.current) return null;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0f172a",
        scale: 2,
        logging: false,
      });

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), "image/png");
      });

      setIsGenerating(false);
      return blob;
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Error al generar imagen");
      setIsGenerating(false);
      return null;
    }
  };

  const handleDownload = async () => {
    const blob = await generateImage();
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mi-adn-dj-onlydjs.png";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Imagen descargada");
  };

  const handleCopyText = () => {
    const text = `Mi ADN DJ: ${getDNAString()} 🎧 onlydjs.com`;
    navigator.clipboard.writeText(text);
    toast.success("Texto copiado al portapapeles");
  };

  const handleShare = (platform: string) => {
    const text = `Mi ADN DJ: ${getDNAString()} 🎧`;
    const url = "https://onlydjs.com";
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], "_blank", "width=600,height=400");
    }
  };

  return (
    <div className="space-y-4">
      {/* Card para capturar como imagen */}
      <div
        ref={cardRef}
        className="p-8 bg-gradient-to-br from-slate-900 via-purple-900/20 to-cyan-900/20 rounded-xl border-2 border-cyan-500/50"
      >
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🎧</div>
          <h3 className="text-2xl font-bold text-white text-glow-cyan">Mi ADN DJ</h3>
          <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
            {getDNAString()}
          </p>
          <div className="pt-4 border-t border-cyan-500/30">
            <p className="text-cyan-400 font-semibold text-lg">onlydjs.com</p>
            <p className="text-xs text-gray-400 mt-1">La Plataforma #1 para DJs</p>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="space-y-2">
        <Button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
        >
          <Share2 className="w-4 h-4 mr-2" />
          📤 Compartir mi ADN DJ
        </Button>

        {showShareMenu && (
          <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2">
            <Button
              onClick={handleDownload}
              disabled={isGenerating}
              variant="outline"
              className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
            >
              <Download className="w-4 h-4 mr-2" />
              {isGenerating ? "Generando..." : "Descargar"}
            </Button>
            <Button
              onClick={handleCopyText}
              variant="outline"
              className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar Texto
            </Button>
            <Button
              onClick={() => handleShare("twitter")}
              variant="outline"
              className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
            >
              𝕏 Twitter
            </Button>
            <Button
              onClick={() => handleShare("facebook")}
              variant="outline"
              className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
            >
              Facebook
            </Button>
            <Button
              onClick={() => handleShare("whatsapp")}
              variant="outline"
              className="border-green-500 text-green-400 hover:bg-green-500/10 col-span-2"
            >
              WhatsApp
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
