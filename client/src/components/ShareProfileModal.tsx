import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Download,
  Twitter,
  Copy,
  Loader2,
  CheckCircle2,
  Share2,
  Instagram,
} from "lucide-react";

const ODJS_LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663313258514/ZSqS9M2EFeWUjrPvMV6QuC/odjs-logo-holographic_f6c80f68.png";

// ── Tarjeta Square (1:1) para Twitter / Instagram Feed ─────────────────────
function ProfileCardSquare({ profile }: { profile: any }) {
  const displayName = profile?.djName || profile?.name || profile?.username || "DJ";
  const username = profile?.username || "";
  const bio = profile?.bio || "DJ & Music Producer on ONLYDJS Platform";
  const avatar = profile?.profileImageUrl || profile?.avatarUrl || "";
  const followers = profile?.followersCount ?? profile?.followers ?? 0;
  const trackCount = profile?.trackCount ?? 0;
  const genre = profile?.genre || "";

  return (
    <div
      id="share-profile-square"
      style={{
        width: 540,
        height: 540,
        background:
          "linear-gradient(135deg, #07070f 0%, #0d0d2a 50%, #07070f 100%)",
        borderRadius: 24,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* Glow top-left */}
      <div
        style={{
          position: "absolute",
          top: -100,
          left: -100,
          width: 350,
          height: 350,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      {/* Glow bottom-right */}
      <div
        style={{
          position: "absolute",
          bottom: -80,
          right: -80,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "22px 28px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src={ODJS_LOGO_URL}
            alt="ODJS"
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid rgba(6,182,212,0.5)",
            }}
            crossOrigin="anonymous"
          />
          <div>
            <div
              style={{
                color: "#06b6d4",
                fontWeight: 800,
                fontSize: 12,
                letterSpacing: 1,
              }}
            >
              ODJS SOCIAL
            </div>
            <div style={{ color: "#475569", fontSize: 9 }}>onlydjss.com</div>
          </div>
        </div>
        <div
          style={{
            background:
              "linear-gradient(90deg, rgba(6,182,212,0.15), rgba(168,85,247,0.15))",
            border: "1px solid rgba(6,182,212,0.3)",
            borderRadius: 20,
            padding: "4px 12px",
            color: "#06b6d4",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 0.5,
          }}
        >
          ⚡ DJ PROFILE
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "28px 36px",
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            border: "3px solid rgba(6,182,212,0.6)",
            overflow: "hidden",
            background: "linear-gradient(135deg, #06b6d4, #a855f7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            
          }}
        >
          {avatar ? (
            <img
              src={avatar}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              crossOrigin="anonymous"
            />
          ) : (
            <span
              style={{ color: "white", fontWeight: 800, fontSize: 40 }}
            >
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Name */}
        <div
          style={{
            color: "white",
            fontWeight: 800,
            fontSize: 26,
            marginBottom: 4,
            textAlign: "center",
          }}
        >
          {displayName}
        </div>
        <div
          style={{
            color: "#64748b",
            fontSize: 14,
            marginBottom: genre ? 6 : 14,
          }}
        >
          @{username}
        </div>
        {genre && (
          <div
            style={{
              background: "rgba(6,182,212,0.12)",
              border: "1px solid rgba(6,182,212,0.3)",
              borderRadius: 20,
              padding: "3px 12px",
              color: "#06b6d4",
              fontSize: 11,
              fontWeight: 600,
              marginBottom: 14,
            }}
          >
            {genre}
          </div>
        )}

        {/* Bio */}
        {bio && (
          <div
            style={{
              color: "#94a3b8",
              fontSize: 13,
              lineHeight: 1.6,
              textAlign: "center",
              maxWidth: 380,
              marginBottom: 22,
            }}
          >
            {bio.length > 120 ? bio.slice(0, 117) + "..." : bio}
          </div>
        )}

        {/* Divider */}
        <div
          style={{
            height: 1,
            width: "100%",
            background:
              "linear-gradient(90deg, transparent, rgba(6,182,212,0.4), rgba(168,85,247,0.4), transparent)",
            marginBottom: 20,
          }}
        />

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: 40,
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                color: "white",
                fontWeight: 800,
                fontSize: 22,
                lineHeight: 1,
              }}
            >
              {followers >= 1000
                ? `${(followers / 1000).toFixed(1)}K`
                : followers}
            </div>
            <div style={{ color: "#64748b", fontSize: 11, marginTop: 3 }}>
              Followers
            </div>
          </div>
          <div
            style={{
              width: 1,
              background: "rgba(255,255,255,0.07)",
              alignSelf: "stretch",
            }}
          />
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                color: "white",
                fontWeight: 800,
                fontSize: 22,
                lineHeight: 1,
              }}
            >
              {trackCount}
            </div>
            <div style={{ color: "#64748b", fontSize: 11, marginTop: 3 }}>
              Tracks
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 28px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ color: "#334155", fontSize: 11 }}>
          onlydjss.com/@{username}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img
            src={ODJS_LOGO_URL}
            alt="ODJS"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid rgba(6,182,212,0.4)",
            }}
            crossOrigin="anonymous"
          />
          <div>
            <div
              style={{
                color: "#94a3b8",
                fontWeight: 800,
                fontSize: 10,
                letterSpacing: 0.5,
              }}
            >
              ONLYDJS
            </div>
            <div style={{ color: "#475569", fontSize: 9 }}>PLATFORM</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tarjeta Story (9:16) para Instagram Stories / TikTok ──────────────────
function ProfileCardStory({ profile }: { profile: any }) {
  const displayName = profile?.djName || profile?.name || profile?.username || "DJ";
  const username = profile?.username || "";
  const bio = profile?.bio || "DJ & Music Producer on ONLYDJS Platform";
  const avatar = profile?.profileImageUrl || profile?.avatarUrl || "";
  const followers = profile?.followersCount ?? profile?.followers ?? 0;
  const trackCount = profile?.trackCount ?? 0;
  const genre = profile?.genre || "";

  return (
    <div
      id="share-profile-story"
      style={{
        width: 360,
        height: 640,
        background:
          "linear-gradient(160deg, #07070f 0%, #0d0d2a 40%, #120820 70%, #07070f 100%)",
        borderRadius: 24,
        padding: 32,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* Glows */}
      <div
        style={{
          position: "absolute",
          top: -100,
          left: -100,
          width: 350,
          height: 350,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -80,
          right: -80,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img
          src={ODJS_LOGO_URL}
          alt="ODJS"
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid rgba(6,182,212,0.5)",
          }}
          crossOrigin="anonymous"
        />
        <div>
          <div
            style={{
              color: "#06b6d4",
              fontWeight: 800,
              fontSize: 13,
              letterSpacing: 1,
            }}
          >
            ODJS SOCIAL
          </div>
          <div style={{ color: "#64748b", fontSize: 10 }}>onlydjss.com</div>
        </div>
      </div>

      {/* Center */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 0",
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: "50%",
            border: "3px solid rgba(6,182,212,0.6)",
            overflow: "hidden",
            background: "linear-gradient(135deg, #06b6d4, #a855f7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 18,
            
          }}
        >
          {avatar ? (
            <img
              src={avatar}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              crossOrigin="anonymous"
            />
          ) : (
            <span
              style={{ color: "white", fontWeight: 800, fontSize: 44 }}
            >
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div
          style={{
            color: "white",
            fontWeight: 800,
            fontSize: 24,
            marginBottom: 4,
            textAlign: "center",
          }}
        >
          {displayName}
        </div>
        <div style={{ color: "#64748b", fontSize: 13, marginBottom: 10 }}>
          @{username}
        </div>
        {genre && (
          <div
            style={{
              background: "rgba(6,182,212,0.12)",
              border: "1px solid rgba(6,182,212,0.3)",
              borderRadius: 20,
              padding: "3px 12px",
              color: "#06b6d4",
              fontSize: 11,
              fontWeight: 600,
              marginBottom: 14,
            }}
          >
            {genre}
          </div>
        )}

        {bio && (
          <div
            style={{
              color: "#94a3b8",
              fontSize: 13,
              lineHeight: 1.6,
              textAlign: "center",
              maxWidth: 280,
              marginBottom: 22,
            }}
          >
            {bio.length > 100 ? bio.slice(0, 97) + "..." : bio}
          </div>
        )}

        <div
          style={{
            height: 1,
            width: "100%",
            background:
              "linear-gradient(90deg, transparent, rgba(6,182,212,0.4), rgba(168,85,247,0.4), transparent)",
            marginBottom: 20,
          }}
        />

        {/* Stats */}
        <div style={{ display: "flex", gap: 36, justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                color: "white",
                fontWeight: 800,
                fontSize: 24,
                lineHeight: 1,
              }}
            >
              {followers >= 1000
                ? `${(followers / 1000).toFixed(1)}K`
                : followers}
            </div>
            <div style={{ color: "#64748b", fontSize: 11, marginTop: 3 }}>
              Followers
            </div>
          </div>
          <div
            style={{
              width: 1,
              background: "rgba(255,255,255,0.07)",
              alignSelf: "stretch",
            }}
          />
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                color: "white",
                fontWeight: 800,
                fontSize: 24,
                lineHeight: 1,
              }}
            >
              {trackCount}
            </div>
            <div style={{ color: "#64748b", fontSize: 11, marginTop: 3 }}>
              Tracks
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          borderTop: "1px solid rgba(255,255,255,0.05)",
          paddingTop: 16,
        }}
      >
        <img
          src={ODJS_LOGO_URL}
          alt="ODJS"
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid rgba(6,182,212,0.4)",
          }}
          crossOrigin="anonymous"
        />
        <div>
          <div
            style={{
              color: "#94a3b8",
              fontWeight: 800,
              fontSize: 11,
              letterSpacing: 0.5,
            }}
          >
            ONLYDJS PLATFORM
          </div>
          <div style={{ color: "#475569", fontSize: 10, textAlign: "center" }}>
            onlydjss.com
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Modal principal ────────────────────────────────────────────────────────
interface ShareProfileModalProps {
  profile: any;
  open: boolean;
  onClose: () => void;
}

export function ShareProfileModal({
  profile,
  open,
  onClose,
}: ShareProfileModalProps) {
  const [format, setFormat] = useState<"square" | "story">("square");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const username = profile?.username || "";
  const displayName = profile?.djName || profile?.name || username || "DJ";

  const handleDownload = useCallback(
    async (fmt: "square" | "story") => {
      setGenerating(true);
      try {
        const html2canvas = (await import("html2canvas")).default;
        const cardId =
          fmt === "square" ? "share-profile-square" : "share-profile-story";
        const el = document.getElementById(cardId);
        if (!el) {
          toast.error("Card not found");
          return;
        }
        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          logging: false,
        });
        const link = document.createElement("a");
        link.download = `odjs-profile-${username}-${fmt}-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        toast.success(
          `Profile card downloaded (${fmt === "square" ? "1:1 for Twitter/Feed" : "9:16 for Stories"})`
        );
      } catch (err) {
        toast.error("Failed to generate image");
        console.error(err);
      } finally {
        setGenerating(false);
      }
    },
    [username]
  );

  const handleTwitterShare = useCallback(() => {
    const bio = profile?.bio ? ` · ${profile.bio.slice(0, 80)}` : "";
    const text = encodeURIComponent(
      `🎧 Check out ${displayName} on ONLYDJS${bio}\n\n#ONLYDJS #DJ #ElectronicMusic`
    );
    const url = encodeURIComponent(`https://www.onlydjss.com/${username}`);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank"
    );
  }, [profile, displayName, username]);

  const handleCopyLink = useCallback(async () => {
    const url = `${window.location.origin}/${username}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Profile link copied!");
    setTimeout(() => setCopied(false), 2000);
  }, [username]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#07070f] border border-cyan-500/20 text-white p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/5">
          <DialogTitle className="flex items-center gap-2 text-white">
            <Share2 className="w-5 h-5 text-cyan-400" />
            Share DJ Profile
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          {/* Format selector */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFormat("square")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                format === "square"
                  ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                  : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
              }`}
            >
              📐 Square (1:1)
              <span className="block text-[10px] font-normal opacity-70 mt-0.5">
                Twitter · Instagram Feed
              </span>
            </button>
            <button
              onClick={() => setFormat("story")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                format === "story"
                  ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                  : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
              }`}
            >
              📱 Story (9:16)
              <span className="block text-[10px] font-normal opacity-70 mt-0.5">
                Instagram Stories · TikTok
              </span>
            </button>
          </div>

          {/* Card preview */}
          <div
            className="flex justify-center mb-6 overflow-hidden"
          >
            <div
              className="transform scale-[0.55] origin-top"
              style={{ height: format === "square" ? 297 : 352 }}
            >
              {format === "square" ? (
                <ProfileCardSquare profile={profile} />
              ) : (
                <ProfileCardStory profile={profile} />
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Button
              onClick={() => handleDownload(format)}
              disabled={generating}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold rounded-xl h-11"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download Image
                </>
              )}
            </Button>
            <Button
              onClick={handleTwitterShare}
              variant="outline"
              className="border-sky-500/40 text-sky-400 hover:bg-sky-500/10 rounded-xl h-11 bg-transparent"
            >
              <Twitter className="w-4 h-4 mr-2" />
              Share on Twitter
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => {
                toast(
                  "Download the image first, then upload to Instagram Stories or Feed"
                );
              }}
              variant="outline"
              className="border-pink-500/40 text-pink-400 hover:bg-pink-500/10 rounded-xl h-11 bg-transparent"
            >
              <Instagram className="w-4 h-4 mr-2" />
              Instagram Guide
            </Button>
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="border-white/20 text-slate-400 hover:bg-white/10 rounded-xl h-11 bg-transparent"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Profile Link
                </>
              )}
            </Button>
          </div>

          <p className="text-slate-600 text-xs text-center mt-4">
            Download the image and share it on Instagram, TikTok, Twitter or any
            platform to grow your audience
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
