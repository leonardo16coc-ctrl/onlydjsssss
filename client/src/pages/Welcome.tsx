import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Upload, DollarSign, Crown, TrendingUp, Music, Zap } from "lucide-react";

export default function Welcome() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      {/* Hero Section */}
      <div className="container py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">ONLYDJS</span>, {user?.name}! 🎉
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            You're now part of the most advanced DJ platform in the world. Here's everything you need to know to start earning from your music.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Step 1: Upload */}
          <Card className="bg-gray-800/50 border-cyan-500/30 p-8 hover:border-cyan-500 transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Upload className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-cyan-400">1. Upload Tracks</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Upload your extended mixes, remixes, edits, and mashups. We accept MP3 (320kbps) and WAV formats.
            </p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• AI-powered BPM & Key detection</li>
              <li>• Automatic waveform generation</li>
              <li>• Professional metadata tagging</li>
            </ul>
          </Card>

          {/* Step 2: Monetize */}
          <Card className="bg-gray-800/50 border-purple-500/30 p-8 hover:border-purple-500 transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-purple-400">2. Earn Money</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Get paid every time a DJ downloads your track. We split 60% of membership revenue with creators.
            </p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Transparent revenue sharing</li>
              <li>• Monthly payouts via PayPal/Stripe</li>
              <li>• Real-time earnings dashboard</li>
            </ul>
          </Card>

          {/* Step 3: Grow */}
          <Card className="bg-gray-800/50 border-pink-500/30 p-8 hover:border-pink-500 transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold text-pink-400">3. Build Your Brand</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Get discovered by thousands of DJs worldwide. Track your downloads, rankings, and fan engagement.
            </p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Public DJ profile with stats</li>
              <li>• Top 100 rankings</li>
              <li>• Community networking</li>
            </ul>
          </Card>
        </div>

        {/* Pro Membership Benefits */}
        <Card className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/50 p-10 mb-12">
          <div className="flex items-center gap-4 mb-6">
            <Crown className="w-10 h-10 text-yellow-400" />
            <h2 className="text-3xl font-bold">Upgrade to PRO - $4.99/month</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-cyan-400 mt-1" />
              <div>
                <h4 className="font-semibold text-cyan-400 mb-1">Unlimited Uploads</h4>
                <p className="text-sm text-gray-300">Upload as many tracks as you want</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Music className="w-5 h-5 text-purple-400 mt-1" />
              <div>
                <h4 className="font-semibold text-purple-400 mb-1">Unlimited Downloads</h4>
                <p className="text-sm text-gray-300">Download any track in MP3 or WAV</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-pink-400 mt-1" />
              <div>
                <h4 className="font-semibold text-pink-400 mb-1">Priority in Rankings</h4>
                <p className="text-sm text-gray-300">Boost your visibility</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-yellow-400 mt-1" />
              <div>
                <h4 className="font-semibold text-yellow-400 mb-1">Higher Revenue Share</h4>
                <p className="text-sm text-gray-300">Earn more per download</p>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => setLocation("/membership")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Upgrade to PRO Now
          </Button>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Button 
            onClick={() => setLocation("/upload")}
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-lg px-12 py-6"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload My First Track
          </Button>
          <p className="text-gray-400 mt-4">
            or <button onClick={() => setLocation("/")} className="text-cyan-400 hover:underline">explore the platform</button>
          </p>
        </div>
      </div>
    </div>
  );
}
