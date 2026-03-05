import { useRef, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, Instagram, Twitter, Copy, Loader2, CheckCircle2, Zap } from "lucide-react";

const ODJS_LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663313258514/ZSqS9M2EFeWUjrPvMV6QuC/odjs-thumbnail-1200x630_fdb7b444.png";

// ── Background themes ──────────────────────────────────────────────────────
type BgTheme = "dark" | "purple" | "cyan" | "gold";

const BG_THEMES: Record<BgTheme, { label: string; color: string; bg: string; accent: string; textColor: string }> = {
  dark: {
    label: "Dark",
    color: "#07070f",
    bg: "linear-gradient(135deg, #07070f 0%, #0d0d2a 50%, #07070f 100%)",
    accent: "#06b6d4",
    textColor: "#e2e8f0",
  },
  purple: {
    label: "Purple",
    color: "#1a0a2e",
    bg: "linear-gradient(135deg, #0f0520 0%, #1a0a2e 40%, #2d1060 70%, #1a0a2e 100%)",
    accent: "#a855f7",
    textColor: "#f3e8ff",
  },
  cyan: {
    label: "Cyan",
    color: "#001a2e",
    bg: "linear-gradient(135deg, #001020 0%, #001a2e 40%, #003a5c 70%, #001a2e 100%)",
    accent: "#06b6d4",
    textColor: "#e0f7ff",
  },
  gold: {
    label: "Gold",
    color: "#1a1200",
    bg: "linear-gradient(135deg, #0f0a00 0%, #1a1200 40%, #2e2000 70%, #1a1200 100%)",
    accent: "#f59e0b",
    textColor: "#fef3c7",
  },
};

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
      weekday: "short", month: "short", day: "numeric", year: "numeric",
    });
  } catch {
    return "";
  }
}

// ── Tarjeta Square (1:1) ───────────────────────────────────────────────────
function ShareCardSquare({ post, theme }: { post: any; theme: BgTheme }) {
  const t = BG_THEMES[theme];
  return (
    <div
      id="share-card-square"
      style={{
        width: 540, height: 540,
        background: t.bg,
        borderRadius: 24, padding: 36,
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        position: "relative", overflow: "hidden",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* Subtle glow orbs */}
      <div style={{
        position: "absolute", top: -80, left: -80, width: 300, height: 300, borderRadius: "50%",
        background: `radial-gradient(circle, ${t.accent}22 0%, transparent 70%)`, pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -60, right: -60, width: 280, height: 280, borderRadius: "50%",
        background: `radial-gradient(circle, ${t.accent}18 0%, transparent 70%)`, pointerEvents: "none",
      }} />

      {/* Top header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <img src={ODJS_LOGO_URL} alt="ODJS"
          style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.15)" }}
          crossOrigin="anonymous"
        />
        <div>
          <div style={{ color: t.accent, fontWeight: 800, fontSize: 14, letterSpacing: 1.5 }}>ODJS SOCIAL</div>
          <div style={{ color: "#64748b", fontSize: 10 }}>onlydjss.com</div>
        </div>
        <div style={{
          marginLeft: "auto",
          background: `${t.accent}22`,
          border: `1px solid ${t.accent}44`,
          borderRadius: 20, padding: "4px 12px",
          color: t.accent, fontSize: 10, fontWeight: 700, letterSpacing: 1,
        }}>
          ⚡ ONLYDJS PLATFORM
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: `linear-gradient(90deg, ${t.accent}44, ${t.accent}22, transparent)`, marginBottom: 20 }} />

      {/* DJ Info */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          border: `2px solid ${t.accent}66`,
          overflow: "hidden", flexShrink: 0,
          background: "linear-gradient(135deg, #06b6d4, #a855f7)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {getAvatar(post) ? (
            <img src={getAvatar(post)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
          ) : (
            <span style={{ color: "white", fontWeight: 800, fontSize: 20 }}>{getDisplayName(post).charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: t.textColor, fontWeight: 700, fontSize: 16 }}>{getDisplayName(post)}</span>
            {post.isVerified && <span style={{ color: t.accent, fontSize: 14 }}>✓</span>}
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
        flex: 1, color: t.textColor, fontSize: 17, lineHeight: 1.65,
        fontWeight: 400, wordBreak: "break-word", overflow: "hidden", marginBottom: 18,
      }}>
        {post.content?.length > 280 ? post.content.slice(0, 277) + "..." : post.content}
      </div>

      {/* Hashtags */}
      {post.hashtags && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
          {post.hashtags.split(/[\s,]+/).filter(Boolean).slice(0, 5).map((tag: string, i: number) => (
            <span key={i} style={{ color: t.accent, fontSize: 13, fontWeight: 600 }}>
              {tag.startsWith("#") ? tag : `#${tag}`}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "flex", gap: 20, marginBottom: 18, color: "#64748b", fontSize: 13 }}>
        <span>💬 {post.commentCount || 0}</span>
        <span>🔁 {post.repostCount || 0}</span>
        <span>❤️ {post.likeCount || 0}</span>
      </div>

      {/* Footer watermark */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 16,
      }}>
        <div style={{ color: "#334155", fontSize: 11 }}>onlydjss.com/@{post.username}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={ODJS_LOGO_URL} alt="ODJS"
            style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.15)" }}
            crossOrigin="anonymous"
          />
          <div>
            <div style={{ color: t.textColor, fontWeight: 900, fontSize: 13, letterSpacing: 1.5 }}>ONLYDJS</div>
            <div style={{ color: "#64748b", fontSize: 10, letterSpacing: 1 }}>PLATFORM</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tarjeta Story (9:16) ───────────────────────────────────────────────────
function ShareCardStory({ post, theme }: { post: any; theme: BgTheme }) {
  const t = BG_THEMES[theme];
  return (
    <div
      id="share-card-story"
      style={{
        width: 360, height: 640,
        background: t.bg,
        borderRadius: 24, padding: 32,
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        position: "relative", overflow: "hidden",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      <div style={{
        position: "absolute", top: -100, left: -100, width: 350, height: 350, borderRadius: "50%",
        background: `radial-gradient(circle, ${t.accent}22 0%, transparent 70%)`, pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -80, right: -80, width: 300, height: 300, borderRadius: "50%",
        background: `radial-gradient(circle, ${t.accent}18 0%, transparent 70%)`, pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img src={ODJS_LOGO_URL} alt="ODJS"
          style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.15)" }}
          crossOrigin="anonymous"
        />
        <div>
          <div style={{ color: t.accent, fontWeight: 800, fontSize: 15, letterSpacing: 1.5 }}>ODJS SOCIAL</div>
          <div style={{ color: "#64748b", fontSize: 11 }}>onlydjss.com</div>
        </div>
      </div>

      {/* Center */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "24px 0" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            border: `3px solid ${t.accent}88`,
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
            <span style={{ color: t.textColor, fontWeight: 700, fontSize: 18 }}>{getDisplayName(post)}</span>
            {post.isVerified && <span style={{ color: t.accent }}>✓</span>}
          </div>
          <div style={{ color: "#64748b", fontSize: 13 }}>@{post.username}</div>
          <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>
            {formatExactTime(post.createdAt)} · {formatFullDate(post.createdAt)}
          </div>
        </div>

        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${t.accent}44, ${t.accent}22, transparent)`, marginBottom: 24 }} />

        <div style={{ color: t.textColor, fontSize: 16, lineHeight: 1.7, textAlign: "center", wordBreak: "break-word", marginBottom: 16 }}>
          {post.content?.length > 200 ? post.content.slice(0, 197) + "..." : post.content}
        </div>

        {post.hashtags && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 16 }}>
            {post.hashtags.split(/[\s,]+/).filter(Boolean).slice(0, 4).map((tag: string, i: number) => (
              <span key={i} style={{ color: t.accent, fontSize: 13, fontWeight: 600 }}>
                {tag.startsWith("#") ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 20, justifyContent: "center", color: "#64748b", fontSize: 13 }}>
          <span>💬 {post.commentCount || 0}</span>
          <span>🔁 {post.repostCount || 0}</span>
          <span>❤️ {post.likeCount || 0}</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
        borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 16,
      }}>
        <img src={ODJS_LOGO_URL} alt="ODJS"
          style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.15)" }}
          crossOrigin="anonymous"
        />
        <div>
          <div style={{ color: t.textColor, fontWeight: 900, fontSize: 14, letterSpacing: 1.5 }}>ONLYDJS PLATFORM</div>
          <div style={{ color: "#64748b", fontSize: 11, textAlign: "center" }}>onlydjss.com</div>
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
  const [theme, setTheme] = useState<BgTheme>("dark");
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
        scale: 2, useCORS: true, allowTaint: true, backgroundColor: null, logging: false,
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
          <div className="flex gap-2 mb-4">
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

          {/* Background theme selector */}
          <div className="mb-4">
            <p className="text-slate-400 text-xs mb-2 font-medium tracking-wide">Card Background</p>
            <div className="flex gap-2">
              {(Object.entries(BG_THEMES) as [BgTheme, typeof BG_THEMES[BgTheme]][]).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all border ${
                    theme === key
                      ? "border-white/40 text-white"
                      : "border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300"
                  }`}
                  style={{
                    background: val.bg,
                    outline: theme === key ? `2px solid ${val.accent}` : "none",
                    outlineOffset: 1,
                  }}
                >
                  <span style={{ color: val.accent }}>■</span> {val.label}
                </button>
              ))}
            </div>
          </div>

          {/* Card preview */}
          <div className="flex justify-center mb-6 overflow-hidden">
            <div className="transform scale-[0.55] origin-top" style={{ height: format === "square" ? 297 : 352 }}>
              {format === "square" ? (
                <ShareCardSquare post={post} theme={theme} />
              ) : (
                <ShareCardStory post={post} theme={theme} />
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
              onClick={() => toast("Download the image first, then upload to Instagram Stories or Feed")}
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
