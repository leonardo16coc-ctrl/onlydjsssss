import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Music, Sparkles, Trophy, LayoutDashboard, Upload, CreditCard, User, Settings, LogOut, Radio } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
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

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <a className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="ONLYDJS" className="h-10 w-auto" />
              <span className="text-2xl font-bold text-glow-cyan">ONLYDJS</span>
            </a>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/explore">
              <a className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
                <Music className="h-4 w-4" />
                <span>{t('nav.explore')}</span>
              </a>
            </Link>
            
            <Link href="/dj-mode">
              <a className="flex items-center space-x-2 text-foreground hover:text-purple-400 transition-colors">
                <Radio className="h-4 w-4" />
                <span className="text-glow-purple">{t('nav.djMode')}</span>
              </a>
            </Link>
            
            <Link href="/mainstage">
              <a className="flex items-center space-x-2 text-foreground hover:text-accent transition-colors">
                <Sparkles className="h-4 w-4" />
                <span className="text-glow-pink">{t('nav.mainstage')}</span>
              </a>
            </Link>
            
            <Link href="/rankings">
              <a className="flex items-center space-x-2 text-foreground hover:text-secondary transition-colors">
                <Trophy className="h-4 w-4" />
                <span>{t('nav.rankings')}</span>
              </a>
            </Link>

            <Link href="/dashboard">
              <a className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
                <LayoutDashboard className="h-4 w-4" />
                <span>{t('nav.dashboard')}</span>
              </a>
            </Link>
            
            {isAuthenticated && user?.membershipStatus !== "free" && (
              <Link href="/upload">
                <a className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
                  <Upload className="h-4 w-4" />
                  <span>{t('nav.upload')}</span>
                </a>
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
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
                        <span>{t('nav.dashboard')}</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                      trpc.auth.logout.useMutation().mutate();
                      window.location.href = "/";
                    }}>
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
        </div>
      </div>
    </nav>
  );
}
