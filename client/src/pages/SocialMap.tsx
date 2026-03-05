import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Map, ArrowLeft, Users, CheckCircle2, Globe, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useSEO } from "@/hooks/useSEO";

function getAvatar(u: any) { return u?.profileImageUrl || u?.avatarUrl || ""; }
function getDisplayName(u: any) { return u?.djName || u?.name || u?.username || "DJ"; }

// Country flag emoji helper
function countryFlag(country: string) {
  if (!country) return "🌍";
  const code = country.trim().toUpperCase().slice(0, 2);
  if (code.length !== 2) return "🌍";
  const chars = Array.from(code);
  return String.fromCodePoint(...chars.map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
}

export default function SocialMap() {
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  useSEO({
    title: "DJ Map – ODJS Social",
    description: "Discover DJs from around the world. Find electronic music producers in your city on ODJS Social.",
    url: "https://www.onlydjss.com/social/map",
  });

  const { data, isLoading } = trpc.social.getDJsForMap.useQuery();
  const allDjs = data?.djs || [];

  // Group by country
  const byCountry: Record<string, any[]> = {};
  allDjs.forEach((dj: any) => {
    const c = dj.country || "Unknown";
    if (!byCountry[c]) byCountry[c] = [];
    byCountry[c].push(dj);
  });

  const countries = Object.keys(byCountry).sort((a, b) => byCountry[b].length - byCountry[a].length);

  const filteredDjs = allDjs.filter((dj: any) => {
    const matchSearch = !search || 
      (dj.djName || dj.name || dj.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (dj.country || "").toLowerCase().includes(search.toLowerCase());
    const matchCountry = !selectedCountry || dj.country === selectedCountry;
    return matchSearch && matchCountry;
  });

  return (
    <div className="min-h-screen bg-[#07070f]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/social">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white rounded-full">
              <ArrowLeft className="w-4 h-4 mr-1" />Back
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">DJ Map</h1>
              <p className="text-slate-500 text-xs">Discover DJs worldwide — {allDjs.length} DJs found</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Left: Countries sidebar */}
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search DJ or country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0d0d1a] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>

            {/* All DJs button */}
            <button
              onClick={() => setSelectedCountry(null)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                !selectedCountry ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>All DJs</span>
              <Badge className="ml-auto bg-white/10 text-slate-400 border-0 text-xs">{allDjs.length}</Badge>
            </button>

            {/* Countries */}
            <div className="bg-[#0d0d1a] border border-white/5 rounded-2xl overflow-hidden max-h-[500px] overflow-y-auto">
              {countries.map((country) => (
                <button
                  key={country}
                  onClick={() => setSelectedCountry(country === selectedCountry ? null : country)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all border-b border-white/3 last:border-0 ${
                    selectedCountry === country
                      ? "bg-cyan-500/10 text-cyan-300"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="text-lg">{countryFlag(country)}</span>
                  <span className="flex-1 text-left truncate">{country}</span>
                  <Badge className="bg-white/5 text-slate-500 border-0 text-xs">{byCountry[country].length}</Badge>
                </button>
              ))}
              {countries.length === 0 && !isLoading && (
                <div className="px-4 py-6 text-center text-slate-500 text-sm">
                  No DJs with location data yet
                </div>
              )}
            </div>
          </div>

          {/* Right: DJ Grid */}
          <div>
            {selectedCountry && (
              <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                <span className="text-2xl">{countryFlag(selectedCountry)}</span>
                <div>
                  <h2 className="font-bold text-white text-sm">{selectedCountry}</h2>
                  <p className="text-slate-500 text-xs">{byCountry[selectedCountry]?.length || 0} DJs</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCountry(null)}
                  className="ml-auto text-slate-500 hover:text-white rounded-full text-xs"
                >
                  Clear
                </Button>
              </div>
            )}

            {isLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {[1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} className="bg-[#0d0d1a] border border-white/5 rounded-2xl p-4 animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-white/5 mx-auto mb-2" />
                    <div className="h-3 bg-white/5 rounded w-3/4 mx-auto mb-1" />
                    <div className="h-2 bg-white/5 rounded w-1/2 mx-auto" />
                  </div>
                ))}
              </div>
            )}

            {!isLoading && filteredDjs.length === 0 && (
              <div className="text-center py-16">
                <Map className="w-12 h-12 mx-auto mb-4 text-cyan-500/30" />
                <h3 className="text-white font-semibold mb-2">No DJs found</h3>
                <p className="text-slate-500 text-sm">
                  {allDjs.length === 0
                    ? "DJs need to add their country to their profile to appear here"
                    : "Try a different search or country filter"}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredDjs.map((dj: any) => (
                <Link key={dj.id} href={`/${dj.username}`}>
                  <div className="bg-[#0d0d1a] border border-white/5 hover:border-cyan-500/30 rounded-2xl p-4 text-center transition-all cursor-pointer hover:bg-white/3 group">
                    <Avatar className="w-14 h-14 mx-auto mb-3 ring-2 ring-white/10 group-hover:ring-cyan-500/30 transition-all">
                      <AvatarImage src={getAvatar(dj)} />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white font-bold text-lg">
                        {getDisplayName(dj).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <p className="font-semibold text-white text-xs truncate max-w-[90px]">{getDisplayName(dj)}</p>
                      {dj.isVerified && <CheckCircle2 className="w-3 h-3 text-cyan-400 flex-shrink-0" />}
                    </div>
                    <p className="text-slate-500 text-[10px] truncate">@{dj.username}</p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <span className="text-lg">{countryFlag(dj.country)}</span>
                      <span className="text-slate-600 text-[10px]">{dj.country}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-1.5 text-slate-500 text-[10px]">
                      <Users className="w-3 h-3" />
                      {Number(dj.followers || 0).toLocaleString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
