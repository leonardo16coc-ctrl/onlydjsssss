import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp, Music, Users, Play, Download, Heart, Trophy,
  Disc3, Mic2, Crown, Star, Headphones
} from "lucide-react";

function DJRankCard({ dj, rank }: { dj: any; rank: number }) {
  const [, navigate] = useLocation();
  const rankColors = ["text-yellow-400", "text-gray-300", "text-amber-600"];
  const rankIcons = [Crown, Star, Trophy];
  const RankIcon = rank <= 3 ? rankIcons[rank - 1] : null;

  return (
    <Card
      className="bg-card/50 border-border/50 hover:border-primary/50 hover:bg-card transition-all duration-200 cursor-pointer"
      onClick={() => navigate(`/${dj.username}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Rank */}
          <div className={`w-8 text-center font-bold text-lg flex-shrink-0 ${rank <= 3 ? rankColors[rank - 1] : "text-muted-foreground"}`}>
            {RankIcon ? <RankIcon className="w-5 h-5 mx-auto" /> : `#${rank}`}
          </div>

          {/* Avatar */}
          <Avatar className="w-12 h-12 flex-shrink-0">
            <AvatarImage src={dj.profileImageUrl || dj.avatarUrl || ""} />
            <AvatarFallback className="bg-primary/10 text-sm">
              {(dj.djName || dj.name || dj.username || "?").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm truncate">{dj.djName || dj.name || dj.username}</p>
              {dj.isVerified && <Badge variant="secondary" className="text-xs px-1">✓</Badge>}
            </div>
            <p className="text-xs text-muted-foreground">@{dj.username}</p>
          </div>

          {/* Stats */}
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-sm">{Number(dj.followers_count || 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
              <Users className="w-3 h-3" />followers
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TrackRankCard({ track, rank }: { track: any; rank: number }) {
  const [, navigate] = useLocation();
  const rankColors = ["text-yellow-400", "text-gray-300", "text-amber-600"];
  const RankIcon = rank <= 3 ? [Crown, Star, Trophy][rank - 1] : null;

  return (
    <Card
      className="bg-card/50 border-border/50 hover:border-primary/50 hover:bg-card transition-all duration-200 cursor-pointer"
      onClick={() => navigate(`/track/${track.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Rank */}
          <div className={`w-8 text-center font-bold text-lg flex-shrink-0 ${rank <= 3 ? rankColors[rank - 1] : "text-muted-foreground"}`}>
            {RankIcon ? <RankIcon className="w-5 h-5 mx-auto" /> : `#${rank}`}
          </div>

          {/* Cover */}
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {track.coverImageUrl ? (
              <img src={track.coverImageUrl} alt={track.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{track.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {track.djName || track.name || track.username} · {track.genre}
            </p>
          </div>

          {/* Stats */}
          <div className="text-right flex-shrink-0 space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
              <Play className="w-3 h-3" />{Number(track.playCount || 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
              <Heart className="w-3 h-3" />{Number(track.likeCount || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Charts() {
  const [activeTab, setActiveTab] = useState("djs");

  const { data: topDJs, isLoading: loadingDJs } = trpc.djProfiles.getFeaturedDJs.useQuery({
    limit: 20,
    sortBy: "followers",
  });

  const { data: topTracks, isLoading: loadingTracks } = trpc.djProfiles.getTrendingTracks.useQuery({
    limit: 20,
    type: "all",
  });

  const { data: topEdits, isLoading: loadingEdits } = trpc.djProfiles.getTrendingTracks.useQuery({
    limit: 20,
    type: "edit",
  });

  const { data: topRemixes, isLoading: loadingRemixes } = trpc.djProfiles.getTrendingTracks.useQuery({
    limit: 20,
    type: "remix",
  });

  const { data: newDJs } = trpc.djProfiles.getFeaturedDJs.useQuery({
    limit: 10,
    sortBy: "recent",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-background border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Charts</h1>
              <p className="text-muted-foreground text-sm">Top DJs and tracks on ONLYDJS</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8 grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="djs" className="flex items-center gap-2">
              <Users className="w-4 h-4" />DJs
            </TabsTrigger>
            <TabsTrigger value="tracks" className="flex items-center gap-2">
              <Headphones className="w-4 h-4" />Tracks
            </TabsTrigger>
            <TabsTrigger value="edits" className="flex items-center gap-2">
              <Mic2 className="w-4 h-4" />Edits
            </TabsTrigger>
            <TabsTrigger value="remixes" className="flex items-center gap-2">
              <Disc3 className="w-4 h-4" />Remixes
            </TabsTrigger>
          </TabsList>

          {/* Top DJs */}
          <TabsContent value="djs">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />Top DJs by Followers
                </h2>
                {loadingDJs ? (
                  <div className="space-y-3">
                    {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {((topDJs as any)?.djs || []).map((dj: any, i: number) => (
                      <DJRankCard key={dj.id} dj={dj} rank={i + 1} />
                    ))}
                    {((topDJs as any)?.djs || []).length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>No DJs yet. Be the first to upload!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />New DJs
                </h2>
                <div className="space-y-3">
                  {((newDJs as any)?.djs || []).slice(0, 8).map((dj: any, i: number) => (
                    <DJRankCard key={dj.id} dj={dj} rank={i + 1} />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Top Tracks */}
          <TabsContent value="tracks">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />Trending Tracks
            </h2>
            {loadingTracks ? (
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
              </div>
            ) : (
              <div className="space-y-3 max-w-2xl">
                {((topTracks as any)?.tracks || []).map((track: any, i: number) => (
                  <TrackRankCard key={track.id} track={track} rank={i + 1} />
                ))}
                {((topTracks as any)?.tracks || []).length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Music className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No tracks yet.</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Top Edits */}
          <TabsContent value="edits">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mic2 className="w-5 h-5 text-primary" />Top Edits
            </h2>
            {loadingEdits ? (
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
              </div>
            ) : (
              <div className="space-y-3 max-w-2xl">
                {((topEdits as any)?.tracks || []).map((track: any, i: number) => (
                  <TrackRankCard key={track.id} track={track} rank={i + 1} />
                ))}
                {((topEdits as any)?.tracks || []).length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Mic2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No edits yet.</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Top Remixes */}
          <TabsContent value="remixes">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Disc3 className="w-5 h-5 text-primary" />Top Remixes
            </h2>
            {loadingRemixes ? (
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
              </div>
            ) : (
              <div className="space-y-3 max-w-2xl">
                {((topRemixes as any)?.tracks || []).map((track: any, i: number) => (
                  <TrackRankCard key={track.id} track={track} rank={i + 1} />
                ))}
                {((topRemixes as any)?.tracks || []).length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Disc3 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No remixes yet.</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
