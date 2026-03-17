/**
 * Connect Social Media Page
 * Allows artists to connect Instagram and Threads to display their feed on their profile.
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
  ExternalLink, Unlink, Users, AlertCircle, Info, AtSign, Twitter
} from "lucide-react";
import { useLocation } from "wouter";

// ── TikTok SVG icon ────────────────────────────────────────────────────────
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.2 8.2 0 0 0 4.79 1.53V6.77a4.85 4.85 0 0 1-1.02-.08z"/>
    </svg>
  );
}

// ── Threads SVG icon ────────────────────────────────────────────────────────
function ThreadsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.474 12.01v-.017c.03-3.579.885-6.43 2.548-8.48C5.865 1.205 8.618.024 12.2 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.284 2.651Zm.valeur-8.77c-.11 0-.221.003-.332.01-1.12.065-1.977.37-2.474.876-.43.44-.621.997-.589 1.657.069 1.275 1.213 2.026 3.182 1.917 1.106-.06 1.907-.407 2.45-1.06.535-.643.797-1.565.78-2.74a11.415 11.415 0 0 0-3.017-.66Z"/>
    </svg>
  );
}

/// ── OAuth callback handlers ────────────────────────────────────────────────
function useInstagramOAuthCallback() {
  const utils = trpc.useUtils();
  const connectInstagram = trpc.instagram.connectInstagram.useMutation({
    onSuccess: (data) => {
      toast.success(`✅ Instagram @${data.username} conectado con ${data.postCount} posts`);
      utils.instagram.getMyConnections.invalidate();
      // Clean URL: remove code and state params
      window.history.replaceState({}, "", "/connect-social");
    },
    onError: (err) => {
      toast.error(`Error al conectar Instagram: ${err.message}`);
      window.history.replaceState({}, "", "/connect-social");
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Instagram appends #_ to the code — strip it
    let code = params.get("code");
    if (code) code = code.replace(/#_$/, "");
    const state = params.get("state");
    const error = params.get("error");

    if (error) {
      const reason = params.get("error_reason") || "";
      if (reason !== "user_denied") {
        toast.error(`Instagram rechazó la conexión: ${params.get("error_description") || error}`);
      }
      window.history.replaceState({}, "", "/connect-social");
      return;
    }

    if (code && state === "instagram" && !connectInstagram.isPending && !connectInstagram.isSuccess) {
      const redirectUri = `${window.location.origin}/connect-social`;
      connectInstagram.mutate({ code, redirectUri });
    }
  }, []);

  return connectInstagram.isPending;
}

function useThreadsOAuthCallback(onSuccess: () => void) {
  const connectThreads = trpc.threads.connectThreads.useMutation({
    onSuccess: (data) => {
      toast.success(`✅ Threads @${data.username} conectado con ${data.postCount} posts`);
      window.history.replaceState({}, "", "/connect-social");
      onSuccess();
    },
    onError: (err) => {
      toast.error(`Error al conectar Threads: ${err.message}`);
      window.history.replaceState({}, "", "/connect-social");
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    if (code && state === "threads") {
      const redirectUri = `${window.location.origin}/connect-social`;
      connectThreads.mutate({ code, redirectUri });
    }
  }, []);

  return connectThreads.isPending;
}

// ── Platform card component ─────────────────────────────────────────────────
interface PlatformCardProps {
  platform: "instagram" | "facebook" | "threads";
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
  accentColor?: string;
}

function PlatformCard({
  platform, icon, name, description, connection,
  onConnect, onDisconnect, onRefresh,
  isConnecting, isDisconnecting, isRefreshing, comingSoon,
  accentColor = "from-purple-500 via-pink-500 to-orange-400"
}: PlatformCardProps) {
  const isConnected = connection?.isActive;

  return (
    <Card className="border border-border/50 bg-card/50 hover:bg-card transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accentColor} flex items-center justify-center text-white`}>
              {icon}
            </div>
            <div>
              <CardTitle className="text-base">{name}</CardTitle>
              <CardDescription className="text-xs">{description}</CardDescription>
            </div>
          </div>
          {isConnected ? (
            <Badge variant="outline" className="border-green-500/50 text-green-400 bg-green-500/10 text-xs">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Conectado
            </Badge>
          ) : comingSoon ? (
            <Badge variant="outline" className="text-xs text-muted-foreground">Próximamente</Badge>
          ) : (
            <Badge variant="outline" className="border-muted text-muted-foreground text-xs">
              <XCircle className="w-3 h-3 mr-1" />
              No conectado
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isConnected && connection ? (
          <div className="space-y-3">
            {/* Profile info */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Avatar className="w-10 h-10">
                {connection.profilePictureUrl && <AvatarImage src={connection.profilePictureUrl} />}
                <AvatarFallback className="text-xs">
                  {connection.platformUsername?.slice(0, 2).toUpperCase() || "??"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">@{connection.platformUsername}</p>
                {connection.followerCount != null && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {connection.followerCount.toLocaleString()} seguidores
                  </p>
                )}
              </div>
              <a
                href={`https://${platform === "threads" ? "threads.net" : "instagram.com"}/${connection.platformUsername}`}
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
            {connection.tokenExpiresAt && (() => {
              const daysLeft = Math.floor((new Date(connection.tokenExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return daysLeft < 7 ? (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-400">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  Token expira en {daysLeft} días. Reconecta tu cuenta pronto.
                </div>
              ) : null;
            })()}
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
            className={`w-full bg-gradient-to-r ${accentColor} hover:opacity-90 text-white border-0`}
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

function useTwitterOAuthCallback(onSuccess: () => void) {
  const connectTwitter = trpc.twitter.connectTwitter.useMutation({
    onSuccess: (data) => {
      toast.success(`✅ Twitter @${data.username} conectado (${data.followers.toLocaleString()} seguidores)`);
      window.history.replaceState({}, "", "/connect-social");
      onSuccess();
    },
    onError: (err) => {
      toast.error(`Error al conectar Twitter: ${err.message}`);
      window.history.replaceState({}, "", "/connect-social");
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    if (code && state?.startsWith("twitter_")) {
      const redirectUri = "https://onlydjs-musi-zsqs9m2e.manus.space/connect-social";
      connectTwitter.mutate({ code, state, redirectUri });
    }
  }, []);

  return connectTwitter.isPending;
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function ConnectSocialMedia() {
  const { user, loading: authLoading } = useAuth();

  const { data: igConnections, refetch: refetchIg } = trpc.instagram.getMyConnections.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: threadsConnection, refetch: refetchThreads } = trpc.threads.getMyConnection.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: twitterConnection, refetch: refetchTwitter } = trpc.twitter.getMyConnections.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: tiktokConnection, refetch: refetchTikTok } = trpc.tiktok.getMyConnections.useQuery(undefined, {
    enabled: !!user,
  });

  const isProcessingInstagram = useInstagramOAuthCallback();
  const isProcessingThreads = useThreadsOAuthCallback(() => refetchThreads());
  const isProcessingTwitter = useTwitterOAuthCallback(() => refetchTwitter());

  // TikTok OAuth callback handler
  const connectTikTok = trpc.tiktok.connectTikTok.useMutation({
    onSuccess: (data) => {
      toast.success(`✅ TikTok @${data.username} conectado (${data.followers.toLocaleString()} seguidores)`);
      refetchTikTok();
    },
    onError: (err) => toast.error(`Error al conectar TikTok: ${err.message}`),
  });
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    if (code && state?.startsWith("tiktok_") && !connectTikTok.isPending && !connectTikTok.isSuccess) {
      const redirectUri = `${window.location.origin}/connect-social`;
      connectTikTok.mutate({ code, state, redirectUri });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Instagram
  const igGetAuthUrl = trpc.instagram.getAuthUrl.useQuery(
    { redirectUri: `${window.location.origin}/connect-social` },
    { enabled: false }
  );
  const igDisconnect = trpc.instagram.disconnect.useMutation({
    onSuccess: () => { toast.success("Instagram desconectado"); refetchIg(); },
    onError: (err) => toast.error(`Error: ${err.message}`),
  });
  const igRefresh = trpc.instagram.refreshFeed.useMutation({
    onSuccess: (data) => { toast.success(`Feed actualizado: ${data.postCount} posts`); refetchIg(); },
    onError: (err) => toast.error(`Error: ${err.message}`),
  });

  // Twitter - fixed callback URI must match Twitter Developer Portal exactly
  const TWITTER_CALLBACK_URI = "https://onlydjs-musi-zsqs9m2e.manus.space/connect-social";
  const twitterGetAuthUrl = trpc.twitter.getAuthUrl.useQuery(
    { redirectUri: TWITTER_CALLBACK_URI },
    { enabled: false }
  );
  const twitterDisconnect = trpc.twitter.disconnectTwitter.useMutation({
    onSuccess: () => { toast.success("Twitter/X desconectado"); refetchTwitter(); },
    onError: (err) => toast.error(`Error: ${err.message}`),
  });
  const twitterRefresh = trpc.twitter.refreshFeed.useMutation({
    onSuccess: () => { toast.success("Feed de Twitter actualizado"); refetchTwitter(); },
    onError: (err) => toast.error(`Error: ${err.message}`),
  });

  // TikTok
  const TIKTOK_CALLBACK_URI = `${window.location.origin}/connect-social`;
  const tiktokGetAuthUrl = trpc.tiktok.getAuthUrl.useQuery(
    { redirectUri: TIKTOK_CALLBACK_URI },
    { enabled: false }
  );
  const tiktokDisconnect = trpc.tiktok.disconnectTikTok.useMutation({
    onSuccess: () => { toast.success("TikTok desconectado"); refetchTikTok(); },
    onError: (err) => toast.error(`Error: ${err.message}`),
  });

  const handleConnectTikTok = async () => {
    try {
      const result = await tiktokGetAuthUrl.refetch();
      if (result.data?.authUrl) {
        window.location.href = result.data.authUrl;
      } else {
        toast.error("TikTok no está configurado aún. Agrega TIKTOK_CLIENT_KEY y TIKTOK_CLIENT_SECRET en Settings → Secrets.");
      }
    } catch (err: any) {
      toast.error(err.message || "Error al iniciar la conexión con TikTok");
    }
  };

  // Threads
  const threadsGetAuthUrl = trpc.threads.getAuthUrl.useQuery(
    { redirectUri: `${window.location.origin}/connect-social` },
    { enabled: false }
  );
  const threadsDisconnect = trpc.threads.disconnect.useMutation({
    onSuccess: () => { toast.success("Threads desconectado"); refetchThreads(); },
    onError: (err) => toast.error(`Error: ${err.message}`),
  });
  const threadsRefresh = trpc.threads.refreshFeed.useMutation({
    onSuccess: (data) => { toast.success(`Feed actualizado: ${data.postCount} posts`); refetchThreads(); },
    onError: (err) => toast.error(`Error: ${err.message}`),
  });

  const instagramConnection = igConnections?.find(c => c.platform === "instagram" && c.isActive);

  const handleConnectInstagram = async () => {
    try {
      const result = await igGetAuthUrl.refetch();
      if (result.data?.url) {
        // Append state=instagram for CSRF protection and callback identification
        const url = new URL(result.data.url);
        url.searchParams.set("state", "instagram");
        window.location.href = url.toString();
      } else {
        toast.error("No se pudo obtener el enlace de autorización de Instagram.");
      }
    } catch (err: any) {
      toast.error(err.message || "Error al iniciar la conexión con Instagram");
    }
  };

  const handleConnectTwitter = async () => {
    try {
      const result = await twitterGetAuthUrl.refetch();
      if (result.data?.authUrl) {
        window.location.href = result.data.authUrl;
      } else {
        toast.error("No se pudo obtener el enlace de autorización de Twitter.");
      }
    } catch (err: any) {
      toast.error(err.message || "Error al iniciar la conexión con Twitter");
    }
  };

  const handleConnectThreads = async () => {
    try {
      const result = await threadsGetAuthUrl.refetch();
      if (result.data?.url) {
        window.location.href = result.data.url;
      } else {
        toast.error("No se pudo obtener el enlace de autorización de Threads.");
      }
    } catch (err: any) {
      toast.error(err.message || "Error al iniciar la conexión con Threads");
    }
  };

  // While auth is loading (e.g. returning from OAuth redirect), show spinner
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Check if we have OAuth callback params — if so, redirect to login then back
    const params = new URLSearchParams(window.location.search);
    const hasOAuthCallback = params.has("code") || params.has("state");
    if (hasOAuthCallback) {
      // Store the full callback URL so we can resume after login
      sessionStorage.setItem("oauth_callback_url", window.location.href);
      window.location.href = "/";
      return null;
    }
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Debes iniciar sesión para acceder a esta sección.</p>
      </div>
    );
  }

  const isProcessingCallback = isProcessingInstagram || isProcessingThreads || isProcessingTwitter;

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
            <p className="text-sm font-medium">Conectando tu cuenta...</p>
          </div>
        )}

        {/* Info banner */}
        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-1">¿Cómo funciona?</p>
            <p className="text-xs text-muted-foreground">
              Al conectar Instagram o Threads, tus últimos 9 posts aparecerán automáticamente en tu perfil público.
              El feed se actualiza cada hora. Los tokens se renuevan automáticamente cada 60 días.
            </p>
          </div>
        </div>

        {/* Platform cards */}
        <div className="grid gap-4">
          {/* Instagram */}
          <PlatformCard
            platform="instagram"
            icon={<Instagram className="w-5 h-5" />}
            name="Instagram"
            description="Muestra tus últimos 9 posts en tu perfil"
            accentColor="from-purple-500 via-pink-500 to-orange-400"
            connection={instagramConnection ? {
              platformUsername: instagramConnection.platformUsername,
              profilePictureUrl: instagramConnection.profilePictureUrl,
              followerCount: instagramConnection.followerCount,
              isActive: instagramConnection.isActive,
              lastSyncAt: instagramConnection.lastSyncAt,
              tokenExpiresAt: instagramConnection.tokenExpiresAt,
            } : null}
            onConnect={handleConnectInstagram}
            onDisconnect={() => igDisconnect.mutate({ platform: "instagram" })}
            onRefresh={() => igRefresh.mutate()}
            isConnecting={igGetAuthUrl.isFetching}
            isDisconnecting={igDisconnect.isPending}
            isRefreshing={igRefresh.isPending}
          />

          {/* Threads */}
          <PlatformCard
            platform="threads"
            icon={<ThreadsIcon className="w-5 h-5" />}
            name="Threads"
            description="Muestra tus últimos posts de Threads en tu perfil"
            accentColor="from-gray-700 via-gray-600 to-gray-500"
            connection={threadsConnection?.isActive ? {
              platformUsername: threadsConnection.platformUsername,
              profilePictureUrl: threadsConnection.profilePictureUrl,
              followerCount: threadsConnection.followerCount,
              isActive: threadsConnection.isActive,
              lastSyncAt: threadsConnection.lastSyncAt,
              tokenExpiresAt: threadsConnection.tokenExpiresAt,
            } : null}
            onConnect={handleConnectThreads}
            onDisconnect={() => threadsDisconnect.mutate()}
            onRefresh={() => threadsRefresh.mutate()}
            isConnecting={threadsGetAuthUrl.isFetching}
            isDisconnecting={threadsDisconnect.isPending}
            isRefreshing={threadsRefresh.isPending}
          />

          {/* Twitter/X */}
          <PlatformCard
            platform="instagram"
            icon={<Twitter className="w-5 h-5" />}
            name="Twitter / X"
            description="Muestra tus últimos tweets en tu perfil"
            accentColor="from-sky-500 to-blue-600"
            connection={twitterConnection?.twitter ? {
              platformUsername: twitterConnection.twitter.username,
              profilePictureUrl: twitterConnection.twitter.profilePicture,
              followerCount: twitterConnection.twitter.followers,
              isActive: true,
              lastSyncAt: twitterConnection.twitter.lastSync,
            } : null}
            onConnect={handleConnectTwitter}
            onDisconnect={() => twitterDisconnect.mutate()}
            onRefresh={() => twitterRefresh.mutate()}
            isConnecting={twitterGetAuthUrl.isFetching || isProcessingTwitter}
            isDisconnecting={twitterDisconnect.isPending}
            isRefreshing={twitterRefresh.isPending}
          />

          {/* TikTok */}
          <PlatformCard
            platform="instagram"
            icon={<TikTokIcon className="w-5 h-5" />}
            name="TikTok"
            description="Muestra tu perfil de TikTok en tu página de artista"
            accentColor="from-[#010101] via-[#69C9D0] to-[#EE1D52]"
            connection={tiktokConnection?.tiktok ? {
              platformUsername: tiktokConnection.tiktok.username,
              profilePictureUrl: tiktokConnection.tiktok.profilePicture,
              followerCount: tiktokConnection.tiktok.followers,
              isActive: true,
              lastSyncAt: tiktokConnection.tiktok.connectedAt,
            } : null}
            onConnect={handleConnectTikTok}
            onDisconnect={() => tiktokDisconnect.mutate()}
            isConnecting={tiktokGetAuthUrl.isFetching || connectTikTok.isPending}
            isDisconnecting={tiktokDisconnect.isPending}
          />

          {/* Facebook - Coming soon */}
          <PlatformCard
            platform="facebook"
            icon={<Facebook className="w-5 h-5" />}
            name="Facebook Page"
            description="Conecta tu página de Facebook para mostrar tus publicaciones"
            accentColor="from-blue-600 to-blue-500"
            connection={null}
            onConnect={() => toast.info("Facebook estará disponible próximamente")}
            onDisconnect={() => {}}
            comingSoon
          />
        </div>

        {/* Requirements note */}
        <div className="mt-8 p-4 rounded-xl bg-muted/30 border border-border/50">
          <p className="text-xs text-muted-foreground font-medium mb-2">Requisitos para Instagram y Threads</p>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Instagram: tu cuenta debe ser <strong>cuenta de creador o empresa</strong> (no personal)</li>
            <li>Threads: cualquier cuenta pública de Threads es compatible</li>
            <li>Ambas plataformas requieren una <strong>Meta App</strong> configurada con los permisos correctos</li>
            <li>Los tokens de acceso se renuevan automáticamente cada 60 días</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-3">
            Agrega el Redirect URI en tu Meta App:{" "}
            <code className="bg-muted px-1 rounded">{window.location.origin}/connect-social</code>
          </p>
        </div>
      </div>
    </div>
  );
}
