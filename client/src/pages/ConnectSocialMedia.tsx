/**
 * Connect Social Media Page
 * Allows artists to connect Instagram (and future platforms) to display their feed on their profile.
 */
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Instagram, Facebook, CheckCircle2, XCircle, RefreshCw,
  ExternalLink, Unlink, Users, AlertCircle, Info
} from "lucide-react";
import { useLocation } from "wouter";

// ── OAuth callback handler ──────────────────────────────────────────────────
function useInstagramOAuthCallback() {
  const [, navigate] = useLocation();
  const connectInstagram = trpc.instagram.connectInstagram.useMutation({
    onSuccess: (data) => {
      toast.success(`✅ Instagram @${data.username} conectado con ${data.postCount} posts`);
      // Clean URL
      window.history.replaceState({}, "", "/connect-social");
    },
    onError: (err) => {
      toast.error(`Error al conectar Instagram: ${err.message}`);
      window.history.replaceState({}, "", "/connect-social");
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    if (code && state === "instagram") {
      const redirectUri = `${window.location.origin}/connect-social`;
      connectInstagram.mutate({ code, redirectUri });
    }
  }, []);

  return connectInstagram.isPending;
}

// ── Platform card component ─────────────────────────────────────────────────
interface PlatformCardProps {
  platform: "instagram" | "facebook";
  icon: React.ReactNode;
  name: string;
  description: string;
  connection?: {
    platformUsername?: string | null;
    profilePictureUrl?: string | null;
    followerCount?: number | null;
    isActive?: boolean;
    lastSyncAt?: Date | null;
    tokenExpiresAt?: Date | null;
  } | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onRefresh?: () => void;
  isConnecting?: boolean;
  isDisconnecting?: boolean;
  isRefreshing?: boolean;
  comingSoon?: boolean;
}

function PlatformCard({
  platform, icon, name, description, connection,
  onConnect, onDisconnect, onRefresh,
  isConnecting, isDisconnecting, isRefreshing, comingSoon
}: PlatformCardProps) {
  const isConnected = connection?.isActive;

  return (
    <Card className="border border-border/50 bg-card/50 hover:bg-card transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${platform === "instagram" ? "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400" : "bg-blue-600"}`}>
              <span className="text-white">{icon}</span>
            </div>
            <div>
              <CardTitle className="text-base">{name}</CardTitle>
              <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
            </div>
          </div>
          {comingSoon ? (
            <Badge variant="secondary" className="text-xs">Próximamente</Badge>
          ) : isConnected ? (
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />Conectado
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <XCircle className="w-3 h-3" />No conectado
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isConnected && connection ? (
          <div className="space-y-3">
            {/* Profile info */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Avatar className="w-10 h-10">
                <AvatarImage src={connection.profilePictureUrl || ""} />
                <AvatarFallback className="text-sm">
                  {connection.platformUsername?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">@{connection.platformUsername}</p>
                {connection.followerCount !== null && connection.followerCount !== undefined && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {(connection.followerCount || 0).toLocaleString()} seguidores
                  </p>
                )}
              </div>
              <a
                href={`https://instagram.com/${connection.platformUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            {/* Last sync */}
            {connection.lastSyncAt && (
              <p className="text-xs text-muted-foreground">
                Última sincronización: {new Date(connection.lastSyncAt).toLocaleString()}
              </p>
            )}
            {/* Token expiry warning */}
            {connection.tokenExpiresAt && new Date(connection.tokenExpiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-600">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                Tu token expira pronto. Reconecta tu cuenta para mantener el feed activo.
              </div>
            )}
            {/* Actions */}
            <div className="flex gap-2">
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="flex-1"
                >
                  <RefreshCw className={`w-3 h-3 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
                  {isRefreshing ? "Actualizando..." : "Actualizar feed"}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onDisconnect}
                disabled={isDisconnecting}
                className="flex-1 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60"
              >
                <Unlink className="w-3 h-3 mr-1.5" />
                {isDisconnecting ? "Desconectando..." : "Desconectar"}
              </Button>
            </div>
          </div>
        ) : comingSoon ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground">
            <Info className="w-4 h-4 flex-shrink-0" />
            Esta integración estará disponible próximamente.
          </div>
        ) : (
          <Button
            onClick={onConnect}
            disabled={isConnecting}
            className={`w-full ${platform === "instagram" ? "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:opacity-90 text-white border-0" : "bg-blue-600 hover:bg-blue-700 text-white border-0"}`}
          >
            {isConnecting ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Conectando...</>
            ) : (
              <>{icon}<span className="ml-2">Conectar {name}</span></>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function ConnectSocialMedia() {
  const { user } = useAuth();
  const isProcessingCallback = useInstagramOAuthCallback();

  const { data: connections, refetch: refetchConnections } = trpc.instagram.getMyConnections.useQuery(undefined, {
    enabled: !!user,
  });

  const getAuthUrl = trpc.instagram.getAuthUrl.useQuery(
    { redirectUri: `${window.location.origin}/connect-social` },
    { enabled: false }
  );

  const disconnect = trpc.instagram.disconnect.useMutation({
    onSuccess: () => {
      toast.success("Cuenta desconectada correctamente");
      refetchConnections();
    },
    onError: (err) => toast.error(`Error: ${err.message}`),
  });

  const refreshFeed = trpc.instagram.refreshFeed.useMutation({
    onSuccess: (data) => {
      toast.success(`Feed actualizado con ${data.postCount} posts`);
      refetchConnections();
    },
    onError: (err) => toast.error(`Error al actualizar: ${err.message}`),
  });

  const instagramConnection = connections?.find(c => c.platform === "instagram" && c.isActive);

  const handleConnectInstagram = async () => {
    try {
      const result = await getAuthUrl.refetch();
      if (result.data?.url) {
        window.location.href = result.data.url;
      } else {
        toast.error("No se pudo obtener el enlace de autorización. Verifica que INSTAGRAM_APP_ID esté configurado.");
      }
    } catch (err: any) {
      toast.error(err.message || "Error al iniciar la conexión con Instagram");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Debes iniciar sesión para acceder a esta sección.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Conectar Redes Sociales</h1>
          <p className="text-muted-foreground">
            Conecta tus cuentas de redes sociales para mostrar tu contenido automáticamente en tu perfil público de ONLYDJS.
          </p>
        </div>

        {/* Processing callback banner */}
        {isProcessingCallback && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
            <RefreshCw className="w-5 h-5 animate-spin text-primary" />
            <p className="text-sm font-medium">Conectando tu cuenta de Instagram...</p>
          </div>
        )}

        {/* Info banner */}
        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-1">¿Cómo funciona?</p>
            <p className="text-xs text-muted-foreground">
              Al conectar tu Instagram, tus últimos 9 posts aparecerán automáticamente en tu perfil público.
              El feed se actualiza cada hora. Solo se muestran imágenes y carruseles (no Reels ni Stories).
            </p>
          </div>
        </div>

        {/* Platform cards */}
        <div className="grid gap-4">
          <PlatformCard
            platform="instagram"
            icon={<Instagram className="w-5 h-5" />}
            name="Instagram"
            description="Muestra tus últimos 9 posts en tu perfil"
            connection={instagramConnection ? {
              platformUsername: instagramConnection.platformUsername,
              profilePictureUrl: instagramConnection.profilePictureUrl,
              followerCount: instagramConnection.followerCount,
              isActive: instagramConnection.isActive,
              lastSyncAt: instagramConnection.lastSyncAt,
              tokenExpiresAt: instagramConnection.tokenExpiresAt,
            } : null}
            onConnect={handleConnectInstagram}
            onDisconnect={() => disconnect.mutate({ platform: "instagram" })}
            onRefresh={() => refreshFeed.mutate()}
            isConnecting={getAuthUrl.isFetching}
            isDisconnecting={disconnect.isPending}
            isRefreshing={refreshFeed.isPending}
          />

          <PlatformCard
            platform="facebook"
            icon={<Facebook className="w-5 h-5" />}
            name="Facebook Page"
            description="Conecta tu página de Facebook para mostrar tus publicaciones"
            connection={null}
            onConnect={() => toast.info("Facebook estará disponible próximamente")}
            onDisconnect={() => {}}
            comingSoon
          />
        </div>

        {/* Requirements note */}
        <div className="mt-8 p-4 rounded-xl bg-muted/30 border border-border/50">
          <p className="text-xs text-muted-foreground font-medium mb-2">Requisitos para Instagram</p>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Tu cuenta de Instagram debe ser una <strong>cuenta de creador o empresa</strong> (no personal)</li>
            <li>Debes tener una <strong>App de Meta</strong> configurada con los permisos <code>user_profile</code> y <code>user_media</code></li>
            <li>El token de acceso se renueva automáticamente cada 60 días</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-3">
            Para configurar las credenciales de Instagram, ve a <strong>Settings → Secrets</strong> y agrega{" "}
            <code className="bg-muted px-1 rounded">INSTAGRAM_APP_ID</code> y{" "}
            <code className="bg-muted px-1 rounded">INSTAGRAM_APP_SECRET</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
