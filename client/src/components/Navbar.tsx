import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Music, Sparkles, Trophy, LayoutDashboard, Upload, CreditCard, User, Settings, LogOut, Radio, Menu, X, TrendingUp } from "lucide-react";
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

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
            
            <Link href="/mainstage" className="flex items-center space-x-2 text-foreground hover:text-accent transition-colors">
              <Sparkles className="h-4 w-4" />
              <span className="text-glow-pink">Mainstage</span>
            </Link>
            
            <Link href="/charts" className="flex items-center space-x-2 text-foreground hover:text-yellow-400 transition-colors">
              <TrendingUp className="h-4 w-4" />
              <span>Charts</span>
            </Link>

            <Link href="/rankings" className="flex items-center space-x-2 text-foreground hover:text-secondary transition-colors">
              <Trophy className="h-4 w-4" />
              <span>Network</span>
            </Link>

            <Link href="/dashboard" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
              <LayoutDashboard className="h-4 w-4" />
              <span>Creator Hub</span>
            </Link>

            <Link href="/pricing" className="flex items-center space-x-2 text-foreground hover:text-cyan-400 transition-colors">
              <CreditCard className="h-4 w-4" />
              <span className="text-glow-cyan">Pricing</span>
            </Link>
            
            {isAuthenticated && user?.membershipStatus !== "free" && (
              <Link href="/upload" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
                <Upload className="h-4 w-4" />
                <span>{t('nav.upload')}</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>

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
                  href="/rankings"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  <span className="text-lg">Network</span>
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
                      
                      <Link 
                        href="/profile/edit"
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/10 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Settings className="h-5 w-5" />
                        <span>{t('nav.settings')}</span>
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
  );
}
