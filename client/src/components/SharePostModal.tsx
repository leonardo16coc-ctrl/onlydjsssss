import { useRef, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Download, Instagram, Twitter, Copy, Loader2, CheckCircle2, Zap } from "lucide-react";

const ODJS_LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663313258514/ZSqS9M2EFeWUjrPvMV6QuC/odjs-logo_6f8aebf9.jpg";

function getAvatar(u: any) {
  return u?.profileImageUrl || u?.avatarUrl || "";
}
function getDisplayName(u: any) {
  return u?.djName || u?.name || u?.username || "DJ";
}
function formatExactTime(ts: number) {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}
function formatFullDate(ts: number) {
  try {
    return new Date(ts).toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

// ── Tarjeta visual que se captura como imagen ──────────────────────────────
function ShareCardSquare({ post }: { post: any }) {
  return (
    <div
      id="share-card-square"
      style={{
        width: 540,
        height: 540,
        background: "linear-gradient(135deg, #07070f 0%, #0d0d2a 50%, #07070f 100%)",
        borderRadius: 24,
        padding: 36,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* Background glow effects */}
      <div style={{
        position: "absolute", top: -80, left: -80,
        width: 300, height: 300,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -60, right: -60,
        width: 280, height: 280,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Top: ODJS Social header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <img
          src={ODJS_LOGO_URL}
          alt="ODJS"
          style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(6,182,212,0.5)" }}
          crossOrigin="anonymous"
        />
        <div>
          <div style={{ color: "#06b6d4", fontWeight: 800, fontSize: 13, letterSpacing: 1 }}>ODJS SOCIAL</div>
          <div style={{ color: "#64748b", fontSize: 10 }}>onlydjss.com</div>
        </div>
        <div style={{
          marginLeft: "auto",
          background: "linear-gradient(90deg, rgba(6,182,212,0.15), rgba(168,85,247,0.15))",
          border: "1px solid rgba(6,182,212,0.3)",
          borderRadius: 20,
          padding: "3px 10px",
          color: "#06b6d4",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1,
        }}>
          ⚡ ONLYDJS PLATFORM
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "linear-gradient(90deg, rgba(6,182,212,0.3), rgba(168,85,247,0.3), transparent)", marginBottom: 20 }} />

      {/* DJ Info */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          border: "2px solid rgba(6,182,212,0.5)",
          overflow: "hidden", flexShrink: 0,
          background: "linear-gradient(135deg, #06b6d4, #a855f7)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {getAvatar(post) ? (
            <img src={getAvatar(post)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
          ) : (
            <span style={{ color: "white", fontWeight: 800, fontSize: 20 }}>
              {getDisplayName(post).charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "white", fontWeight: 700, fontSize: 16 }}>{getDisplayName(post)}</span>
            {post.isVerified && (
              <span style={{ color: "#06b6d4", fontSize: 14 }}>✓</span>
            )}
          </div>
          <div style={{ color: "#64748b", fontSize: 12 }}>@{post.username}</div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>{formatExactTime(post.createdAt)}</div>
          <div style={{ color: "#475569", fontSize: 10 }}>{formatFullDate(post.createdAt)}</div>
        </div>
      </div>

      {/* Post content */}
      <div style={{
        flex: 1,
        color: "#e2e8f0",
        fontSize: 17,
        lineHeight: 1.65,
        fontWeight: 400,
        wordBreak: "break-word",
        overflow: "hidden",
        marginBottom: 18,
      }}>
        {post.content?.length > 280 ? post.content.slice(0, 277) + "..." : post.content}
      </div>

      {/* Hashtags */}
      {post.hashtags && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
          {post.hashtags.split(/[\s,]+/).filter(Boolean).slice(0, 5).map((tag: string, i: number) => (
            <span key={i} style={{ color: "#06b6d4", fontSize: 13, fontWeight: 600 }}>
              {tag.startsWith("#") ? tag : `#${tag}`}
            </span>
          ))}
        </div>
      )}

      {/* Stats row */}
      <div style={{
        display: "flex", gap: 20, marginBottom: 18,
        color: "#64748b", fontSize: 13,
      }}>
        <span>💬 {post.commentCount || 0}</span>
        <span>🔁 {post.repostCount || 0}</span>
        <span>❤️ {post.likeCount || 0}</span>
      </div>

      {/* Bottom: ODJS Logo watermark */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 16,
      }}>
        <div style={{ color: "#334155", fontSize: 11 }}>
          onlydjss.com/@{post.username}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img
            src={ODJS_LOGO_URL}
            alt="ODJS"
            style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(6,182,212,0.4)" }}
            crossOrigin="anonymous"
          />
          <div style={{ textAlign: "left" }}>
            <div style={{ color: "#94a3b8", fontWeight: 800, fontSize: 11, letterSpacing: 0.5 }}>ONLYDJS</div>
            <div style={{ color: "#475569", fontSize: 9 }}>PLATFORM</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tarjeta Stories (9:16) ─────────────────────────────────────────────────
function ShareCardStory({ post }: { post: any }) {
  return (
    <div
      id="share-card-story"
      style={{
        width: 360,
        height: 640,
        background: "linear-gradient(160deg, #07070f 0%, #0d0d2a 40%, #120820 70%, #07070f 100%)",
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
      {/* Glow effects */}
      <div style={{
        position: "absolute", top: -100, left: -100,
        width: 350, height: 350, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -80, right: -80,
        width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img src={ODJS_LOGO_URL} alt="ODJS" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(6,182,212,0.5)" }} crossOrigin="anonymous" />
        <div>
          <div style={{ color: "#06b6d4", fontWeight: 800, fontSize: 14, letterSpacing: 1 }}>ODJS SOCIAL</div>
          <div style={{ color: "#64748b", fontSize: 10 }}>onlydjss.com</div>
        </div>
      </div>

      {/* Center: DJ + content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "24px 0" }}>
        {/* Avatar large */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            border: "3px solid rgba(6,182,212,0.6)",
            overflow: "hidden",
            background: "linear-gradient(135deg, #06b6d4, #a855f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 12,
          }}>
            {getAvatar(post) ? (
              <img src={getAvatar(post)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
            ) : (
              <span style={{ color: "white", fontWeight: 800, fontSize: 32 }}>{getDisplayName(post).charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "white", fontWeight: 700, fontSize: 18 }}>{getDisplayName(post)}</span>
            {post.isVerified && <span style={{ color: "#06b6d4" }}>✓</span>}
          </div>
          <div style={{ color: "#64748b", fontSize: 13 }}>@{post.username}</div>
          <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>
            {formatExactTime(post.createdAt)} · {formatFullDate(post.createdAt)}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(6,182,212,0.4), rgba(168,85,247,0.4), transparent)", marginBottom: 24 }} />

        {/* Content */}
        <div style={{
          color: "#e2e8f0", fontSize: 16, lineHeight: 1.7,
          textAlign: "center", wordBreak: "break-word",
          marginBottom: 16,
        }}>
          {post.content?.length > 200 ? post.content.slice(0, 197) + "..." : post.content}
        </div>

        {/* Hashtags */}
        {post.hashtags && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 16 }}>
            {post.hashtags.split(/[\s,]+/).filter(Boolean).slice(0, 4).map((tag: string, i: number) => (
              <span key={i} style={{ color: "#06b6d4", fontSize: 13, fontWeight: 600 }}>
                {tag.startsWith("#") ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "flex", gap: 20, justifyContent: "center", color: "#64748b", fontSize: 13 }}>
          <span>💬 {post.commentCount || 0}</span>
          <span>🔁 {post.repostCount || 0}</span>
          <span>❤️ {post.likeCount || 0}</span>
        </div>
      </div>

      {/* Footer: ODJS logo */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 16,
      }}>
        <img src={ODJS_LOGO_URL} alt="ODJS" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(6,182,212,0.4)" }} crossOrigin="anonymous" />
        <div>
          <div style={{ color: "#94a3b8", fontWeight: 800, fontSize: 12, letterSpacing: 0.5 }}>ONLYDJS PLATFORM</div>
          <div style={{ color: "#475569", fontSize: 10, textAlign: "center" }}>onlydjss.com</div>
        </div>
      </div>
    </div>
  );
}

// ── Modal principal ────────────────────────────────────────────────────────
interface SharePostModalProps {
  post: any;
  open: boolean;
  onClose: () => void;
}

export function SharePostModal({ post, open, onClose }: SharePostModalProps) {
  const [format, setFormat] = useState<"square" | "story">("square");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownload = useCallback(async (fmt: "square" | "story") => {
    setGenerating(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const cardId = fmt === "square" ? "share-card-square" : "share-card-story";
      const el = document.getElementById(cardId);
      if (!el) { toast.error("Card not found"); return; }

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `odjs-post-${fmt}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success(`Image downloaded (${fmt === "square" ? "1:1 for Twitter/Feed" : "9:16 for Stories"})`);
    } catch (err) {
      toast.error("Failed to generate image");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  }, []);

  const handleCopyLink = useCallback(async () => {
    const url = `${window.location.origin}/${post.username}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Profile link copied!");
    setTimeout(() => setCopied(false), 2000);
  }, [post.username]);

  const handleTwitterShare = useCallback(() => {
    const text = encodeURIComponent(
      `${post.content?.slice(0, 200) || ""}\n\n${post.hashtags ? post.hashtags.split(/[\s,]+/).filter(Boolean).slice(0, 3).map((t: string) => t.startsWith("#") ? t : `#${t}`).join(" ") : ""}\n\n🎧 via @onlydjss`
    );
    const url = encodeURIComponent(`https://www.onlydjss.com/${post.username}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  }, [post]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#07070f] border border-cyan-500/20 text-white p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/5">
          <DialogTitle className="flex items-center gap-2 text-white">
            <Zap className="w-5 h-5 text-cyan-400" />
            Share on Social Media
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
              <span className="block text-[10px] font-normal opacity-70 mt-0.5">Twitter · Instagram Feed</span>
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
              <span className="block text-[10px] font-normal opacity-70 mt-0.5">Instagram Stories · TikTok</span>
            </button>
          </div>

          {/* Card preview */}
          <div className="flex justify-center mb-6 overflow-hidden">
            <div className="transform scale-[0.55] origin-top" style={{ height: format === "square" ? 297 : 352 }}>
              {format === "square" ? (
                <ShareCardSquare post={post} />
              ) : (
                <ShareCardStory post={post} />
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
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
              ) : (
                <><Download className="w-4 h-4 mr-2" />Download Image</>
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
                toast("Download the image first, then upload to Instagram Stories or Feed");
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
                <><CheckCircle2 className="w-4 h-4 mr-2 text-green-400" />Copied!</>
              ) : (
                <><Copy className="w-4 h-4 mr-2" />Copy Profile Link</>
              )}
            </Button>
          </div>

          <p className="text-slate-600 text-xs text-center mt-4">
            Download the image and share it directly on Instagram, TikTok or any platform
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
