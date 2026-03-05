import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ArrowLeft, Users, Play, Heart, Share2, CheckCircle2, Trophy, Medal } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useSEO } from "@/hooks/useSEO";

function getAvatar(u: any) { return u?.profileImageUrl || u?.avatarUrl || ""; }
function getDisplayName(u: any) { return u?.djName || u?.name || u?.username || "DJ"; }

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/30"><Trophy className="w-4 h-4 text-white" /></div>;
  if (rank === 2) return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center"><Medal className="w-4 h-4 text-white" /></div>;
  if (rank === 3) return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center"><Medal className="w-4 h-4 text-white" /></div>;
  return <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 text-sm font-bold">{rank}</div>;
}

export default function SocialRanking() {
  useSEO({
    title: "DJ Rankings – ODJS Social",
    description: "Top DJs ranked by engagement, followers, plays and likes on ODJS Social.",
    url: "https://www.onlydjss.com/social/ranking",
  });

  const { data, isLoading } = trpc.social.getSocialRanking.useQuery({ limit: 50 });
  const djs = data?.djs || [];

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Trending DJs</h1>
              <p className="text-slate-500 text-xs">Ranked by engagement score</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-6 px-4 py-3 bg-white/3 rounded-xl border border-white/5 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />Followers ×3</span>
          <span className="flex items-center gap-1"><Play className="w-3.5 h-3.5" />Plays ×1</span>
          <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />Likes ×2</span>
          <span className="flex items-center gap-1"><Share2 className="w-3.5 h-3.5" />Posts ×1</span>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="bg-[#0d0d1a] border border-white/5 rounded-2xl p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/5" />
                  <div className="w-12 h-12 rounded-full bg-white/5" />
                  <div className="flex-1">
                    <div className="h-3 bg-white/5 rounded w-32 mb-2" />
                    <div className="h-2 bg-white/5 rounded w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && djs.length === 0 && (
          <div className="text-center py-16">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-yellow-500/30" />
            <h3 className="text-white font-semibold mb-2">No rankings yet</h3>
            <p className="text-slate-500 text-sm">Upload tracks and get followers to appear here!</p>
          </div>
        )}

        <div className="space-y-2">
          {djs.map((dj: any, i: number) => {
            const rank = i + 1;
            const isTop3 = rank <= 3;
            return (
              <Link key={dj.id} href={`/${dj.username}`}>
                <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer hover:border-cyan-500/30 ${
                  isTop3
                    ? "bg-gradient-to-r from-yellow-500/5 to-transparent border-yellow-500/20"
                    : "bg-[#0d0d1a] border-white/5 hover:bg-white/3"
                }`}>
                  <RankBadge rank={rank} />
                  <Avatar className={`flex-shrink-0 ${isTop3 ? "w-12 h-12 ring-2 ring-yellow-500/30" : "w-10 h-10 ring-1 ring-white/10"}`}>
                    <AvatarImage src={getAvatar(dj)} />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white font-bold">
                      {getDisplayName(dj).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold truncate ${isTop3 ? "text-white text-base" : "text-white text-sm"}`}>
                        {getDisplayName(dj)}
                      </span>
                      {dj.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
                    </div>
                    <span className="text-slate-500 text-xs">@{dj.username}</span>
                    {dj.country && <span className="text-slate-600 text-xs ml-2">{dj.country}</span>}
                  </div>
                  <div className="flex items-center gap-4 text-right flex-shrink-0">
                    <div className="hidden sm:block">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{Number(dj.followers || 0).toLocaleString()}</span>
                        <span className="flex items-center gap-1"><Play className="w-3 h-3" />{Number(dj.totalPlays || 0).toLocaleString()}</span>
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{Number(dj.totalLikes || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-black text-sm ${isTop3 ? "text-yellow-400" : "text-cyan-400"}`}>
                        {Number(dj.engagementScore || 0).toLocaleString()}
                      </div>
                      <div className="text-slate-600 text-[10px]">score</div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
