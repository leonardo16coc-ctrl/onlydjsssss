import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Flame, TrendingUp, Radio, CheckCircle2, Play, Pause, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useSEO } from "@/hooks/useSEO";
import { formatDistanceToNow } from "date-fns";

function getAvatar(u: any) { return u?.profileImageUrl || u?.avatarUrl || ""; }
function getDisplayName(u: any) { return u?.djName || u?.name || u?.username || "DJ"; }

function DropCard({ drop, voted, onVote }: { drop: any; voted: boolean; onVote: () => void }) {
  const { user } = useAuth();
  const [playing, setPlaying] = useState(false);
  const [audio] = useState(() => typeof window !== "undefined" ? new Audio(drop.previewUrl) : null);

  const voteMut = trpc.social.voteDrop.useMutation({
    onSuccess: (data) => {
      toast(data.voted ? "🔥 Fire vote added!" : "Vote removed");
      onVote();
    },
    onError: (e) => toast.error(e.message),
  });

  const togglePlay = () => {
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); audio.onended = () => setPlaying(false); }
  };

  const handleVote = () => {
    if (!user) { toast("Sign in to vote"); return; }
    voteMut.mutate({ dropId: drop.id });
  };

  return (
    <div className={`bg-[#0d0d1a] border rounded-2xl p-4 transition-all duration-200 hover:border-orange-500/30 ${drop.isTrending ? "border-orange-500/40 shadow-lg shadow-orange-500/10" : "border-white/5"}`}>
      <div className="flex gap-4">
        {/* Cover */}
        <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-orange-500/20 to-red-500/20">
          {drop.coverUrl ? (
            <img src={drop.coverUrl} alt={drop.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Flame className="w-8 h-8 text-orange-400" />
            </div>
          )}
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
          >
            {playing ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
          </button>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-white text-sm truncate">{drop.title}</h3>
              <p className="text-slate-400 text-xs">{drop.artist}</p>
              {drop.genre && (
                <Badge className="mt-1 text-[10px] bg-orange-500/20 text-orange-300 border-orange-500/30">
                  {drop.genre}
                </Badge>
              )}
            </div>
            {drop.isTrending && (
              <Badge className="flex-shrink-0 bg-orange-500/20 text-orange-300 border-orange-500/30 text-[10px]">
                <TrendingUp className="w-2.5 h-2.5 mr-1" />TRENDING
              </Badge>
            )}
          </div>

          {drop.description && (
            <p className="text-slate-500 text-xs mt-1 line-clamp-2">{drop.description}</p>
          )}

          <div className="flex items-center justify-between mt-3">
            <Link href={`/${drop.username}`}>
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={getAvatar(drop)} />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-[10px]">
                    {getDisplayName(drop).charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-slate-400 text-xs">@{drop.username}</span>
                {drop.isVerified && <CheckCircle2 className="w-3 h-3 text-cyan-400" />}
              </div>
            </Link>
            <button
              onClick={handleVote}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                voted
                  ? "bg-orange-500/30 text-orange-300 border border-orange-500/50"
                  : "bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20"
              }`}
            >
              🔥 {drop.fireCount || 0}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SocialDrops() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"latest" | "trending">("trending");

  useSEO({
    title: "Drop Radar – ODJS Social",
    description: "Vote for the hottest upcoming DJ tracks. Discover trending drops and new music from electronic music producers on ODJS.",
    url: "https://www.onlydjss.com/social/drops",
  });

  const { data, refetch } = trpc.social.getDrops.useQuery({ trending: tab === "trending", limit: 30 });
  const drops = data?.drops || [];
  const dropIds = drops.map((d: any) => Number(d.id));

  const { data: votesData, refetch: refetchVotes } = trpc.social.getUserDropVotes.useQuery(
    { dropIds },
    { enabled: !!user && dropIds.length > 0 }
  );
  const votedIds = votesData?.voted || [];

  const handleVote = () => { refetch(); refetchVotes(); };

  return (
    <div className="min-h-screen bg-[#07070f]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/social">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white rounded-full">
              <ArrowLeft className="w-4 h-4 mr-1" />Back
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Drop Radar</h1>
              <p className="text-slate-500 text-xs">Vote for the hottest upcoming tracks</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["trending", "latest"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                tab === t
                  ? "bg-orange-500/20 text-orange-300 border border-orange-500/40"
                  : "text-slate-500 hover:text-white hover:bg-white/5"
              }`}
            >
              {t === "trending" ? "🔥 Trending" : "🆕 Latest"}
            </button>
          ))}
        </div>

        {/* Drops */}
        {drops.length === 0 && (
          <div className="text-center py-16">
            <Flame className="w-12 h-12 mx-auto mb-4 text-orange-500/30" />
            <h3 className="text-white font-semibold mb-2">No drops yet</h3>
            <p className="text-slate-500 text-sm">Be the first to submit a track preview!</p>
          </div>
        )}
        <div className="space-y-3">
          {drops.map((drop: any) => (
            <DropCard
              key={drop.id}
              drop={drop}
              voted={votedIds.includes(Number(drop.id))}
              onVote={handleVote}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
