import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Loader2, Lock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

interface DownloadButtonProps {
  trackId: number;
  trackTitle: string;
  artist: string;
  compact?: boolean;
}

export default function DownloadButton({ trackId, trackTitle, artist, compact = false }: DownloadButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);
  
  const downloadMutation = trpc.downloads.downloadTrack.useMutation({
    onSuccess: (data: { downloadUrl: string; filename: string; format: string; remaining: string }) => {
      // Trigger browser download
      const link = document.createElement("a");
      link.href = data.downloadUrl;
      link.download = data.filename;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Descargando ${data.filename}`);
      setIsDownloading(false);
    },
    onError: (error: any) => {
      if (error.message.includes("membresía")) {
        toast.error("Necesitas una membresía activa para descargar", {
          action: {
            label: "Suscribirse",
            onClick: () => window.location.href = "/membership",
          },
        });
      } else {
        toast.error(error.message || "Error al descargar el track");
      }
      setIsDownloading(false);
    },
  });

  const handleDownload = (format: "mp3" | "wav") => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para descargar", {
        action: {
          label: "Iniciar sesión",
          onClick: () => window.location.href = getLoginUrl(),
        },
      });
      return;
    }

    if (user?.membershipStatus === "free") {
      toast.error("Necesitas una membresía activa para descargar", {
        description: "Suscríbete por $4.99/mes para acceso ilimitado",
        action: {
          label: "Suscribirse",
          onClick: () => window.location.href = "/membership",
        },
      });
      return;
    }

    setIsDownloading(true);
    downloadMutation.mutate({ trackId, format });
  };

  // Show lock icon for free users
  const isFreeUser = !isAuthenticated || user?.membershipStatus === "free";

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            disabled={isDownloading}
            className="relative"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isFreeUser ? (
              <Lock className="h-4 w-4" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleDownload("mp3")}>
            <Download className="h-4 w-4 mr-2" />
            Descargar MP3 320kbps
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownload("wav")}>
            <Download className="h-4 w-4 mr-2" />
            Descargar WAV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={isFreeUser ? "outline" : "default"}
          disabled={isDownloading}
          className="w-full"
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Descargando...
            </>
          ) : isFreeUser ? (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Descargar (Membresía requerida)
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-56">
        <DropdownMenuItem onClick={() => handleDownload("mp3")}>
          <Download className="h-4 w-4 mr-2" />
          <div className="flex flex-col">
            <span className="font-medium">MP3 320kbps</span>
            <span className="text-xs text-muted-foreground">Alta calidad, archivo pequeño</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("wav")}>
          <Download className="h-4 w-4 mr-2" />
          <div className="flex flex-col">
            <span className="font-medium">WAV</span>
            <span className="text-xs text-muted-foreground">Calidad máxima, sin compresión</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
