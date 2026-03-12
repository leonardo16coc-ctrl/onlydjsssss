import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Music, Sparkles, Trophy, LayoutDashboard, Upload, CreditCard, User, Settings, LogOut, Radio, Menu, X, TrendingUp, Zap, Search, Mic2, FileText, Instagram } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useState, useEffect, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

// ── Inline Search Component ────────────────────────────────────────────────
function NavSearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isFetching } = trpc.social.globalSearch.useQuery(
    { query: query.trim() },
    { enabled: query.trim().length >= 2 }
  );

  const djs: any[] = data?.djs || [];
  const tracks: any[] = data?.tracks || [];
  const posts: any[] = data?.posts || [];
  const hasResults = djs.length > 0 || tracks.length > 0 || posts.length > 0;

  const handleClose = () => { setOpen(false); setQuery(""); };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative w-56 xl:w-72">
      <div className="relative flex items-center">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search DJs, tracks..."
          className="w-full bg-muted/50 border border-border rounded-full pl-8 pr-8 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
        />
        {query && (
          <button onClick={handleClose} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-2xl shadow-2xl z-[200] overflow-hidden max-h-[420px] overflow-y-auto">
          {isFetching && (
            <div className="flex items-center justify-center py-6">
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}
          {!isFetching && !hasResults && (
            <div className="py-6 text-center">
              <Search className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
              <p className="text-muted-foreground text-xs">No results for "{query}"</p>
            </div>
          )}

          {/* DJs */}
          {djs.length > 0 && (
            <div>
              <div className="px-3 py-1.5 border-b border-border bg-muted/30">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                  <Mic2 className="w-3 h-3" /> DJs
                </span>
              </div>
              {djs.map((dj: any) => (
                <button key={dj.id} onClick={() => { navigate(`/${dj.username}`); handleClose(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted/50 transition-colors text-left">
                  <Avatar className="w-7 h-7 flex-shrink-0">
                    <AvatarImage src={dj.profileImageUrl || dj.avatarUrl || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-[10px]">
                      {(dj.djName || dj.name || dj.username || "D").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-xs font-semibold truncate">{dj.djName || dj.name || dj.username}</p>
                    <p className="text-muted-foreground text-[10px]">@{dj.username}{dj.genre ? ` · ${dj.genre}` : ""}</p>
                  </div>
                  {dj.isVerified && <span className="text-cyan-400 text-[10px]">✓</span>}
                </button>
              ))}
            </div>
          )}

          {/* Tracks */}
          {tracks.length > 0 && (
            <div>
              <div className="px-3 py-1.5 border-b border-border bg-muted/30">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                  <Music className="w-3 h-3" /> Tracks & Mixes
                </span>
              </div>
              {tracks.map((t: any) => (
                <button key={t.id} onClick={() => { navigate(t.username ? `/${t.username}` : "/discover"); handleClose(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted/50 transition-colors text-left">
                  <div className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {t.coverUrl
                      ? <img src={t.coverUrl} alt="" className="w-full h-full object-cover rounded-md" />
                      : <Music className="w-3.5 h-3.5 text-purple-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-xs font-semibold truncate">{t.title}</p>
                    <p className="text-muted-foreground text-[10px] truncate">{t.artist}{t.bpm ? ` · ${t.bpm} BPM` : ""}</p>
                  </div>
                  {t.genre && <Badge className="text-[9px] bg-purple-500/20 text-purple-400 border-purple-500/30 px-1 py-0">{t.genre}</Badge>}
                </button>
              ))}
            </div>
          )}

          {/* Posts */}
          {posts.length > 0 && (
            <div>
              <div className="px-3 py-1.5 border-b border-border bg-muted/30">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Posts
                </span>
              </div>
              {posts.map((p: any) => (
                <button key={p.id} onClick={() => { navigate(p.username ? `/${p.username}` : "/social"); handleClose(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted/50 transition-colors text-left">
                  <Avatar className="w-7 h-7 flex-shrink-0">
                    <AvatarImage src={p.profileImageUrl || p.avatarUrl || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-[10px]">
                      {(p.djName || p.username || "D").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-muted-foreground text-[10px] truncate">{p.content?.slice(0, 60)}{p.content?.length > 60 ? "..." : ""}</p>
                    <p className="text-muted-foreground/60 text-[9px]">@{p.username} · ❤️ {p.likeCount || 0}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="px-3 py-1.5 border-t border-border bg-muted/20">
            <p className="text-muted-foreground/50 text-[9px] text-center">ESC to close · Enter to search</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Mobile Full-Screen Search Overlay ────────────────────────────────────────
function MobileSearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
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

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSelect = (path: string) => { navigate(path); onClose(); };

  return (
    <div className="fixed inset-0 z-[300] bg-background/95 backdrop-blur-md flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search DJs, tracks, posts..."
          className="flex-1 bg-transparent text-base text-foreground placeholder-muted-foreground focus:outline-none"
        />
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted/50 transition-colors">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {query.trim().length < 2 && (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <Search className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">Type at least 2 characters to search</p>
          </div>
        )}
        {query.trim().length >= 2 && isFetching && (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}
        {query.trim().length >= 2 && !isFetching && !hasResults && (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <Search className="w-8 h-8 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">No results for "{query}"</p>
          </div>
        )}

        {/* DJs */}
        {djs.length > 0 && (
          <div>
            <div className="px-4 py-2 bg-muted/30 border-b border-border">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                <Mic2 className="w-3 h-3" /> DJs
              </span>
            </div>
            {djs.map((dj: any) => (
              <button key={dj.id} onClick={() => handleSelect(`/${dj.username}`)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 active:bg-muted/60 transition-colors text-left border-b border-border/30">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage src={dj.profileImageUrl || dj.avatarUrl || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-sm">
                    {(dj.djName || dj.name || dj.username || "D").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm font-semibold truncate">{dj.djName || dj.name || dj.username}</p>
                  <p className="text-muted-foreground text-xs">@{dj.username}{dj.genre ? ` · ${dj.genre}` : ""}</p>
                </div>
                {dj.isVerified && <span className="text-cyan-400 text-xs">✓</span>}
              </button>
            ))}
          </div>
        )}

        {/* Tracks */}
        {tracks.length > 0 && (
          <div>
            <div className="px-4 py-2 bg-muted/30 border-b border-border">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                <Music className="w-3 h-3" /> Tracks & Mixes
              </span>
            </div>
            {tracks.map((t: any) => (
              <button key={t.id} onClick={() => handleSelect(t.username ? `/${t.username}` : "/discover")}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 active:bg-muted/60 transition-colors text-left border-b border-border/30">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {t.coverUrl
                    ? <img src={t.coverUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                    : <Music className="w-4 h-4 text-purple-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm font-semibold truncate">{t.title}</p>
                  <p className="text-muted-foreground text-xs truncate">{t.artist}{t.bpm ? ` · ${t.bpm} BPM` : ""}</p>
                </div>
                {t.genre && <Badge className="text-[10px] bg-purple-500/20 text-purple-400 border-purple-500/30 px-1.5 py-0.5">{t.genre}</Badge>}
              </button>
            ))}
          </div>
        )}

        {/* Posts */}
        {posts.length > 0 && (
          <div>
            <div className="px-4 py-2 bg-muted/30 border-b border-border">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                <FileText className="w-3 h-3" /> Posts
              </span>
            </div>
            {posts.map((p: any) => (
              <button key={p.id} onClick={() => handleSelect(p.username ? `/${p.username}` : "/social")}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 active:bg-muted/60 transition-colors text-left border-b border-border/30">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage src={p.profileImageUrl || p.avatarUrl || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-sm">
                    {(p.djName || p.username || "D").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm truncate">{p.content?.slice(0, 80)}{p.content?.length > 80 ? "..." : ""}</p>
                  <p className="text-muted-foreground text-xs">@{p.username} · ❤️ {p.likeCount || 0}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const sheetContentRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Swipe gesture detection
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      const swipeDistance = touchEndX.current - touchStartX.current;
      const minSwipeDistance = 100; // Minimum 100px swipe to close
      
      // Swipe right to close (only if swiping from left edge of sheet)
      if (swipeDistance > minSwipeDistance && touchStartX.current < 50) {
        setMobileMenuOpen(false);
      }
    };

    const sheetElement = sheetContentRef.current;
    if (sheetElement && mobileMenuOpen) {
      sheetElement.addEventListener('touchstart', handleTouchStart);
      sheetElement.addEventListener('touchmove', handleTouchMove);
      sheetElement.addEventListener('touchend', handleTouchEnd);

      return () => {
        sheetElement.removeEventListener('touchstart', handleTouchStart);
        sheetElement.removeEventListener('touchmove', handleTouchMove);
        sheetElement.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [mobileMenuOpen]);
  
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <>
    {mobileSearchOpen && <MobileSearchOverlay onClose={() => setMobileSearchOpen(false)} />}
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer">
            <img src="/logo-new-gradient.webp" alt="ONLYDJS" className="h-10 w-auto" />
            <span className="text-2xl font-bold text-glow-cyan">ONLYDJS</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/explore" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
              <Music className="h-4 w-4" />
              <span>Discover</span>
            </Link>
            
            <Link href="/dj-mode" className="flex items-center space-x-2 text-foreground hover:text-purple-400 transition-colors">
              <Radio className="h-4 w-4" />
              <span className="text-glow-purple">DJ MODE</span>
            </Link>

            {/* Search Bar — before Mainstage */}
            <NavSearchBar />
            
            <Link href="/mainstage" className="flex items-center space-x-2 text-foreground hover:text-accent transition-colors">
              <Sparkles className="h-4 w-4" />
              <span className="text-glow-pink">Mainstage</span>
            </Link>
            
            <Link href="/charts" className="flex items-center space-x-2 text-foreground hover:text-yellow-400 transition-colors">
              <TrendingUp className="h-4 w-4" />
              <span>Charts</span>
            </Link>

            <Link href="/social" className="flex items-center space-x-2 transition-colors group">
              <Zap className="h-4 w-4 text-cyan-400 group-hover:text-purple-400 transition-colors" />
              <span className="font-semibold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">ODJS Social</span>
            </Link>

            {isAuthenticated && user?.membershipStatus !== "free" && (
              <Link href="/upload" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
                <Upload className="h-4 w-4" />
                <span>{t('nav.upload')}</span>
              </Link>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="md:hidden flex items-center gap-1">
            <button
              className="p-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setMobileSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              className="p-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSelector />
            {isAuthenticated ? (
              <>
                {user?.membershipStatus === "free" && (
                  <Link href="/membership">
                    <Button className="btn-neon bg-accent hover:bg-accent/90 glow-pink">
                      <CreditCard className="h-4 w-4 mr-2" />
                      {t('nav.membership')}
                    </Button>
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <div className="text-sm text-left">
                        <p className="font-semibold text-foreground">{user?.name || "DJ"}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {user?.membershipStatus === "member" ? "PRO" : 
                           user?.membershipStatus === "verified" ? "Verified" : "FREE"}
                        </p>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>{t('nav.myProfile')}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user?.username && (
                      <Link href={`/${user.username}`}>
                        <DropdownMenuItem>
                          <User className="mr-2 h-4 w-4" />
                          <span>My Profile</span>
                        </DropdownMenuItem>
                      </Link>
                    )}
                    <Link href="/profile/edit">
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>{t('nav.settings')}</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/dashboard">
                      <DropdownMenuItem>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Creator Hub</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/rankings">
                      <DropdownMenuItem>
                        <Trophy className="mr-2 h-4 w-4" />
                        <span>Network</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/pricing">
                      <DropdownMenuItem>
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Pricing</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/connect-social">
                      <DropdownMenuItem>
                        <Instagram className="mr-2 h-4 w-4" />
                        <span>Conectar Redes</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t('nav.logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button className="btn-neon bg-primary hover:bg-primary/90 glow-cyan">
                  {t('nav.login')}
                </Button>
              </a>
            )}
          </div>

          {/* Mobile Menu Sheet */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <div className="flex items-center space-x-2">
                    <img src="/logo-new-gradient.webp" alt="ONLYDJS" className="h-8 w-auto" />
                    <span className="text-xl font-bold text-glow-cyan">ONLYDJS</span>
                  </div>
                </SheetTitle>
              </SheetHeader>
              
              <div ref={sheetContentRef} className="flex flex-col space-y-4 mt-8">
                {/* Navigation Links */}
                <Link 
                  href="/explore"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Music className="h-5 w-5 text-cyan-400" />
                  <span className="text-lg">Discover</span>
                </Link>
                
                <Link 
                  href="/dj-mode"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Radio className="h-5 w-5 text-purple-400" />
                  <span className="text-lg text-glow-purple">DJ MODE</span>
                </Link>
                
                <Link 
                  href="/mainstage"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Sparkles className="h-5 w-5 text-pink-400" />
                  <span className="text-lg text-glow-pink">Mainstage</span>
                </Link>
                
                <Link 
                  href="/social"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Zap className="h-5 w-5 text-cyan-400" />
                  <span className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">ODJS Social</span>
                </Link>
                
                <Link 
                  href="/dashboard"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="h-5 w-5 text-cyan-400" />
                  <span className="text-lg">Creator Hub</span>
                </Link>

                <Link 
                  href="/pricing"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <CreditCard className="h-5 w-5 text-cyan-400" />
                  <span className="text-lg text-glow-cyan">Pricing</span>
                </Link>
                
                {isAuthenticated && user?.membershipStatus !== "free" && (
                  <Link 
                    href="/upload"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/10 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Upload className="h-5 w-5 text-green-400" />
                    <span className="text-lg">{t('nav.upload')}</span>
                  </Link>
                )}
                
                <div className="border-t border-border pt-4 mt-4">
                  <LanguageSelector />
                </div>
                
                {isAuthenticated ? (
                  <>
                    {user?.membershipStatus === "free" && (
                      <Link href="/membership" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full btn-neon bg-accent hover:bg-accent/90 glow-pink">
                          <CreditCard className="h-4 w-4 mr-2" />
                          {t('nav.membership')}
                        </Button>
                      </Link>
                    )}
                    
                    <div className="border-t border-border pt-4 space-y-2">
                      <div className="flex items-center space-x-3 p-3">
                        <User className="h-5 w-5" />
                        <div>
                          <p className="font-semibold">{user?.name || "DJ"}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {user?.membershipStatus === "member" ? "PRO" : 
                             user?.membershipStatus === "verified" ? "Verified" : "FREE"}
                          </p>
                        </div>
                      </div>
                      
                      {user?.username && (
                        <Link 
                          href={`/${user.username}`}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/10 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <User className="h-5 w-5 text-cyan-400" />
                          <span>My Profile</span>
                        </Link>
                      )}
                      
                      <Link 
                        href="/profile/edit"
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/10 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Settings className="h-5 w-5" />
                        <span>{t('nav.settings')}</span>
                      </Link>

                      <Link 
                        href="/rankings"
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/10 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Trophy className="h-5 w-5 text-yellow-400" />
                        <span>Network</span>
                      </Link>

                      <Link 
                        href="/pricing"
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/10 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <CreditCard className="h-5 w-5 text-cyan-400" />
                        <span>Pricing</span>
                      </Link>
                      
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/10 transition-colors text-left"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>{t('nav.logout')}</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <a href={getLoginUrl()}>
                    <Button className="w-full btn-neon bg-primary hover:bg-primary/90 glow-cyan">
                      {t('nav.login')}
                    </Button>
                  </a>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
    </>  
  );
}
