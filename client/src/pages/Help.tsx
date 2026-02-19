import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Search, HelpCircle, Upload, DollarSign, Music, Shield, Zap, Users } from "lucide-react";
import { useState } from "react";

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");

  const faqCategories = [
    {
      title: "Getting Started",
      icon: Zap,
      color: "cyan",
      faqs: [
        {
          q: "How do I create an account?",
          a: "Click 'Start Free' on the homepage, sign in with your email, and you're ready to go. No credit card required for the free plan."
        },
        {
          q: "What file formats are supported?",
          a: "We support MP3, WAV, FLAC, and AAC formats. Maximum file size is 500MB for Pro users, 100MB for Free users."
        },
        {
          q: "How long does AI analysis take?",
          a: "AI analysis (BPM, key detection, genre classification) typically takes 30-60 seconds per track, depending on file size."
        }
      ]
    },
    {
      title: "Uploading & Publishing",
      icon: Upload,
      color: "purple",
      faqs: [
        {
          q: "How do I upload a track?",
          a: "Go to Creator Hub, click 'Upload Track', select your audio file, add cover art and metadata, then click 'Publish'. Your track will be live immediately."
        },
        {
          q: "Can I edit a track after publishing?",
          a: "Yes! Go to your Dashboard, find the track, and click 'Edit'. You can update metadata, cover art, and pricing anytime."
        },
        {
          q: "What are the content guidelines?",
          a: "You must own the rights to all uploaded content. No copyrighted material, hate speech, or explicit content without proper labeling."
        }
      ]
    },
    {
      title: "Monetization & Earnings",
      icon: DollarSign,
      color: "pink",
      faqs: [
        {
          q: "How do I earn money?",
          a: "Set a price for your tracks (or offer them free). You earn 80% of every sale. Payments are processed monthly via Stripe to your connected account."
        },
        {
          q: "When do I get paid?",
          a: "Earnings are paid out monthly on the 15th, with a minimum threshold of $50. You can track earnings in real-time on your Dashboard."
        },
        {
          q: "What payment methods are supported?",
          a: "We use Stripe for payouts, supporting bank transfers, debit cards, and PayPal in 40+ countries."
        }
      ]
    },
    {
      title: "AI Features",
      icon: Music,
      color: "cyan",
      faqs: [
        {
          q: "How does AI Set Generator work?",
          a: "Our AI analyzes BPM, key, energy levels, and genre to create harmonic mixes. Select your tracks, choose a vibe, and let AI arrange the perfect flow."
        },
        {
          q: "Is AI analysis accurate?",
          a: "Our AI achieves 95%+ accuracy for BPM and key detection, trained on millions of tracks. You can always manually override any analysis."
        },
        {
          q: "Can I use AI features on the Free plan?",
          a: "Yes! AI analysis (BPM, key, genre) is free for all users. AI Set Generator is limited to 5 tracks on Free, unlimited on Pro."
        }
      ]
    },
    {
      title: "Account & Billing",
      icon: Shield,
      color: "purple",
      faqs: [
        {
          q: "How do I upgrade to Pro?",
          a: "Go to Settings → Membership, choose Pro plan ($9.99/month), and enter payment details. You can cancel anytime."
        },
        {
          q: "What's included in Pro?",
          a: "Unlimited uploads, advanced analytics, priority support, custom branding, API access, and higher revenue share (85% vs 80%)."
        },
        {
          q: "Can I cancel my subscription?",
          a: "Yes, cancel anytime from Settings → Membership. You'll keep Pro features until the end of your billing period."
        }
      ]
    },
    {
      title: "Community & Support",
      icon: Users,
      color: "pink",
      faqs: [
        {
          q: "How do I contact support?",
          a: "Email us at support@onlydjs.com or use the chat widget (bottom right). Pro users get priority support with <4 hour response time."
        },
        {
          q: "Is there a community forum?",
          a: "Yes! Join our Discord server (link in footer) to connect with 10K+ DJs, share tips, and get feedback on your mixes."
        },
        {
          q: "Can I collaborate with other DJs?",
          a: "Absolutely! Use the Network feature to find DJs by genre, location, or style. Send collab requests directly through the platform."
        }
      ]
    }
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      searchQuery === "" ||
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-10 h-10 text-cyan-400" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                How can we help?
              </span>
            </h1>
            <p className="text-xl text-slate-300">
              Find answers to common questions about ONLYDJS
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mt-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-5xl mx-auto space-y-12">
            {filteredCategories.length === 0 ? (
              <Card className="p-12 bg-slate-900/50 border-slate-800 text-center">
                <p className="text-xl text-slate-400">No results found for "{searchQuery}"</p>
                <p className="text-sm text-slate-500 mt-2">Try a different search term or browse categories below</p>
              </Card>
            ) : (
              filteredCategories.map((category, idx) => {
                const colorMap: Record<string, string> = {
                  cyan: "from-cyan-500/10 to-cyan-500/5 border-cyan-500/20",
                  purple: "from-purple-500/10 to-purple-500/5 border-purple-500/20",
                  pink: "from-pink-500/10 to-pink-500/5 border-pink-500/20"
                };
                const iconColorMap: Record<string, string> = {
                  cyan: "text-cyan-400 bg-cyan-500/10",
                  purple: "text-purple-400 bg-purple-500/10",
                  pink: "text-pink-400 bg-pink-500/10"
                };

                return (
                  <div key={idx} className="space-y-4">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-12 h-12 ${iconColorMap[category.color]} rounded-xl flex items-center justify-center`}>
                        <category.icon className="w-6 h-6" />
                      </div>
                      <h2 className="text-3xl font-bold text-white">{category.title}</h2>
                    </div>

                    <div className="space-y-4">
                      {category.faqs.map((faq, faqIdx) => (
                        <Card key={faqIdx} className={`p-6 bg-gradient-to-br ${colorMap[category.color]} hover:border-${category.color}-500/40 transition-all`}>
                          <h3 className="text-lg font-bold text-white mb-3">{faq.q}</h3>
                          <p className="text-slate-300 leading-relaxed">{faq.a}</p>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Contact Support CTA */}
      <section className="py-20 bg-slate-900/50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Still need help?</h2>
            <p className="text-xl text-slate-400 mb-8">
              Our support team is here for you 24/7
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@onlydjs.com"
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg"
              >
                Email Support
              </a>
              <a
                href="https://discord.gg/onlydjs"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all hover:scale-105 border border-slate-700"
              >
                Join Discord
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
