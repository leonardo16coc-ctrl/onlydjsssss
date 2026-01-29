import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      
      toast.success(t('download.downloadingFile').replace('{filename}', data.filename));
      setIsDownloading(false);
    },
    onError: (error: any) => {
      if (error.message.includes("membresía") || error.message.includes("membership")) {
        toast.error(t('download.membershipRequired'), {
          action: {
            label: t('player.subscribe'),
            onClick: () => window.location.href = "/membership",
          },
        });
      } else {
        toast.error(error.message || t('download.downloadError'));
      }
      setIsDownloading(false);
    },
  });

  const handleDownload = (format: "mp3" | "wav") => {
    if (!isAuthenticated) {
      toast.error(t('download.loginToDownload'), {
        action: {
          label: t('download.login'),
          onClick: () => window.location.href = getLoginUrl(),
        },
      });
      return;
    }

    if (user?.membershipStatus === "free") {
      toast.error(t('download.membershipRequired'), {
        description: t('download.membershipDesc'),
        action: {
          label: t('player.subscribe'),
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
            {t('download.downloadMp3')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownload("wav")}>
            <Download className="h-4 w-4 mr-2" />
            {t('download.downloadWav')}
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
              {t('download.downloading')}
            </>
          ) : isFreeUser ? (
            <>
              <Lock className="h-4 w-4 mr-2" />
              {t('download.downloadRequired')}
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              {t('download.download')}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-56">
        <DropdownMenuItem onClick={() => handleDownload("mp3")}>
          <Download className="h-4 w-4 mr-2" />
          <div className="flex flex-col">
            <span className="font-medium">MP3 320kbps</span>
            <span className="text-xs text-muted-foreground">{t('download.mp3Quality')}</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("wav")}>
          <Download className="h-4 w-4 mr-2" />
          <div className="flex flex-col">
            <span className="font-medium">WAV</span>
            <span className="text-xs text-muted-foreground">{t('download.wavQuality')}</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
