import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Music2, Target, Eye, Heart, Users, Zap, Globe } from "lucide-react";

export default function About() {
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
                About ONLYDJS
              </span>
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              We're building the operating system for the next generation of DJs — empowering creators to share their music, grow their audience, and earn from their craft.
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
                <h2 className="text-3xl font-bold text-white">Our Mission</h2>
              </div>
              <p className="text-lg text-slate-300 leading-relaxed">
                To democratize music distribution and empower DJs worldwide with AI-powered tools, seamless monetization, and a thriving community where talent meets opportunity.
              </p>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20 hover:border-purple-500/40 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                  <Eye className="w-8 h-8 text-purple-400" />
                </div>
                <h2 className="text-3xl font-bold text-white">Our Vision</h2>
              </div>
              <p className="text-lg text-slate-300 leading-relaxed">
                A world where every DJ has the tools, platform, and support to turn their passion into a sustainable career — no gatekeepers, just pure creativity and fair compensation.
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
              <h2 className="text-4xl font-bold mb-4 text-white">Our Story</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mx-auto rounded-full"></div>
            </div>

            <Card className="p-8 bg-slate-900/50 border-slate-800">
              <p className="text-lg text-slate-300 leading-relaxed mb-6">
                ONLYDJS was born from a simple observation: DJs are the heartbeat of music culture, yet they face countless barriers — from expensive distribution platforms to complex licensing, from limited discovery to unfair revenue splits.
              </p>
              <p className="text-lg text-slate-300 leading-relaxed mb-6">
                We asked ourselves: <span className="text-cyan-400 font-semibold">What if there was a platform built specifically for DJs?</span> A place where uploading a track is as easy as posting on social media. Where AI analyzes your music and helps you create perfect sets. Where you keep the majority of what you earn.
              </p>
              <p className="text-lg text-slate-300 leading-relaxed">
                Today, ONLYDJS serves over <span className="text-purple-400 font-bold">10,000+ DJs</span> worldwide, with <span className="text-pink-400 font-bold">500K+ tracks</span> uploaded and <span className="text-cyan-400 font-bold">$500K+ paid</span> directly to creators. We're just getting started.
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
              <h2 className="text-4xl font-bold mb-4 text-white">Our Values</h2>
              <p className="text-xl text-slate-400">The principles that guide everything we do</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-all text-center group">
                <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-cyan-500/20 transition-colors">
                  <Heart className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Creator First</h3>
                <p className="text-sm text-slate-400">Every decision we make prioritizes the DJ community and their success.</p>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800 hover:border-purple-500/50 transition-all text-center group">
                <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500/20 transition-colors">
                  <Zap className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Innovation</h3>
                <p className="text-sm text-slate-400">We leverage AI and cutting-edge tech to solve real problems for DJs.</p>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800 hover:border-pink-500/50 transition-all text-center group">
                <div className="w-16 h-16 bg-pink-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-pink-500/20 transition-colors">
                  <Users className="w-8 h-8 text-pink-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Community</h3>
                <p className="text-sm text-slate-400">We build tools that connect DJs and foster collaboration worldwide.</p>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-all text-center group">
                <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-cyan-500/20 transition-colors">
                  <Globe className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Transparency</h3>
                <p className="text-sm text-slate-400">Fair revenue splits, clear analytics, and honest communication always.</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-white">By the Numbers</h2>
              <p className="text-xl text-slate-400">Our impact on the DJ community</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  10K+
                </div>
                <div className="text-sm text-slate-400">Active DJs</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  500K+
                </div>
                <div className="text-sm text-slate-400">Tracks Uploaded</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  2M+
                </div>
                <div className="text-sm text-slate-400">Total Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  $500K+
                </div>
                <div className="text-sm text-slate-400">Paid to Creators</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
