import { useRoute } from "wouter";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { 
  User, 
  Music2, 
  Download, 
  DollarSign, 
  Trophy,
  MapPin,
  CheckCircle2,
  Instagram,
  Twitter,
  Globe,
  Play,
  Heart
} from "lucide-react";
import { Loader2 } from "lucide-react";

export default function DJProfile() {
  const [, params] = useRoute("/dj/:username");
  const username = params?.username || "";

  const { data: profile, isLoading, error } = trpc.profile.getByUsername.useQuery(
    { username },
    { enabled: !!username }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">DJ no encontrado</h1>
          <p className="text-muted-foreground">El perfil que buscas no existe.</p>
        </div>
      </div>
    );
  }

  const socialLinks = profile.socialLinks || {};

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-club">
        <div className="absolute inset-0 bg-gradient-neon opacity-10"></div>
        <div className="container relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Profile Image */}
            <div className="relative">
              {profile.profileImageUrl ? (
                <img
                  src={profile.profileImageUrl}
                  alt={profile.djName || profile.name || "DJ"}
                  className="w-48 h-48 rounded-full object-cover border-4 border-primary glow-cyan"
                />
              ) : (
                <div className="w-48 h-48 rounded-full bg-card border-4 border-primary glow-cyan flex items-center justify-center">
                  <User className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
              {profile.isVerified && (
                <div className="absolute bottom-2 right-2 bg-primary rounded-full p-2 glow-cyan">
                  <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-bold text-glow-cyan">
                  {profile.djName || profile.name}
                </h1>
                {profile.membershipStatus === "verified" && (
                  <Badge className="bg-accent text-accent-foreground glow-pink">
                    DJ Verificado
                  </Badge>
                )}
                {profile.membershipStatus === "member" && (
                  <Badge className="bg-secondary text-secondary-foreground glow-purple">
                    DJ Miembro
                  </Badge>
                )}
              </div>
              
              <p className="text-xl text-muted-foreground mb-4">@{profile.username}</p>

              {profile.country && (
                <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">{profile.country}</span>
                </div>
              )}

              {/* Social Links */}
              {Object.keys(socialLinks).length > 0 && (
                <div className="flex gap-3 justify-center md:justify-start mb-6">
                  {socialLinks.instagram && (
                    <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="gap-2">
                        <Instagram className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                  {socialLinks.twitter && (
                    <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="gap-2">
                        <Twitter className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                  {socialLinks.website && (
                    <a href={socialLinks.website} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="gap-2">
                        <Globe className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-card/50 border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Download className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Descargas</span>
                  </div>
                  <p className="text-2xl font-bold">{profile.stats.totalDownloads.toLocaleString()}</p>
                </Card>

                <Card className="p-4 bg-card/50 border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Music2 className="h-4 w-4 text-secondary" />
                    <span className="text-sm text-muted-foreground">Tracks</span>
                  </div>
                  <p className="text-2xl font-bold">{profile.stats.totalTracks}</p>
                </Card>

                <Card className="p-4 bg-card/50 border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-accent" />
                    <span className="text-sm text-muted-foreground">Ganancias</span>
                  </div>
                  <p className="text-2xl font-bold">${profile.stats.totalEarnings.toFixed(2)}</p>
                </Card>

                <Card className="p-4 bg-card/50 border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Ranking</span>
                  </div>
                  <p className="text-2xl font-bold">#{profile.stats.ranking}</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bio Section */}
      {profile.bio && (
        <section className="py-12 bg-background/50">
          <div className="container max-w-4xl">
            <Card className="card-neon p-8 bg-card">
              <h2 className="text-2xl font-bold mb-4 text-glow-purple">Biografía</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
            </Card>
          </div>
        </section>
      )}

      {/* Genres Section */}
      {profile.genres && profile.genres.length > 0 && (
        <section className="py-12">
          <div className="container max-w-4xl">
            <Card className="card-neon p-8 bg-card">
              <h2 className="text-2xl font-bold mb-6 text-glow-cyan">Géneros Principales</h2>
              <div className="flex flex-wrap gap-3">
                {profile.genres.map((genre) => (
                  <Badge
                    key={genre.genre}
                    className="text-lg py-2 px-4 bg-primary/20 text-primary border-primary"
                  >
                    {genre.genre} ({genre.count})
                  </Badge>
                ))}
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Tracks Section */}
      <section className="py-12 bg-background/50">
        <div className="container max-w-6xl">
          <h2 className="text-3xl font-bold mb-8 text-glow-purple">Tracks Recientes</h2>
          
          {profile.tracks.length === 0 ? (
            <Card className="p-12 text-center bg-card">
              <Music2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Este DJ aún no ha subido tracks.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.tracks.map((track) => (
                <Card key={track.id} className="card-neon p-6 bg-card hover:border-primary transition-colors">
                  {track.coverImageUrl && (
                    <img
                      src={track.coverImageUrl}
                      alt={track.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  
                  <h3 className="text-xl font-bold mb-2 line-clamp-1">{track.title}</h3>
                  <p className="text-muted-foreground mb-3 line-clamp-1">{track.artist}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="text-xs">
                      {track.genre}
                    </Badge>
                    {track.bpm && (
                      <Badge variant="outline" className="text-xs">
                        {track.bpm} BPM
                      </Badge>
                    )}
                    {track.musicalKey && (
                      <Badge variant="outline" className="text-xs">
                        {track.musicalKey}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">
                      <Play className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" variant="outline">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
