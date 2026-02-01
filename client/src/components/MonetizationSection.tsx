import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, TrendingUp, Users, Sparkles, Crown, Music, Download,
  BarChart3, Wallet, Globe, Zap, CheckCircle2, ArrowRight, Target,
  Shield, Clock, Headphones
} from "lucide-react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";

/**
 * MonetizationSection - Complete explanation of ONLYDJS platform
 * Shows how DJs monetize their impact, not just their tracks
 */
export default function MonetizationSection() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background via-purple-950/10 to-background">
      <div className="container max-w-7xl">
        
        {/* Hero Introduction */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full mb-6 animate-pulse">
            <span className="text-4xl">🎧</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {t("monetization.hero.title")}
          </h1>
          
          <p className="text-2xl md:text-3xl text-foreground font-semibold mb-4">
            {t("monetization.hero.tagline")}
          </p>
          
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-6 leading-relaxed">
            {t("monetization.hero.description")}
          </p>
          
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full">
            <ArrowRight className="h-5 w-5 text-purple-400" />
            <span className="text-lg font-semibold text-purple-300">{t("monetization.hero.priceTag")}</span>
          </div>
        </div>

        {/* What is ONLYDJS */}
        <Card className="p-8 md:p-12 bg-gradient-to-br from-cyan-950/30 via-background to-purple-950/30 border-cyan-500/30 backdrop-blur-xl mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-8 w-8 text-cyan-400" />
            <h2 className="text-3xl md:text-4xl font-bold">{t("monetization.whatIs.title")}</h2>
          </div>
          
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            {t("monetization.whatIs.intro")}
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-cyan-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-lg mb-1">{t("monetization.whatIs.point1")}</h4>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-cyan-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-lg mb-1">{t("monetization.whatIs.point2")}</h4>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-cyan-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-lg mb-1">{t("monetization.whatIs.point3")}</h4>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-cyan-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-lg mb-1">{t("monetization.whatIs.point4")}</h4>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <p className="text-lg font-semibold mb-2">{t("monetization.whatIs.notOneByOne")}</p>
            <p className="text-muted-foreground">
              <ArrowRight className="inline h-5 w-5 text-purple-400 mr-2" />
              {t("monetization.whatIs.platformBased")}
            </p>
          </div>
        </Card>

        {/* How It Works */}
        <div className="mb-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <Zap className="h-8 w-8 text-yellow-400" />
              {t("monetization.howItWorks.title")}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* For DJs */}
            <Card className="p-8 bg-gradient-to-br from-purple-950/50 to-pink-950/50 border-purple-500/30">
              <div className="flex items-center gap-3 mb-6">
                <Music className="h-7 w-7 text-purple-400" />
                <h3 className="text-2xl font-bold">{t("monetization.howItWorks.forDJs.title")}</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <p className="text-muted-foreground pt-1">{t("monetization.howItWorks.forDJs.step1")}</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <p className="text-muted-foreground pt-1">{t("monetization.howItWorks.forDJs.step2")}</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <p className="text-muted-foreground pt-1">{t("monetization.howItWorks.forDJs.step3")}</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <p className="text-muted-foreground pt-1">{t("monetization.howItWorks.forDJs.step4")}</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-sm font-semibold text-green-400">{t("monetization.howItWorks.forDJs.motto")}</p>
              </div>
            </Card>

            {/* For Users */}
            <Card className="p-8 bg-gradient-to-br from-cyan-950/50 to-blue-950/50 border-cyan-500/30">
              <div className="flex items-center gap-3 mb-6">
                <Headphones className="h-7 w-7 text-cyan-400" />
                <h3 className="text-2xl font-bold">{t("monetization.howItWorks.forUsers.title")}</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">{t("monetization.howItWorks.forUsers.feature1")}</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">{t("monetization.howItWorks.forUsers.feature2")}</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">{t("monetization.howItWorks.forUsers.feature3")}</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">{t("monetization.howItWorks.forUsers.feature4")}</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <p className="text-sm font-semibold text-cyan-400">{t("monetization.howItWorks.forUsers.oneMembership")}</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Fair Earnings Model */}
        <Card className="p-8 md:p-12 bg-gradient-to-br from-green-950/30 via-background to-cyan-950/30 border-green-500/30 backdrop-blur-xl mb-12">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="h-8 w-8 text-green-400" />
            <h2 className="text-3xl md:text-4xl font-bold">{t("monetization.fairModel.title")}</h2>
          </div>
          
          <p className="text-lg text-muted-foreground mb-8">{t("monetization.fairModel.intro")}</p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="text-5xl font-bold text-green-400 mb-2">50%</div>
              <p className="text-lg font-semibold mb-1">{t("monetization.fairModel.djsShare")}</p>
              <p className="text-sm text-muted-foreground">{t("monetization.fairModel.djsShareDesc")}</p>
            </div>
            <div className="p-6 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <div className="text-5xl font-bold text-purple-400 mb-2">50%</div>
              <p className="text-lg font-semibold mb-1">{t("monetization.fairModel.platformShare")}</p>
              <p className="text-sm text-muted-foreground">{t("monetization.fairModel.platformShareDesc")}</p>
            </div>
          </div>
          
          <div className="p-6 bg-card/50 border border-border rounded-lg mb-6">
            <h4 className="font-bold text-lg mb-4">{t("monetization.fairModel.djDistribution")}</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-cyan-400" />
                <span className="text-muted-foreground">{t("monetization.fairModel.downloads")}</span>
              </div>
              <div className="flex items-center gap-3">
                <Music className="h-5 w-5 text-purple-400" />
                <span className="text-muted-foreground">{t("monetization.fairModel.streams")}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-pink-400" />
                <span className="text-muted-foreground">{t("monetization.fairModel.listeningTime")}</span>
              </div>
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-green-400" />
                <span className="text-muted-foreground">{t("monetization.fairModel.engagement")}</span>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-lg font-semibold text-yellow-400 flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              {t("monetization.fairModel.notPerTrack")}
            </p>
          </div>
        </Card>

        {/* Professional Dashboard */}
        <Card className="p-8 md:p-12 bg-gradient-to-br from-purple-950/30 via-background to-pink-950/30 border-purple-500/30 backdrop-blur-xl mb-12">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="h-8 w-8 text-purple-400" />
            <h2 className="text-3xl md:text-4xl font-bold">{t("monetization.dashboard.title")}</h2>
          </div>
          
          <p className="text-lg text-muted-foreground mb-8">{t("monetization.dashboard.intro")}</p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-card/50 border border-border rounded-lg">
              <Download className="h-6 w-6 text-cyan-400 mb-2" />
              <p className="text-sm font-semibold">{t("monetization.dashboard.totalDownloads")}</p>
            </div>
            <div className="p-4 bg-card/50 border border-border rounded-lg">
              <Music className="h-6 w-6 text-purple-400 mb-2" />
              <p className="text-sm font-semibold">{t("monetization.dashboard.streams")}</p>
            </div>
            <div className="p-4 bg-card/50 border border-border rounded-lg">
              <Clock className="h-6 w-6 text-pink-400 mb-2" />
              <p className="text-sm font-semibold">{t("monetization.dashboard.listeningTime")}</p>
            </div>
            <div className="p-4 bg-card/50 border border-border rounded-lg">
              <Target className="h-6 w-6 text-green-400 mb-2" />
              <p className="text-sm font-semibold">{t("monetization.dashboard.monthlyScore")}</p>
            </div>
            <div className="p-4 bg-card/50 border border-border rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-400 mb-2" />
              <p className="text-sm font-semibold">{t("monetization.dashboard.participation")}</p>
            </div>
            <div className="p-4 bg-card/50 border border-border rounded-lg">
              <DollarSign className="h-6 w-6 text-green-400 mb-2" />
              <p className="text-sm font-semibold">{t("monetization.dashboard.earnings")}</p>
            </div>
            <div className="p-4 bg-card/50 border border-border rounded-lg">
              <Wallet className="h-6 w-6 text-cyan-400 mb-2" />
              <p className="text-sm font-semibold">{t("monetization.dashboard.wallet")}</p>
            </div>
            <div className="p-4 bg-card/50 border border-border rounded-lg">
              <Shield className="h-6 w-6 text-purple-400 mb-2" />
              <p className="text-sm font-semibold">{t("monetization.dashboard.monthlyPayments")}</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <p className="text-sm font-semibold text-purple-300">{t("monetization.dashboard.realTime")}</p>
          </div>
        </Card>

        {/* Ambassador Program */}
        <Card className="p-8 md:p-12 bg-gradient-to-br from-pink-950/30 via-background to-purple-950/30 border-pink-500/30 backdrop-blur-xl mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Users className="h-8 w-8 text-pink-400" />
            <h2 className="text-3xl md:text-4xl font-bold">{t("monetization.ambassador.title")}</h2>
          </div>
          
          <p className="text-lg text-muted-foreground mb-8">{t("monetization.ambassador.intro")}</p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="p-6 bg-card/50 border border-border rounded-lg text-center">
              <div className="text-4xl font-bold text-pink-400 mb-2">1</div>
              <p className="text-sm text-muted-foreground">{t("monetization.ambassador.step1")}</p>
            </div>
            <div className="p-6 bg-card/50 border border-border rounded-lg text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">2</div>
              <p className="text-sm text-muted-foreground">{t("monetization.ambassador.step2")}</p>
            </div>
            <div className="p-6 bg-card/50 border border-border rounded-lg text-center">
              <div className="text-4xl font-bold text-cyan-400 mb-2">3</div>
              <p className="text-sm text-muted-foreground">{t("monetization.ambassador.step3")}</p>
            </div>
          </div>
          
          <div className="p-6 bg-pink-500/10 border border-pink-500/30 rounded-lg">
            <p className="text-lg font-semibold text-pink-400 flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              {t("monetization.ambassador.motto")}</p>
          </div>
        </Card>

        {/* Automatic Payments */}
        <Card className="p-8 md:p-12 bg-gradient-to-br from-cyan-950/30 via-background to-green-950/30 border-cyan-500/30 backdrop-blur-xl mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Wallet className="h-8 w-8 text-cyan-400" />
            <h2 className="text-3xl md:text-4xl font-bold">{t("monetization.payments.title")}</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-cyan-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-lg mb-1">{t("monetization.payments.feature1")}</h4>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-cyan-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-lg mb-1">{t("monetization.payments.feature2")}</h4>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-cyan-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-lg mb-1">{t("monetization.payments.feature3")}</h4>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-cyan-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-lg mb-1">{t("monetization.payments.feature4")}</h4>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-sm font-semibold text-green-400">{t("monetization.payments.motto")}</p>
          </div>
        </Card>

        {/* Designed for Real DJs */}
        <Card className="p-8 md:p-12 bg-gradient-to-br from-purple-950/30 via-background to-cyan-950/30 border-purple-500/30 backdrop-blur-xl mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="h-8 w-8 text-purple-400" />
            <h2 className="text-3xl md:text-4xl font-bold">{t("monetization.realDJs.title")}</h2>
          </div>
          
          <p className="text-lg text-muted-foreground mb-8">{t("monetization.realDJs.intro")}</p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-card/50 border border-border rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-purple-400 mb-2" />
              <p className="font-semibold">{t("monetization.realDJs.type1")}</p>
            </div>
            <div className="p-4 bg-card/50 border border-border rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-pink-400 mb-2" />
              <p className="font-semibold">{t("monetization.realDJs.type2")}</p>
            </div>
            <div className="p-4 bg-card/50 border border-border rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-cyan-400 mb-2" />
              <p className="font-semibold">{t("monetization.realDJs.type3")}</p>
            </div>
            <div className="p-4 bg-card/50 border border-border rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-400 mb-2" />
              <p className="font-semibold">{t("monetization.realDJs.type4")}</p>
            </div>
            <div className="p-4 bg-card/50 border border-border rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-yellow-400 mb-2" />
              <p className="font-semibold">{t("monetization.realDJs.type5")}</p>
            </div>
          </div>
        </Card>

        {/* Final CTA */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full mb-6">
            <Crown className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium text-purple-300">{t("monetization.cta.badge")}</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{t("monetization.cta.title")}</h2>
          
          <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            <div className="p-4 bg-card/50 border border-border rounded-lg">
              <Headphones className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
              <p className="text-sm font-semibold">{t("monetization.cta.feature1")}</p>
            </div>
            <div className="p-4 bg-card/50 border border-border rounded-lg">
              <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm font-semibold">{t("monetization.cta.feature2")}</p>
            </div>
            <div className="p-4 bg-card/50 border border-border rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <p className="text-sm font-semibold">{t("monetization.cta.feature3")}</p>
            </div>
            <div className="p-4 bg-card/50 border border-border rounded-lg">
              <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-sm font-semibold">{t("monetization.cta.feature4")}</p>
            </div>
          </div>
          
          <Button
            size="lg"
            onClick={() => setLocation("/membership")}
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-white font-bold px-12 py-8 text-xl shadow-2xl shadow-purple-500/50 mb-4"
          >
            <Crown className="h-6 w-6 mr-3" />
            {t("monetization.cta.button")}
            <Sparkles className="h-6 w-6 ml-3" />
          </Button>
          
          <p className="text-lg text-muted-foreground">
            {t("monetization.cta.price")}
          </p>
        </div>
      </div>
    </section>
  );
}
