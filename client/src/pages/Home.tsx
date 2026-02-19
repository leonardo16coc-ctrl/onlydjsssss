import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { Music2, TrendingUp, DollarSign, Sparkles, Shield, Zap, Upload, BarChart3, Brain, Wallet } from "lucide-react";
import MonetizationSection from "@/components/MonetizationSection";
import { useTranslation } from "react-i18next";
import Footer from "@/components/Footer";
import { AIAnalyzer } from "@/components/AIAnalyzer";

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      
      {/* Hero Section - SaaS Positioning */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left: Copy */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
                    The Operating System
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    for DJs
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-xl">
                  Create AI-powered DJ sets, manage your music library, monetize content, and track performance analytics — all from one cloud platform.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/membership">
                  <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg shadow-cyan-500/20">
                    Start Free
                  </Button>
                </Link>
                <Link href="/dj-mode">
                  <Button size="lg" variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800 text-lg px-8 py-6 rounded-xl">
                    View Platform
                  </Button>
                </Link>
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3 pt-4">
                <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-full px-4 py-2">
                  <Brain className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-slate-300">AI Set Generator</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-full px-4 py-2">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-slate-300">Analytics Dashboard</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-full px-4 py-2">
                  <Wallet className="w-4 h-4 text-pink-400" />
                  <span className="text-sm text-slate-300">Monetization Tools</span>
                </div>
              </div>
            </div>

            {/* Right: Dashboard Preview Mockup */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl shadow-cyan-500/10">
                {/* Dashboard Container */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <h3 className="text-lg font-semibold text-white">DJ Dashboard</h3>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                    </div>
                  </div>

                  {/* Analytics Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-xl p-4">
                      <div className="text-xs text-cyan-400 mb-1">Total Streams</div>
                      <div className="text-2xl font-bold text-white">24.5K</div>
                      <div className="text-xs text-green-400 mt-1">+12% this week</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl p-4">
                      <div className="text-xs text-purple-400 mb-1">Earnings</div>
                      <div className="text-2xl font-bold text-white">$1,247</div>
                      <div className="text-xs text-green-400 mt-1">+8% this month</div>
                    </div>
                  </div>

                  {/* Upload Manager */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-white">Upload Manager</div>
                      <Upload className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded"></div>
                        <div className="flex-1">
                          <div className="text-xs text-slate-300">Track_001.wav</div>
                          <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                            <div className="bg-gradient-to-r from-cyan-500 to-purple-500 h-1.5 rounded-full" style={{width: '75%'}}></div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400">75%</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded"></div>
                        <div className="flex-1">
                          <div className="text-xs text-slate-300">Mix_Festival.mp3</div>
                          <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full" style={{width: '45%'}}></div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400">45%</div>
                      </div>
                    </div>
                  </div>

                  {/* AI Set Generator Preview */}
                  <div className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/20 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-pink-400" />
                      <div className="text-sm font-medium text-white">AI Set Generator</div>
                    </div>
                    <div className="text-xs text-slate-400">Analyzing 8 tracks...</div>
                    <div className="flex gap-2">
                      <div className="flex-1 h-12 bg-slate-700/30 rounded border border-slate-600/30"></div>
                      <div className="flex-1 h-12 bg-slate-700/30 rounded border border-slate-600/30"></div>
                      <div className="flex-1 h-12 bg-slate-700/30 rounded border border-slate-600/30"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* AI BPM & Key Analyzer - Free Tool */}
      <AIAnalyzer />

      {/* Featured Section - Create Perfect Set */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-y border-slate-800">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Everything you need to succeed as a DJ
                </span>
              </h2>
              <p className="text-xl text-slate-400">
                Professional tools designed for modern DJs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-slate-900/50 backdrop-blur-sm border-slate-800 hover:border-cyan-500/50 transition-all">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-4">
                    <Brain className="h-6 w-6 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">AI-Powered Sets</h3>
                  <p className="text-sm text-slate-400">Generate perfect DJ sets with AI that understands energy flow and harmonic mixing</p>
                </div>
              </Card>
              
              <Card className="p-6 bg-slate-900/50 backdrop-blur-sm border-slate-800 hover:border-purple-500/50 transition-all">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">Performance Analytics</h3>
                  <p className="text-sm text-slate-400">Track downloads, streams, and earnings with real-time dashboards</p>
                </div>
              </Card>
              
              <Card className="p-6 bg-slate-900/50 backdrop-blur-sm border-slate-800 hover:border-pink-500/50 transition-all">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center mb-4">
                    <Wallet className="h-6 w-6 text-pink-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">Monetization Tools</h3>
                  <p className="text-sm text-slate-400">Upload your tracks and earn from every download with transparent revenue sharing</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-950">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                How It Works
              </h2>
              <p className="text-xl text-slate-400">
                Get started in minutes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/20">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">Sign Up Free</h3>
                  <p className="text-slate-400">Create your account and access the platform instantly</p>
                </div>
              </div>

              <div className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">Upload & Analyze</h3>
                  <p className="text-slate-400">Upload your tracks and let AI analyze BPM, key, and energy</p>
                </div>
              </div>

              <div className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-pink-500/20">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">Create & Earn</h3>
                  <p className="text-slate-400">Generate AI sets, share your music, and start earning</p>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link href="/membership">
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white text-lg px-10 py-6 rounded-xl shadow-lg shadow-cyan-500/20">
                  Get Started Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Monetization Section */}
      <MonetizationSection />

      {/* Features Grid */}
      <section className="py-20 bg-slate-950">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Built for Professional DJs
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <Music2 className="h-8 w-8 text-cyan-400 mb-4" />
                <h3 className="text-lg font-bold mb-2 text-white">Smart Music Library</h3>
                <p className="text-sm text-slate-400">Organize thousands of tracks with AI-powered tagging and search</p>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <Sparkles className="h-8 w-8 text-purple-400 mb-4" />
                <h3 className="text-lg font-bold mb-2 text-white">AI Recommendations</h3>
                <p className="text-sm text-slate-400">Get personalized track suggestions based on your DJ style</p>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <TrendingUp className="h-8 w-8 text-pink-400 mb-4" />
                <h3 className="text-lg font-bold mb-2 text-white">Trending Insights</h3>
                <p className="text-sm text-slate-400">See what's hot in your genre before everyone else</p>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <DollarSign className="h-8 w-8 text-green-400 mb-4" />
                <h3 className="text-lg font-bold mb-2 text-white">Revenue Dashboard</h3>
                <p className="text-sm text-slate-400">Track earnings, downloads, and payouts in real-time</p>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <Shield className="h-8 w-8 text-blue-400 mb-4" />
                <h3 className="text-lg font-bold mb-2 text-white">Secure Storage</h3>
                <p className="text-sm text-slate-400">Cloud-based library with automatic backups</p>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <Zap className="h-8 w-8 text-yellow-400 mb-4" />
                <h3 className="text-lg font-bold mb-2 text-white">Lightning Fast</h3>
                <p className="text-sm text-slate-400">Instant uploads, downloads, and analysis</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
