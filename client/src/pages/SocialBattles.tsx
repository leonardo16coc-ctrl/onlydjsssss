import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Swords, Trophy, ArrowLeft, Play, Pause, CheckCircle2, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useSEO } from "@/hooks/useSEO";

function getAvatar(u: any) { return u?.profileImageUrl || u?.avatarUrl || ""; }
function getDisplayName(u: any, prefix = "") { return u?.[`${prefix}DjName`] || u?.[`${prefix}Name`] || u?.[`${prefix}Username`] || "DJ"; }

function BattleCard({ battle, userVote, onVote }: { battle: any; userVote?: number; onVote: () => void }) {
  const { user } = useAuth();
  const [playingDj, setPlayingDj] = useState<1 | 2 | null>(null);

  const totalVotes = (battle.dj1Votes || 0) + (battle.dj2Votes || 0);
  const dj1Pct = totalVotes > 0 ? Math.round((battle.dj1Votes / totalVotes) * 100) : 50;
  const dj2Pct = 100 - dj1Pct;

  const voteMut = trpc.social.voteBattle.useMutation({
    onSuccess: (data: any) => {
      if (data.error) { toast.error(data.error); return; }
      toast("Vote cast! 🎧");
      onVote();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleVote = (djId: number) => {
    if (!user) { toast("Sign in to vote"); return; }
    if (userVote) { toast("You already voted in this battle"); return; }
    voteMut.mutate({ battleId: battle.id, votedForDjId: djId });
  };

  const togglePlay = (dj: 1 | 2) => {
    const url = dj === 1 ? battle.dj1TrackUrl : battle.dj2TrackUrl;
    if (!url) return;
    if (playingDj === dj) { setPlayingDj(null); }
    else { setPlayingDj(dj); }
  };

  const isEnded = battle.status === "ended";

  return (
    <div className={`bg-[#0d0d1a] border rounded-2xl p-5 transition-all ${isEnded ? "border-white/5 opacity-80" : "border-purple-500/20 hover:border-purple-500/40"}`}>
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white text-sm">{battle.title}</h3>
        <Badge className={isEnded ? "bg-slate-500/20 text-slate-400 border-slate-500/30" : "bg-purple-500/20 text-purple-300 border-purple-500/30"}>
          {isEnded ? "ENDED" : "⚡ LIVE"}
        </Badge>
      </div>

      {/* VS Layout */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
        {/* DJ 1 */}
        <div className={`text-center p-3 rounded-xl transition-all ${userVote === battle.dj1Id ? "bg-cyan-500/10 border border-cyan-500/30" : "bg-white/3"}`}>
          <Link href={`/${battle.dj1Username}`}>
            <Avatar className="w-14 h-14 mx-auto ring-2 ring-cyan-500/30 hover:ring-cyan-500/60 transition-all cursor-pointer">
              <AvatarImage src={battle.dj1ProfileImage || battle.dj1Avatar} />
              <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold">
                {(battle.dj1DjName || battle.dj1Name || battle.dj1Username || "D").charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Link>
          <p className="font-bold text-white text-sm mt-2 truncate">
            {battle.dj1DjName || battle.dj1Name || battle.dj1Username}
          </p>
          <p className="text-slate-500 text-xs">@{battle.dj1Username}</p>
          {battle.dj1TrackTitle && (
            <p className="text-cyan-400 text-xs mt-1 truncate">"{battle.dj1TrackTitle}"</p>
          )}
          {battle.dj1TrackUrl && (
            <button onClick={() => togglePlay(1)} className="mt-2 w-8 h-8 mx-auto flex items-center justify-center rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 transition-all">
              {playingDj === 1 ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          )}
          <div className="mt-3">
            <div className="text-2xl font-black text-cyan-400">{dj1Pct}%</div>
            <div className="text-xs text-slate-500">{battle.dj1Votes || 0} votes</div>
          </div>
          {!isEnded && (
            <Button
              size="sm"
              disabled={!!userVote}
              onClick={() => handleVote(battle.dj1Id)}
              className={`mt-3 w-full rounded-full text-xs font-bold ${
                userVote === battle.dj1Id
                  ? "bg-cyan-500/30 text-cyan-300 border border-cyan-500/50"
                  : "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30"
              }`}
            >
              {userVote === battle.dj1Id ? "✓ Voted" : "Vote"}
            </Button>
          )}
        </div>

        {/* VS */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Swords className="w-5 h-5 text-white" />
          </div>
          <span className="text-slate-600 text-xs font-bold">VS</span>
          {/* Progress bar */}
          <div className="w-2 h-20 bg-white/5 rounded-full overflow-hidden flex flex-col">
            <div className="bg-cyan-500 rounded-full transition-all duration-700" style={{ height: `${dj1Pct}%` }} />
            <div className="bg-purple-500 rounded-full flex-1 transition-all duration-700" />
          </div>
        </div>

        {/* DJ 2 */}
        <div className={`text-center p-3 rounded-xl transition-all ${userVote === battle.dj2Id ? "bg-purple-500/10 border border-purple-500/30" : "bg-white/3"}`}>
          <Link href={`/${battle.dj2Username}`}>
            <Avatar className="w-14 h-14 mx-auto ring-2 ring-purple-500/30 hover:ring-purple-500/60 transition-all cursor-pointer">
              <AvatarImage src={battle.dj2ProfileImage || battle.dj2Avatar} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white font-bold">
                {(battle.dj2DjName || battle.dj2Name || battle.dj2Username || "D").charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Link>
          <p className="font-bold text-white text-sm mt-2 truncate">
            {battle.dj2DjName || battle.dj2Name || battle.dj2Username}
          </p>
          <p className="text-slate-500 text-xs">@{battle.dj2Username}</p>
          {battle.dj2TrackTitle && (
            <p className="text-purple-400 text-xs mt-1 truncate">"{battle.dj2TrackTitle}"</p>
          )}
          {battle.dj2TrackUrl && (
            <button onClick={() => togglePlay(2)} className="mt-2 w-8 h-8 mx-auto flex items-center justify-center rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 transition-all">
              {playingDj === 2 ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          )}
          <div className="mt-3">
            <div className="text-2xl font-black text-purple-400">{dj2Pct}%</div>
            <div className="text-xs text-slate-500">{battle.dj2Votes || 0} votes</div>
          </div>
          {!isEnded && (
            <Button
              size="sm"
              disabled={!!userVote}
              onClick={() => handleVote(battle.dj2Id)}
              className={`mt-3 w-full rounded-full text-xs font-bold ${
                userVote === battle.dj2Id
                  ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                  : "bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30"
              }`}
            >
              {userVote === battle.dj2Id ? "✓ Voted" : "Vote"}
            </Button>
          )}
        </div>
      </div>

      {/* Winner banner */}
      {isEnded && battle.winnerId && (
        <div className="mt-4 flex items-center justify-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl py-2 px-4">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-300 text-sm font-bold">
            Winner: {battle.winnerId === battle.dj1Id
              ? (battle.dj1DjName || battle.dj1Name || battle.dj1Username)
              : (battle.dj2DjName || battle.dj2Name || battle.dj2Username)}
          </span>
        </div>
      )}
    </div>
  );
}

export default function SocialBattles() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"active" | "ended">("active");

  useSEO({
    title: "DJ Battles – ODJS Social",
    description: "Vote for your favorite DJ in head-to-head track battles. Weekly champions crowned on ODJS Social.",
    url: "https://www.onlydjss.com/social/battles",
  });

  const { data, refetch } = trpc.social.getBattles.useQuery({ status: tab });
  const battles = data?.battles || [];
  const battleIds = battles.map((b: any) => Number(b.id));

  const { data: votesData, refetch: refetchVotes } = trpc.social.getUserBattleVotes.useQuery(
    { battleIds },
    { enabled: !!user && battleIds.length > 0 }
  );
  const userVotes = votesData?.votes || {};

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Swords className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">DJ Battles</h1>
              <p className="text-slate-500 text-xs">Vote for your favorite track</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["active", "ended"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                tab === t
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                  : "text-slate-500 hover:text-white hover:bg-white/5"
              }`}
            >
              {t === "active" ? <><Zap className="w-3.5 h-3.5 inline mr-1" />Live Battles</> : <><Trophy className="w-3.5 h-3.5 inline mr-1" />Past Battles</>}
            </button>
          ))}
        </div>

        {battles.length === 0 && (
          <div className="text-center py-16">
            <Swords className="w-12 h-12 mx-auto mb-4 text-purple-500/30" />
            <h3 className="text-white font-semibold mb-2">No battles {tab === "active" ? "active" : "ended"} yet</h3>
            <p className="text-slate-500 text-sm">Check back soon for epic DJ showdowns!</p>
          </div>
        )}

        <div className="space-y-4">
          {battles.map((battle: any) => (
            <BattleCard
              key={battle.id}
              battle={battle}
              userVote={userVotes[Number(battle.id)]}
              onVote={handleVote}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
