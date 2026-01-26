import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, X, Copy, Check } from "lucide-react";
import confetti from "canvas-confetti";

interface BadgeUnlockedNotificationProps {
  badge: {
    badgeType: string;
    unlockedAt: Date | null;
  } | null;
  onClose: () => void;
}

const badgeInfo: Record<string, { icon: string; name: string; description: string; color: string }> = {
  club_killer: {
    icon: "🎧",
    name: "Club Killer",
    description: "Has descargado más de 100 tracks",
    color: "cyan",
  },
  festival_weapon: {
    icon: "🚀",
    name: "Festival Weapon",
    description: "Tienes un track en el Top 10 Mainstage",
    color: "purple",
  },
  peak_time_master: {
    icon: "🔥",
    name: "Peak Time Master",
    description: "Has descargado más de 50 tracks de Peak Time",
    color: "pink",
  },
  ai_power_dj: {
    icon: "🧠",
    name: "AI Power DJ",
    description: "Has generado más de 10 sets con IA",
    color: "yellow",
  },
  verified_dj: {
    icon: "💎",
    name: "Verified DJ",
    description: "Tienes membresía verificada",
    color: "green",
  },
  precision_master: {
    icon: "🎯",
    name: "Precision Master",
    description: "Tu profile score es mayor a 90",
    color: "cyan",
  },
  rising_star: {
    icon: "🌟",
    name: "Rising Star",
    description: "Tienes más de 100 seguidores",
    color: "purple",
  },
  top_10_dj: {
    icon: "🏆",
    name: "Top 10 DJ",
    description: "Estás en el ranking global Top 10",
    color: "pink",
  },
  sound_designer: {
    icon: "🎨",
    name: "Sound Designer",
    description: "Has subido más de 20 tracks",
    color: "yellow",
  },
  bass_lord: {
    icon: "🔊",
    name: "Bass Lord",
    description: "Eres especialista en Bass House",
    color: "green",
  },
};

const colorClasses: Record<string, string> = {
  cyan: "from-cyan-500/20 to-cyan-600/20 border-cyan-500",
  purple: "from-purple-500/20 to-purple-600/20 border-purple-500",
  pink: "from-pink-500/20 to-pink-600/20 border-pink-500",
  yellow: "from-yellow-500/20 to-yellow-600/20 border-yellow-500",
  green: "from-green-500/20 to-green-600/20 border-green-500",
};

export default function BadgeUnlockedNotification({ badge, onClose }: BadgeUnlockedNotificationProps) {
  const [copied, setCopied] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);

  const info = badge ? badgeInfo[badge.badgeType] : null;

  useEffect(() => {
    if (badge && info) {
      // Trigger confetti animation
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [badge, info]);

  if (!badge || !info) return null;

  const shareText = `¡Acabo de desbloquear el badge "${info.name}" en ONLYDJS! 🎉 ${info.description}`;
  const shareUrl = "https://onlydjs.com";

  const handleShare = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], "_blank", "width=600,height=400");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Dialog open={!!badge} onOpenChange={onClose}>
      <DialogContent className={`max-w-md bg-gradient-to-br ${colorClasses[info.color]} border-2 backdrop-blur-sm`}>
        <DialogHeader>
          <DialogTitle className="text-3xl text-center text-white flex flex-col items-center gap-3">
            <div className="text-7xl animate-bounce">{info.icon}</div>
            <span className="text-glow-cyan">¡Badge Desbloqueado!</span>
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            <Badge variant="outline" className={`border-${info.color}-500 text-${info.color}-400 text-lg px-4 py-2 mt-2`}>
              {info.name}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <p className="text-center text-gray-300 text-base">{info.description}</p>

          {badge.unlockedAt && (
            <p className="text-center text-xs text-gray-400">
              Desbloqueado el {new Date(badge.unlockedAt).toLocaleDateString()}
            </p>
          )}

          {/* Share Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => setShareMenuOpen(!shareMenuOpen)}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartir en Redes Sociales
            </Button>

            {shareMenuOpen && (
              <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2">
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
                  className="border-green-500 text-green-400 hover:bg-green-500/10"
                >
                  WhatsApp
                </Button>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4 mr-2" />
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
