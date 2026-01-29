import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { Music2, TrendingUp, DollarSign, Sparkles, Shield, Zap, Upload } from "lucide-react";
import MonetizationSection from "@/components/MonetizationSection";
import { useTranslation } from "react-i18next";
import { getLocalizedPath, getLanguageFromPath } from "@/lib/routes";
import { useLocation } from "wouter";
import Footer from "@/components/Footer";

export default function Home() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const currentLang = getLanguageFromPath(location) as any;

  return (
    <div className="min-h-screen bg-gradient-club">
      <Navbar />
      
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-neon opacity-10"></div>
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-glow-cyan">
              {t('home.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              {t('home.hero.subtitle')}
            </p>
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-cyan-500/30 rounded-lg px-6 py-3 mb-8">
              <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
              <p className="text-lg font-semibold text-white">
                {t('home.hero.aiTagline')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={getLocalizedPath("explore", currentLang)}>
                <Button size="lg" className="btn-neon bg-primary hover:bg-primary/90 glow-cyan text-lg px-8">
                  <Music2 className="mr-2 h-5 w-5" />
                  {t('home.hero.exploreMusic')}
                </Button>
              </Link>
              <Link href={getLocalizedPath("upload", currentLang)}>
                <Button size="lg" className="btn-neon bg-secondary hover:bg-secondary/90 glow-purple text-lg px-8">
                  <Upload className="mr-2 h-5 w-5" />
                  {t('home.hero.uploadFiles')}
                </Button>
              </Link>
              <Link href={getLocalizedPath("membership", currentLang)}>
                <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground text-lg px-8">
                  <Sparkles className="mr-2 h-5 w-5" />
                  {t('home.hero.subscribe')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Monetization Section */}
      <MonetizationSection />

      <section className="py-20 bg-background/50">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-12 text-glow-purple">
            {t('home.whySection.title')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-neon p-6 bg-card border-border">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-primary/20 rounded-lg glow-cyan">
                  <Music2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">{t('home.whySection.professionalMusic.title')}</h3>
              </div>
              <p className="text-muted-foreground">
                {t('home.whySection.professionalMusic.description')}
              </p>
            </Card>

            <Card className="card-neon p-6 bg-card border-border">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-accent/20 rounded-lg glow-pink">
                  <Sparkles className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold">{t('home.whySection.mainstageEdits.title')}</h3>
              </div>
              <p className="text-muted-foreground">
                {t('home.whySection.mainstageEdits.description')}
              </p>
            </Card>

            <Card className="card-neon p-6 bg-card border-border">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-secondary/20 rounded-lg glow-purple">
                  <DollarSign className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold">{t('home.whySection.monetization.title')}</h3>
              </div>
              <p className="text-muted-foreground">
                {t('home.whySection.monetization.description')}
              </p>
            </Card>

            <Card className="card-neon p-6 bg-card border-border">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-primary/20 rounded-lg glow-cyan">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">{t('home.whySection.rankings.title')}</h3>
              </div>
              <p className="text-muted-foreground">
                {t('home.whySection.rankings.description')}
              </p>
            </Card>

            <Card className="card-neon p-6 bg-card border-border">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-secondary/20 rounded-lg glow-purple">
                  <Zap className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold">{t('home.whySection.aiMusic.title')}</h3>
              </div>
              <p className="text-muted-foreground">
                {t('home.whySection.aiMusic.description')}
              </p>
            </Card>

            <Card className="card-neon p-6 bg-card border-border">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-accent/20 rounded-lg glow-pink">
                  <Shield className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold">{t('home.whySection.protection.title')}</h3>
              </div>
              <p className="text-muted-foreground">
                {t('home.whySection.protection.description')}
              </p>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
