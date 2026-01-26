import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Music, Sparkles, Trophy, LayoutDashboard, Upload, CreditCard } from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();

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
                <span>Explorar</span>
              </a>
            </Link>
            
            <Link href="/mainstage">
              <a className="flex items-center space-x-2 text-foreground hover:text-accent transition-colors">
                <Sparkles className="h-4 w-4" />
                <span className="text-glow-pink">MAINSTAGE</span>
              </a>
            </Link>
            
            <Link href="/rankings">
              <a className="flex items-center space-x-2 text-foreground hover:text-secondary transition-colors">
                <Trophy className="h-4 w-4" />
                <span>Rankings</span>
              </a>
            </Link>

            {isAuthenticated && (
              <>
                <Link href="/dashboard">
                  <a className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </a>
                </Link>
                
                {user?.membershipStatus !== "free" && (
                  <Link href="/upload">
                    <a className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
                      <Upload className="h-4 w-4" />
                      <span>Subir</span>
                    </a>
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {user?.membershipStatus === "free" && (
                  <Link href="/membership">
                    <Button className="btn-neon bg-accent hover:bg-accent/90 glow-pink">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Suscribirse
                    </Button>
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">{user?.name || "DJ"}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user?.membershipStatus === "member" ? "Miembro" : 
                       user?.membershipStatus === "verified" ? "Verificado" : "Free"}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button className="btn-neon bg-primary hover:bg-primary/90 glow-cyan">
                  Iniciar Sesión
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
