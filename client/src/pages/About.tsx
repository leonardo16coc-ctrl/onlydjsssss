import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Music2, Target, Eye, Heart, Users, Zap, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t('about.title')}
              </span>
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              {t('about.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-slate-900/50">
        <div className="container">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 hover:border-cyan-500/40 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center">
                  <Target className="w-8 h-8 text-cyan-400" />
                </div>
                <h2 className="text-3xl font-bold text-white">{t('about.mission.title')}</h2>
              </div>
              <p className="text-lg text-slate-300 leading-relaxed">
                {t('about.mission.description')}
              </p>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20 hover:border-purple-500/40 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                  <Eye className="w-8 h-8 text-purple-400" />
                </div>
                <h2 className="text-3xl font-bold text-white">{t('about.vision.title')}</h2>
              </div>
              <p className="text-lg text-slate-300 leading-relaxed">
                {t('about.vision.description')}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-white">{t('about.story.title')}</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mx-auto rounded-full"></div>
            </div>

            <Card className="p-8 bg-slate-900/50 border-slate-800">
              <p className="text-lg text-slate-300 leading-relaxed mb-6">
                {t('about.story.paragraph1')}
              </p>
              <p className="text-lg text-slate-300 leading-relaxed mb-6">
                {t('about.story.paragraph2')} <span className="text-cyan-400 font-semibold">{t('about.story.question')}</span> {t('about.story.paragraph3')}
              </p>
              <p className="text-lg text-slate-300 leading-relaxed">
                {t('about.story.paragraph4')} <span className="text-purple-400 font-bold">{t('about.story.stat1')}</span> {t('about.story.paragraph5')} <span className="text-pink-400 font-bold">{t('about.story.stat2')}</span> {t('about.story.paragraph6')} <span className="text-cyan-400 font-bold">{t('about.story.stat3')}</span> {t('about.story.paragraph7')}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-slate-900/50">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-white">{t('about.values.title')}</h2>
              <p className="text-xl text-slate-400">{t('about.values.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-all text-center group">
                <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-cyan-500/20 transition-colors">
                  <Heart className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t('about.values.creatorFirst.title')}</h3>
                <p className="text-sm text-slate-400">{t('about.values.creatorFirst.description')}</p>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800 hover:border-purple-500/50 transition-all text-center group">
                <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500/20 transition-colors">
                  <Zap className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t('about.values.innovation.title')}</h3>
                <p className="text-sm text-slate-400">{t('about.values.innovation.description')}</p>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800 hover:border-pink-500/50 transition-all text-center group">
                <div className="w-16 h-16 bg-pink-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-pink-500/20 transition-colors">
                  <Eye className="w-8 h-8 text-pink-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t('about.values.transparency.title')}</h3>
                <p className="text-sm text-slate-400">{t('about.values.transparency.description')}</p>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-all text-center group">
                <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-cyan-500/20 transition-colors">
                  <Users className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t('about.values.community.title')}</h3>
                <p className="text-sm text-slate-400">{t('about.values.community.description')}</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-white">{t('about.stats.title')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent mb-2">
                  10K+
                </div>
                <p className="text-lg text-slate-400">{t('about.stats.activeDJs')}</p>
              </div>

              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-2">
                  500K+
                </div>
                <p className="text-lg text-slate-400">{t('about.stats.tracksUploaded')}</p>
              </div>

              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent mb-2">
                  2M+
                </div>
                <p className="text-lg text-slate-400">{t('about.stats.totalDownloads')}</p>
              </div>

              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  $500K+
                </div>
                <p className="text-lg text-slate-400">{t('about.stats.paidToCreators')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
