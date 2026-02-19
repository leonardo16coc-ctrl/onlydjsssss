import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { Music2, TrendingUp, DollarSign, Sparkles, Shield, Zap, Upload, BarChart3, Brain, Wallet, Users, Star, CheckCircle2, ArrowRight } from "lucide-react";
import MonetizationSection from "@/components/MonetizationSection";
import { useTranslation } from "react-i18next";
import Footer from "@/components/Footer";
import { AIAnalyzer } from "@/components/AIAnalyzer";
import TrackCarousel from "@/components/TrackCarousel";
import { trpc } from "@/lib/trpc";

function FeaturedTracksSection() {
  const { data: tracks, isLoading } = trpc.tracks.list.useQuery({
    limit: 12,
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-slate-950 border-b border-slate-800">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Trending Tracks
              </span>
            </h2>
            <p className="text-slate-400">Discover what DJs are uploading right now</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!tracks || tracks.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-slate-950 border-b border-slate-800">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Trending Tracks
            </span>
          </h2>
          <p className="text-slate-400">Discover what DJs are uploading right now</p>
        </div>
        <TrackCarousel tracks={tracks} />
      </div>
    </section>
  );
}

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
                <Link href="/upload">
                  <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg shadow-pink-500/20 transition-all hover:scale-105">
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Track
                  </Button>
                </Link>
                <Link href="/membership">
                  <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:scale-105">
                    Start Free
                  </Button>
                </Link>
                <Link href="/dj-mode">
                  <Button size="lg" variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800 text-lg px-8 py-6 rounded-xl transition-all hover:scale-105">
                    View Platform
                  </Button>
                </Link>
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3 pt-4">
                <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-full px-4 py-2 hover:border-cyan-500/50 transition-colors">
                  <Brain className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-slate-300">AI Set Generator</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-full px-4 py-2 hover:border-purple-500/50 transition-colors">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-slate-300">Analytics Dashboard</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-full px-4 py-2 hover:border-pink-500/50 transition-colors">
                  <Wallet className="w-4 h-4 text-pink-400" />
                  <span className="text-sm text-slate-300">Monetization Tools</span>
                </div>
              </div>
            </div>

            {/* Right: Dashboard Preview Mockup */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-shadow">
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
                    <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-xl p-4 hover:border-cyan-500/40 transition-colors">
                      <div className="text-xs text-cyan-400 mb-1">Total Streams</div>
                      <div className="text-2xl font-bold text-white">24.5K</div>
                      <div className="text-xs text-green-400 mt-1">+12% this week</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl p-4 hover:border-purple-500/40 transition-colors">
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

      {/* Featured Tracks Carousel */}
      <FeaturedTracksSection />

      {/* Social Proof Stats */}
      <section className="py-12 bg-slate-900/50 border-y border-slate-800">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                10K+
              </div>
              <div className="text-sm text-slate-400">Active DJs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                500K+
              </div>
              <div className="text-sm text-slate-400">Tracks Uploaded</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                2M+
              </div>
              <div className="text-sm text-slate-400">Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent mb-2">
                $500K+
              </div>
              <div className="text-sm text-slate-400">Paid to DJs</div>
            </div>
          </div>
        </div>
      </section>

      {/* AI BPM & Key Analyzer - Free Tool */}
      <AIAnalyzer />

      {/* Featured Section - Key Features */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
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
              <Card className="p-6 bg-slate-900/50 backdrop-blur-sm border-slate-800 hover:border-cyan-500/50 transition-all hover:scale-105 group">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
                    <Brain className="h-6 w-6 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">AI-Powered Sets</h3>
                  <p className="text-sm text-slate-400">Generate perfect DJ sets with AI that understands energy flow and harmonic mixing</p>
                </div>
              </Card>
              
              <Card className="p-6 bg-slate-900/50 backdrop-blur-sm border-slate-800 hover:border-purple-500/50 transition-all hover:scale-105 group">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                    <BarChart3 className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">Performance Analytics</h3>
                  <p className="text-sm text-slate-400">Track downloads, streams, and earnings with real-time dashboards</p>
                </div>
              </Card>
              
              <Card className="p-6 bg-slate-900/50 backdrop-blur-sm border-slate-800 hover:border-pink-500/50 transition-all hover:scale-105 group">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-500/20 transition-colors">
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
              <div className="relative group">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">Sign Up Free</h3>
                  <p className="text-slate-400">Create your account and access the platform instantly</p>
                </div>
                {/* Connector Line */}
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-cyan-500/50 to-purple-500/50"></div>
              </div>

              <div className="relative group">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">Upload & Analyze</h3>
                  <p className="text-slate-400">Upload your tracks and let AI analyze BPM, key, and energy</p>
                </div>
                {/* Connector Line */}
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-purple-500/50 to-pink-500/50"></div>
              </div>

              <div className="relative group">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-pink-500/20 group-hover:shadow-pink-500/40 transition-shadow">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">Create & Earn</h3>
                  <p className="text-slate-400">Generate AI sets, share your music, and start earning</p>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link href="/membership">
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white text-lg px-10 py-6 rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:scale-105">
                  Get Started Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Simple, Transparent Pricing
                </span>
              </h2>
              <p className="text-xl text-slate-400">
                Start free, upgrade when you're ready
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <Card className="p-8 bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                  <div className="text-4xl font-bold text-slate-300 mb-4">$0<span className="text-lg text-slate-500">/month</span></div>
                  <p className="text-slate-400">Perfect for getting started</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-400">Browse unlimited tracks</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-400">1-minute previews</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-400">AI analysis tools</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-400">Basic search filters</span>
                  </li>
                </ul>
                <Link href="/membership">
                  <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800">
                    Get Started
                  </Button>
                </Link>
              </Card>

              {/* Pro Plan */}
              <Card className="p-8 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/50 hover:border-cyan-500 transition-all relative overflow-hidden">
                {/* Popular Badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  POPULAR
                </div>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                  <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
                    $4.99<span className="text-lg text-slate-400">/month</span>
                  </div>
                  <p className="text-slate-300">For serious DJs</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span className="text-white font-medium">Everything in Free, plus:</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">Unlimited downloads (MP3 & WAV)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">Upload & monetize your tracks</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">AI Set Generator</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">Advanced analytics dashboard</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">Priority support</span>
                  </li>
                </ul>
                <Link href="/membership">
                  <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-lg shadow-cyan-500/20">
                    Upgrade to Pro
                  </Button>
                </Link>
              </Card>
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
              <p className="text-xl text-slate-400">
                All the tools you need in one platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6 bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-all hover:scale-105 group">
                <Music2 className="h-8 w-8 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold mb-2 text-white">Smart Music Library</h3>
                <p className="text-sm text-slate-400">Organize thousands of tracks with AI-powered tagging and search</p>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800 hover:border-purple-500/50 transition-all hover:scale-105 group">
                <Sparkles className="h-8 w-8 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold mb-2 text-white">AI Recommendations</h3>
                <p className="text-sm text-slate-400">Get personalized track suggestions based on your DJ style</p>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800 hover:border-pink-500/50 transition-all hover:scale-105 group">
                <TrendingUp className="h-8 w-8 text-pink-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold mb-2 text-white">Trending Insights</h3>
                <p className="text-sm text-slate-400">See what's hot in your genre before everyone else</p>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800 hover:border-green-500/50 transition-all hover:scale-105 group">
                <DollarSign className="h-8 w-8 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold mb-2 text-white">Revenue Dashboard</h3>
                <p className="text-sm text-slate-400">Track earnings, downloads, and payouts in real-time</p>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800 hover:border-blue-500/50 transition-all hover:scale-105 group">
                <Shield className="h-8 w-8 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold mb-2 text-white">Secure Storage</h3>
                <p className="text-sm text-slate-400">Cloud-based library with automatic backups</p>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800 hover:border-yellow-500/50 transition-all hover:scale-105 group">
                <Zap className="h-8 w-8 text-yellow-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold mb-2 text-white">Lightning Fast</h3>
                <p className="text-sm text-slate-400">Instant uploads, downloads, and analysis</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-t border-slate-800">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Ready to elevate your DJ career?
              </span>
            </h2>
            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              Join thousands of DJs who are already using ONLYDJS to create better sets, grow their audience, and earn from their music.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/membership">
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white text-lg px-10 py-6 rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:scale-105">
                  Start Free Today
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/discover">
                <Button size="lg" variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800 text-lg px-10 py-6 rounded-xl transition-all hover:scale-105">
                  Explore Tracks
                </Button>
              </Link>
            </div>
            <p className="text-sm text-slate-500 mt-6">
              No credit card required • Cancel anytime • 10K+ active DJs
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
