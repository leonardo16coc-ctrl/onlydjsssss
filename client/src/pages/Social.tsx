import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Home, TrendingUp, Map, Swords, MessageCircle, User, Plus,
  Heart, Repeat2, MessageSquare, Bookmark, Image, Video, Music2,
  Hash, Send, MoreHorizontal, CheckCircle2, Flame, Zap, Radio, Share2,
  Search, Music, Mic2, FileText, X
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useSEO } from "@/hooks/useSEO";
import { formatDistanceToNow } from "date-fns";
import { SharePostModal } from "@/components/SharePostModal";

// ── helpers ────────────────────────────────────────────────────────────────
function timeAgo(ts: number) {
  try { return formatDistanceToNow(new Date(ts), { addSuffix: true }); }
  catch { return ""; }
}

function getAvatar(u: any) {
  return u?.profileImageUrl || u?.avatarUrl || "";
}

function getDisplayName(u: any) {
  return u?.djName || u?.name || u?.username || "DJ";
}

// ── Global Search Bar ────────────────────────────────────────────────────
function GlobalSearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isFetching } = trpc.social.globalSearch.useQuery(
    { query: query.trim() },
    { enabled: query.trim().length >= 2 }
  );

  const djs: any[] = data?.djs || [];
  const tracks: any[] = data?.tracks || [];
  const posts: any[] = data?.posts || [];
  const hasResults = djs.length > 0 || tracks.length > 0 || posts.length > 0;

  const handleClose = () => { setOpen(false); setQuery(""); };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search DJs, tracks, mixes, hashtags..."
          className="w-full bg-[#0d0d1a] border border-white/10 rounded-full pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
        />
        {query && (
          <button onClick={handleClose} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0d0d1a] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 z-50 overflow-hidden max-h-[480px] overflow-y-auto">
          {isFetching && (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            </div>
          )}

          {!isFetching && !hasResults && (
            <div className="py-8 text-center">
              <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No results for "{query}"</p>
            </div>
          )}

          {/* DJs */}
          {djs.length > 0 && (
            <div>
              <div className="px-4 py-2 border-b border-white/5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Mic2 className="w-3 h-3" /> DJs
                </span>
              </div>
              {djs.map((dj: any) => (
                <button key={dj.id} onClick={() => { navigate(`/${dj.username}`); handleClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={dj.profileImageUrl || dj.avatarUrl || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-xs">
                      {(dj.djName || dj.name || dj.username || "D").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{dj.djName || dj.name || dj.username}</p>
                    <p className="text-slate-500 text-xs">@{dj.username}{dj.genre ? ` · ${dj.genre}` : ""}</p>
                  </div>
                  {dj.isVerified && <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
                </button>
              ))}
            </div>
          )}

          {/* Tracks */}
          {tracks.length > 0 && (
            <div>
              <div className="px-4 py-2 border-b border-white/5 border-t border-t-white/5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Music className="w-3 h-3" /> Tracks & Mixes
                </span>
              </div>
              {tracks.map((t: any) => (
                <button key={t.id} onClick={() => { navigate("/discover"); handleClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {t.coverUrl
                      ? <img src={t.coverUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                      : <Music className="w-4 h-4 text-purple-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{t.title}</p>
                    <p className="text-slate-500 text-xs truncate">{t.artist}{t.bpm ? ` · ${t.bpm} BPM` : ""}</p>
                  </div>
                  {t.genre && <Badge className="text-[9px] bg-purple-500/20 text-purple-300 border-purple-500/30 px-1.5 py-0">{t.genre}</Badge>}
                </button>
              ))}
            </div>
          )}

          {/* Posts */}
          {posts.length > 0 && (
            <div>
              <div className="px-4 py-2 border-b border-white/5 border-t border-t-white/5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <FileText className="w-3 h-3" /> Posts
                </span>
              </div>
              {posts.map((p: any) => (
                <button key={p.id} onClick={() => { navigate("/social"); handleClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={p.profileImageUrl || p.avatarUrl || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-xs">
                      {(p.djName || p.username || "D").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 text-xs truncate">{p.content?.slice(0, 80)}{p.content?.length > 80 ? "..." : ""}</p>
                    <p className="text-slate-500 text-[10px]">@{p.username} · ❤️ {p.likeCount || 0}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="px-4 py-2 border-t border-white/5">
            <p className="text-slate-600 text-[10px] text-center">Press ESC to close</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ODJS Logo Badge ────────────────────────────────────────────────────────
const ODJS_LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663313258514/ZSqS9M2EFeWUjrPvMV6QuC/odjs-logo-holographic_f6c80f68.png";

function OdjsBadge({ size = "sm" }: { size?: "sm" | "md" }) {
  if (size === "md") {
    return (
      <div className="flex items-center gap-1.5">
        <img src={ODJS_LOGO_URL} alt="ODJS" className="w-8 h-8 rounded-full object-cover border border-cyan-500/30" />
        <span className="text-[9px] font-bold text-slate-400 leading-tight">ONLYDJS<br/>PLATFORM</span>
      </div>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-full px-2 py-0.5 text-[10px] font-bold text-cyan-400 tracking-wider">
      <Zap className="w-2.5 h-2.5" />ODJS
    </span>
  );
}

// Format exact time HH:MM AM/PM
function formatExactTime(ts: number) {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch { return ""; }
}

// Format full date for share watermark
function formatShareDate(ts: number) {
  try {
    const d = new Date(ts);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch { return ""; }
}

// ── Post Composer ──────────────────────────────────────────────────────────
function PostComposer({ onPosted }: { onPosted: () => void }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [postType, setPostType] = useState<"text" | "music_preview" | "announcement" | "track_release" | "event">("text");
  const [showHashtag, setShowHashtag] = useState(false);

  const createPost = trpc.social.createPost.useMutation({
    onSuccess: () => {
      setContent("");
      setHashtags("");
      setPostType("text");
      setShowHashtag(false);
      toast("Post published!");
      onPosted();
    },
    onError: (e) => toast.error(e.message),
  });

  if (!user) return null;

  return (
    <div className="bg-[#0d0d1a] border border-cyan-500/20 rounded-2xl p-4 mb-4">
      <div className="flex gap-3">
        <Avatar className="w-10 h-10 ring-2 ring-cyan-500/30 flex-shrink-0">
          <AvatarImage src={getAvatar(user)} />
          <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-sm font-bold">
            {getDisplayName(user).charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <Textarea
            placeholder="What are you sharing today DJ?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-transparent border-none resize-none text-white placeholder:text-slate-500 text-base p-0 focus-visible:ring-0 min-h-[80px]"
            maxLength={500}
          />
          {showHashtag && (
            <input
              type="text"
              placeholder="#techhouse #edm #newdrop"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              className="w-full bg-transparent border-none text-cyan-400 placeholder:text-slate-600 text-sm p-0 outline-none mt-1"
            />
          )}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="text-cyan-400 hover:bg-cyan-500/10 h-8 px-2" onClick={() => toast("Image upload coming soon")}>
                <Image className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-purple-400 hover:bg-purple-500/10 h-8 px-2" onClick={() => toast("Video upload coming soon")}>
                <Video className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-pink-400 hover:bg-pink-500/10 h-8 px-2" onClick={() => { setPostType("music_preview"); toast("Track preview — paste URL in post"); }}>
                <Music2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-yellow-400 hover:bg-yellow-500/10 h-8 px-2" onClick={() => setShowHashtag(!showHashtag)}>
                <Hash className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">{content.length}/500</span>
              <Button
                size="sm"
                disabled={!content.trim() || createPost.isPending}
                onClick={() => createPost.mutate({ content, hashtags: hashtags || undefined, postType })}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold px-4 rounded-full"
              >
                <Send className="w-3.5 h-3.5 mr-1" />
                Publish
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Post Card ──────────────────────────────────────────────────────────────
function PostCard({ post, likedIds, repostedIds, savedIds, onInteraction }: {
  post: any;
  likedIds: number[];
  repostedIds: number[];
  savedIds: number[];
  onInteraction: () => void;
}) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showShare, setShowShare] = useState(false);

  const liked = likedIds.includes(post.id);
  const reposted = repostedIds.includes(post.id);
  const saved = savedIds.includes(post.id);

  const likeMut = trpc.social.likePost.useMutation({ onSuccess: onInteraction });
  const repostMut = trpc.social.repostPost.useMutation({ onSuccess: onInteraction });
  const saveMut = trpc.social.savePost.useMutation({ onSuccess: onInteraction });
  const commentMut = trpc.social.addComment.useMutation({
    onSuccess: () => { setCommentText(""); onInteraction(); },
  });
  const { data: commentsData } = trpc.social.getComments.useQuery(
    { postId: post.id },
    { enabled: showComments }
  );

  const handleAction = (fn: () => void) => {
    if (!user) { toast("Sign in to interact"); return; }
    fn();
  };

  const postTypeColors: Record<string, string> = {
    music_preview: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    announcement: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    track_release: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    event: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    text: "",
  };

  return (
    <div className="relative bg-[#0a0a18] border border-white/5 hover:border-cyan-500/20 rounded-2xl p-4 transition-all duration-200 group overflow-hidden">
      {/* Subtle starfield background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(6,182,212,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168,85,247,0.06) 0%, transparent 50%)'}} />

      <div className="flex gap-3 relative">
        {/* Avatar */}
        <Link href={`/${post.username}`}>
          <Avatar className="w-11 h-11 ring-2 ring-cyan-500/20 hover:ring-cyan-500/50 transition-all cursor-pointer flex-shrink-0">
            <AvatarImage src={getAvatar(post)} />
            <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-sm font-bold">
              {getDisplayName(post).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-1">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link href={`/${post.username}`} className="font-bold text-white hover:text-cyan-400 transition-colors text-sm">
                  {getDisplayName(post)}
                </Link>
                {post.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
                <span className="text-slate-500 text-xs">@{post.username}</span>
                {post.postType && post.postType !== "text" && (
                  <span className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 ${postTypeColors[post.postType]}`}>
                    {post.postType.replace("_", " ").toUpperCase()}
                  </span>
                )}
              </div>
              {/* Exact time below name like in reference */}
              <div className="flex items-center gap-1 mt-0.5">
                <MessageCircle className="w-3 h-3 text-slate-600" />
                <span className="text-slate-500 text-[11px]">{formatExactTime(post.createdAt)}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-600 hover:text-white opacity-0 group-hover:opacity-100 flex-shrink-0">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Content */}
          <p className="text-slate-200 text-sm leading-relaxed mb-2 whitespace-pre-wrap mt-2">{post.content}</p>

          {/* Hashtags */}
          {post.hashtags && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.hashtags.split(/[\s,]+/).filter(Boolean).map((tag: string, i: number) => (
                <span key={i} className="text-cyan-400 text-xs hover:text-cyan-300 cursor-pointer font-medium">
                  {tag.startsWith("#") ? tag : `#${tag}`}
                </span>
              ))}
            </div>
          )}

          {/* Media */}
          {post.mediaUrl && post.mediaType === "image" && (
            <img src={post.mediaUrl} alt="post media" className="rounded-xl max-h-80 w-full object-cover mb-3 border border-white/5" />
          )}
          {post.mediaUrl && post.mediaType === "audio" && (
            <audio controls src={post.mediaUrl} className="w-full mb-3 h-10" />
          )}

          {/* Actions row + ODJS logo badge on right */}
          <div className="flex items-center gap-1 mt-3 pt-2 border-t border-white/5">
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-500 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {post.commentCount || 0}
            </button>
            <button
              onClick={() => handleAction(() => repostMut.mutate({ postId: post.id }))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${reposted ? "bg-green-500/20 text-green-400" : "text-slate-500 hover:bg-green-500/10 hover:text-green-400"}`}
            >
              <Repeat2 className="w-3.5 h-3.5" />
              {post.repostCount || 0}
            </button>
            <button
              onClick={() => handleAction(() => likeMut.mutate({ postId: post.id }))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${liked ? "bg-pink-500/20 text-pink-400" : "text-slate-500 hover:bg-pink-500/10 hover:text-pink-400"}`}
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`} />
              {post.likeCount || 0}
            </button>
            <button
              onClick={() => handleAction(() => saveMut.mutate({ postId: post.id }))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${saved ? "bg-yellow-500/20 text-yellow-400" : "text-slate-500 hover:bg-yellow-500/10 hover:text-yellow-400"}`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-current" : ""}`} />
            </button>
            {/* Share button */}
            <button
              onClick={() => setShowShare(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-500 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all"
              title="Share on social media"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            {/* ODJS Logo watermark — bottom right, like in the reference design */}
            <div
              className="ml-auto flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
              title={`Posted on ONLYDJS · ${formatShareDate(post.createdAt)}`}
              onClick={() => setShowShare(true)}
            >
              <img
                src={ODJS_LOGO_URL}
                alt="ODJS"
                className="w-9 h-9 rounded-full object-cover border border-cyan-500/30 shadow-md shadow-cyan-500/20"
              />
              <span className="text-[8px] font-bold text-slate-500 leading-tight hidden sm:block">ONLYDJS<br/>PLATFORM</span>
            </div>
          </div>

          {/* Comments */}
          {showComments && (
            <div className="mt-3 pt-3 border-t border-white/5">
              {commentsData?.comments.map((c: any) => (
                <div key={c.id} className="flex gap-2 mb-2">
                  <Avatar className="w-7 h-7 flex-shrink-0">
                    <AvatarImage src={getAvatar(c)} />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-xs">
                      {getDisplayName(c).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-white/5 rounded-xl px-3 py-2">
                    <span className="text-cyan-400 text-xs font-semibold mr-2">@{c.username}</span>
                    <span className="text-slate-300 text-xs">{c.content}</span>
                  </div>
                </div>
              ))}
              {user && (
                <div className="flex gap-2 mt-2">
                  <Avatar className="w-7 h-7 flex-shrink-0">
                    <AvatarImage src={getAvatar(user)} />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-xs">
                      {getDisplayName(user).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && commentText.trim()) {
                          commentMut.mutate({ postId: post.id, content: commentText });
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      disabled={!commentText.trim()}
                      onClick={() => commentMut.mutate({ postId: post.id, content: commentText })}
                      className="h-7 px-3 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-xs"
                    >
                      <Send className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShare && (
        <SharePostModal
          post={post}
          open={showShare}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────
function SocialSidebar() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const navItems = [
    { icon: Home, label: "Home", href: "/social" },
    { icon: TrendingUp, label: "Ranking", href: "/social/ranking" },
    { icon: Map, label: "DJ Map", href: "/social/map" },
    { icon: Swords, label: "Battles", href: "/social/battles" },
    { icon: Flame, label: "Drop Radar", href: "/social/drops" },
    { icon: MessageCircle, label: "Messages", href: "#", badge: "Soon" },
    { icon: User, label: "Profile", href: user?.username ? `/${user.username}` : "/profile/edit" },
  ];

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col gap-2 sticky top-20 self-start">
      {/* Brand — ODJS Logo */}
      <div className="flex flex-col items-center px-3 py-5 mb-2">
        <div className="relative mb-2">
          <img
            src={ODJS_LOGO_URL}
            alt="ODJS"
            className="w-20 h-20 rounded-full object-cover"
          />
        </div>
        <p className="font-black text-white text-base tracking-widest leading-none">ODJS</p>
        <p className="text-slate-500 text-[10px] tracking-wider mt-0.5">DJ COMMUNITY</p>
      </div>

      {navItems.map((item) => (
        <button
          key={item.label}
          onClick={() => navigate(item.href)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium text-left"
        >
          <item.icon className="w-5 h-5 flex-shrink-0" />
          <span>{item.label}</span>
          {item.badge && (
            <Badge className="ml-auto text-[10px] bg-purple-500/20 text-purple-300 border-purple-500/30 px-1.5 py-0">
              {item.badge}
            </Badge>
          )}
        </button>
      ))}

      <div className="mt-4 px-3">
        <Button
          onClick={() => {
            if (!user) { toast("Sign in to post"); return; }
            document.getElementById("post-composer-textarea")?.focus();
          }}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold rounded-full py-3 shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Post
        </Button>
      </div>
    </aside>
  );
}

// ── Trending Sidebar ───────────────────────────────────────────────────────
function TrendingSidebar() {
  const { data } = trpc.social.getSocialRanking.useQuery({ limit: 5 });
  const djs = data?.djs || [];

  return (
    <aside className="w-72 flex-shrink-0 hidden xl:flex flex-col gap-4 sticky top-20 self-start">
      <div className="bg-[#0d0d1a] border border-white/5 rounded-2xl p-4">
        <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          Trending DJs
        </h3>
        {djs.length === 0 && (
          <p className="text-slate-500 text-xs">No DJs yet. Be the first!</p>
        )}
        {djs.map((dj: any, i: number) => (
          <Link key={dj.id} href={`/${dj.username}`}>
            <div className="flex items-center gap-3 py-2 hover:bg-white/5 rounded-xl px-2 -mx-2 transition-colors cursor-pointer">
              <span className="text-slate-600 text-xs font-bold w-4">{i + 1}</span>
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={getAvatar(dj)} />
                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-xs">
                  {getDisplayName(dj).charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">{getDisplayName(dj)}</p>
                <p className="text-slate-500 text-xs">@{dj.username}</p>
              </div>
              {dj.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
            </div>
          </Link>
        ))}
        <Link href="/social/ranking">
          <Button variant="ghost" size="sm" className="w-full mt-2 text-cyan-400 hover:bg-cyan-500/10 text-xs rounded-full">
            View Full Ranking
          </Button>
        </Link>
      </div>

      <div className="bg-[#0d0d1a] border border-white/5 rounded-2xl p-4">
        <h3 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          Drop Radar
        </h3>
        <p className="text-slate-500 text-xs mb-3">Vote for the hottest upcoming tracks</p>
        <Link href="/social/drops">
          <Button size="sm" className="w-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 text-orange-300 hover:from-orange-500/30 hover:to-red-500/30 rounded-full text-xs">
            <Flame className="w-3.5 h-3.5 mr-1" />
            Explore Drops
          </Button>
        </Link>
      </div>
    </aside>
  );
}

// ── Main Social Page ───────────────────────────────────────────────────────
export default function Social() {
  const { user } = useAuth();
  const [feedKey, setFeedKey] = useState(0);

  useSEO({
    title: "ODJS Social – DJ Community Feed",
    description: "Connect with DJs worldwide. Share tracks, drops, and music updates on ODJS Social — the social network for electronic music creators.",
    url: "https://www.onlydjss.com/social",
  });

  const { data, isLoading, refetch } = trpc.social.getFeed.useQuery({ page: 1, limit: 30 });
  const posts = data?.posts || [];
  const postIds = posts.map((p: any) => Number(p.id));

  const { data: interactions, refetch: refetchInteractions } = trpc.social.getPostInteractions.useQuery(
    { postIds },
    { enabled: !!user && postIds.length > 0 }
  );

  const likedIds = interactions?.likes || [];
  const repostedIds = interactions?.reposts || [];
  const savedIds = interactions?.saves || [];

  const handleInteraction = () => {
    refetch();
    refetchInteractions();
  };

  return (
    <div className="min-h-screen bg-[#07070f]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-16">
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <SocialSidebar />

          {/* Center Feed */}
          <main className="flex-1 min-w-0 max-w-2xl mx-auto lg:mx-0">
            {/* Header — ODJS Logo + Search Bar */}
            <div className="flex flex-col items-center mb-6">
              <div className="mb-2">
                <img
                  src={ODJS_LOGO_URL}
                  alt="ODJS"
                  className="w-24 h-24 rounded-full object-cover"
                />
              </div>
              <p className="text-slate-400 text-xs tracking-widest font-semibold uppercase mt-1">ODJS Community Feed</p>
              <div className="flex items-center gap-2 mt-2 mb-4">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">
                  ● LIVE
                </Badge>
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[10px]">
                  DJ SOCIAL
                </Badge>
              </div>
              {/* Search Bar */}
              <div className="w-full">
                <GlobalSearchBar />
              </div>
            </div>

            {/* Composer */}
            {user && (
              <PostComposer key={feedKey} onPosted={() => { setFeedKey(k => k + 1); refetch(); }} />
            )}
            {!user && (
              <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-4 mb-4 text-center">
                <p className="text-slate-300 text-sm mb-3">Join the DJ community — share your music and connect with creators worldwide</p>
                <Button
                  onClick={() => window.location.href = "/api/oauth/login"}
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-full px-6"
                >
                  Sign in to Post
                </Button>
              </div>
            )}

            {/* Feed */}
            {isLoading && (
              <div className="space-y-4">
                {/* Loading screen with ODJS logo */}
                <div className="flex flex-col items-center py-8 mb-2">
                  <div className="animate-pulse">
                    <img
                      src={ODJS_LOGO_URL}
                      alt="ODJS"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  </div>
                  <p className="text-slate-500 text-xs mt-3 tracking-widest">Loading feed...</p>
                </div>
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-[#0d0d1a] border border-white/5 rounded-2xl p-4 animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5" />
                      <div className="flex-1">
                        <div className="h-3 bg-white/5 rounded w-32 mb-2" />
                        <div className="h-4 bg-white/5 rounded w-full mb-1" />
                        <div className="h-4 bg-white/5 rounded w-3/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && posts.length === 0 && (
              <div className="text-center py-16">
                <div className="inline-block mb-4">
                  <img src={ODJS_LOGO_URL} alt="ODJS" className="w-16 h-16 rounded-full object-cover mx-auto" />
                </div>
                <h3 className="text-white font-semibold mb-2">No posts yet</h3>
                <p className="text-slate-500 text-sm">Be the first DJ to share something!</p>
              </div>
            )}

            <div className="space-y-3">
              {posts.map((post: any) => (
                <PostCard
                  key={post.id}
                  post={post}
                  likedIds={likedIds}
                  repostedIds={repostedIds}
                  savedIds={savedIds}
                  onInteraction={handleInteraction}
                />
              ))}
            </div>
          </main>

          {/* Right Sidebar */}
          <TrendingSidebar />
        </div>
      </div>
    </div>
  );
}
