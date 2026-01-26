import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { Music2, TrendingUp, DollarSign, Sparkles, Shield, Zap, Upload } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-club">
      <Navbar />
      
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-neon opacity-10"></div>
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-glow-cyan">
              La Plataforma #1 para DJs
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              Descarga, sube y monetiza música profesional. Extended Mixes, Edits, Mashups y más.
            </p>
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-cyan-500/30 rounded-lg px-6 py-3 mb-8">
              <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
              <p className="text-lg font-semibold text-white">
                IA + Música + Sets + Inteligencia = DJ MODE
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/explore">
                <Button size="lg" className="btn-neon bg-primary hover:bg-primary/90 glow-cyan text-lg px-8">
                  <Music2 className="mr-2 h-5 w-5" />
                  Explorar Música
                </Button>
              </Link>
              <Link href="/upload">
                <Button size="lg" className="btn-neon bg-secondary hover:bg-secondary/90 glow-purple text-lg px-8">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Your Files
                </Button>
              </Link>
              <Link href="/membership">
                <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground text-lg px-8">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Suscribirse por $4.99/mes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background/50">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-12 text-glow-purple">
            ¿Por qué ONLYDJS?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-neon p-6 bg-card border-border">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-primary/20 rounded-lg glow-cyan">
                  <Music2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Música Profesional</h3>
              </div>
              <p className="text-muted-foreground">
                Extended Mixes, Edits, Mashups, Remixes y Reworks en MP3 320kbps y WAV.
              </p>
            </Card>

            <Card className="card-neon p-6 bg-card border-border">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-accent/20 rounded-lg glow-pink">
                  <Sparkles className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold">MAINSTAGE EDITS</h3>
              </div>
              <p className="text-muted-foreground">
                Tracks exclusivos para festivales y big stages. Festival Weapons, Peak Time, Anthems.
              </p>
            </Card>

            <Card className="card-neon p-6 bg-card border-border">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-secondary/20 rounded-lg glow-purple">
                  <DollarSign className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold">Monetización</h3>
              </div>
              <p className="text-muted-foreground">
                Gana dinero por cada descarga. 60% para DJs, 40% para la plataforma.
              </p>
            </Card>

            <Card className="card-neon p-6 bg-card border-border">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-primary/20 rounded-lg glow-cyan">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Rankings & Stats</h3>
              </div>
              <p className="text-muted-foreground">
                Top 100 DJs, Trending tracks, estadísticas en tiempo real y analytics completos.
              </p>
            </Card>

            <Card className="card-neon p-6 bg-card border-border">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-secondary/20 rounded-lg glow-purple">
                  <Zap className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold">IA Musical</h3>
              </div>
              <p className="text-muted-foreground">
                Detección automática de BPM, Key, drops y energía. Recomendaciones inteligentes.
              </p>
            </Card>

            <Card className="card-neon p-6 bg-card border-border">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-accent/20 rounded-lg glow-pink">
                  <Shield className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold">Protección Total</h3>
              </div>
              <p className="text-muted-foreground">
                Sistema antifraude, watermarks inaudibles y protección contra bots.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-border">
        <div className="container text-center text-muted-foreground">
          <p>&copy; 2026 ONLYDJS. La mejor plataforma de música para DJs.</p>
        </div>
      </footer>
    </div>
  );
}