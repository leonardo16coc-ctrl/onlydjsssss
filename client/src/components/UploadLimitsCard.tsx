import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Upload, Crown, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

/**
 * UploadLimitsCard - Shows upload limits and usage for current user
 */
interface UploadLimitsCardProps {
  compact?: boolean;
}

export default function UploadLimitsCard({ compact = false }: UploadLimitsCardProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: limits, isLoading } = trpc.uploads.getUploadLimits.useQuery();

  if (isLoading || !limits) {
    return null;
  }

  const { membershipStatus, limits: userLimits } = limits;
  const isUnlimited = userLimits.maxUploadsPerMonth === -1;
  
  // Mock current usage (TODO: implement actual tracking)
  const currentUploads = 0;
  const maxUploads = userLimits.maxUploadsPerMonth;
  const percentage = isUnlimited ? 0 : (currentUploads / maxUploads) * 100;

  const getMembershipColor = (status: string) => {
    switch (status) {
      case "verified":
        return "text-yellow-500";
      case "member":
        return "text-purple-500";
      default:
        return "text-gray-500";
    }
  };

  const getMembershipLabel = (status: string) => {
    switch (status) {
      case "verified":
        return "Studio";
      case "member":
        return "Pro";
      default:
        return "Free";
    }
  };

  return (
    <Card className={compact ? "p-4 border-border/30 bg-card/30 backdrop-blur-sm" : "p-6 border-border/50 bg-card/50 backdrop-blur"}>
      <div className={compact ? "mb-3" : "mb-4"}>
        <div className="flex items-center gap-2 mb-1">
          <Crown className={`h-4 w-4 ${getMembershipColor(membershipStatus)}`} />
          <span className={`text-sm font-medium ${getMembershipColor(membershipStatus)}`}>
            Plan {getMembershipLabel(membershipStatus)}
          </span>
        </div>
        {!compact && (
          <h3 className="font-bold text-lg">Límites de Upload</h3>
        )}
      </div>

      <div className="space-y-4">
        {/* Upload count */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Uploads este mes</span>
            <span className="text-sm font-medium">
              {isUnlimited ? (
                <span className="text-green-500">Ilimitado ✨</span>
              ) : (
                `${currentUploads} / ${maxUploads}`
              )}
            </span>
          </div>
          {!isUnlimited && (
            <Progress value={percentage} className="h-2" />
          )}
        </div>

        {/* File size limit */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Tamaño máximo</span>
          <span className="font-medium">{userLimits.maxFileSizeMB} MB</span>
        </div>

        {/* Duration limit */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Duración máxima</span>
          <span className="font-medium">{userLimits.maxDurationMinutes} min</span>
        </div>

        {/* Supported formats */}
        <div>
          <span className="text-sm text-muted-foreground block mb-2">Formatos soportados</span>
          <div className="flex flex-wrap gap-2">
            {userLimits.supportedFormats.map((format) => (
              <span
                key={format}
                className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded"
              >
                {format}
              </span>
            ))}
          </div>
        </div>

        {/* Upgrade CTA for free users - only in non-compact mode */}
        {!compact && membershipStatus === "free" && (
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-3">
              Actualiza a <span className="text-purple-500 font-medium">Pro</span> para subir hasta 50 tracks/mes
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setLocation("/membership")}
              className="w-full"
            >
              Ver Planes
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
