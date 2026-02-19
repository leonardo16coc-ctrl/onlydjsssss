import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Cookie, Shield, Settings, Eye } from "lucide-react";

export default function CookiePolicy() {
  const cookieTypes = [
    {
      icon: Shield,
      title: "Essential Cookies",
      description: "Required for the website to function properly. Cannot be disabled.",
      color: "cyan",
      examples: [
        "Authentication tokens",
        "Session management",
        "Security features",
        "Load balancing"
      ]
    },
    {
      icon: Eye,
      title: "Analytics Cookies",
      description: "Help us understand how visitors interact with our website.",
      color: "purple",
      examples: [
        "Page views and traffic sources",
        "User behavior patterns",
        "Feature usage statistics",
        "Performance metrics"
      ]
    },
    {
      icon: Settings,
      title: "Functional Cookies",
      description: "Enable enhanced functionality and personalization.",
      color: "pink",
      examples: [
        "Language preferences",
        "Theme settings (dark/light mode)",
        "Player volume settings",
        "UI customizations"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Cookie className="w-10 h-10 text-cyan-400" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Cookie Policy
              </span>
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Learn about how we use cookies to improve your experience on ONLYDJS
            </p>
            <p className="text-sm text-slate-400">
              Last updated: February 19, 2026
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 bg-slate-900/50 border-slate-800 mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">What are cookies?</h2>
              <div className="text-slate-300 space-y-4 leading-relaxed">
                <p>
                  Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences, keeping you logged in, and understanding how you use our platform.
                </p>
                <p>
                  We use cookies and similar tracking technologies to track activity on our service and store certain information. These technologies help us improve our service, provide personalized content, and analyze usage patterns.
                </p>
              </div>
            </Card>

            {/* Cookie Types */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">Types of Cookies We Use</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cookieTypes.map((type, idx) => (
                  <Card key={idx} className="p-6 bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-all">
                    <div className={`w-12 h-12 bg-${type.color}-500/10 rounded-xl flex items-center justify-center mb-4`}>
                      <type.icon className={`w-6 h-6 text-${type.color}-400`} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{type.title}</h3>
                    <p className="text-sm text-slate-400 mb-4 leading-relaxed">{type.description}</p>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase">Examples:</p>
                      <ul className="space-y-1">
                        {type.examples.map((example, i) => (
                          <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                            <span className="text-cyan-400 mt-1">•</span>
                            <span>{example}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Detailed Information */}
            <div className="space-y-8">
              <Card className="p-8 bg-slate-900/50 border-slate-800">
                <h2 className="text-2xl font-bold text-white mb-4">How We Use Cookies</h2>
                <div className="text-slate-300 space-y-4 leading-relaxed">
                  <p>
                    <strong className="text-white">Authentication & Security:</strong> We use cookies to keep you logged in and protect your account from unauthorized access. These cookies are essential for the platform to function properly.
                  </p>
                  <p>
                    <strong className="text-white">Performance & Analytics:</strong> We collect anonymous data about how users interact with our platform to identify areas for improvement and optimize performance.
                  </p>
                  <p>
                    <strong className="text-white">Personalization:</strong> Cookies help us remember your preferences (like theme, language, and player settings) so you don't have to set them every time you visit.
                  </p>
                  <p>
                    <strong className="text-white">Content Recommendations:</strong> We use cookies to understand your music preferences and provide better track recommendations.
                  </p>
                </div>
              </Card>

              <Card className="p-8 bg-slate-900/50 border-slate-800">
                <h2 className="text-2xl font-bold text-white mb-4">Managing Your Cookie Preferences</h2>
                <div className="text-slate-300 space-y-4 leading-relaxed">
                  <p>
                    You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences by adjusting your browser settings.
                  </p>
                  <p>
                    <strong className="text-white">Browser Settings:</strong> Most web browsers allow you to control cookies through their settings. You can set your browser to refuse cookies or delete certain cookies. Note that disabling cookies may affect the functionality of our website.
                  </p>
                  <p>
                    <strong className="text-white">Essential Cookies:</strong> Please note that essential cookies cannot be disabled as they are necessary for the website to function properly. These include authentication and security cookies.
                  </p>
                </div>
              </Card>

              <Card className="p-8 bg-slate-900/50 border-slate-800">
                <h2 className="text-2xl font-bold text-white mb-4">Third-Party Cookies</h2>
                <div className="text-slate-300 space-y-4 leading-relaxed">
                  <p>
                    We may use third-party services that set their own cookies on your device. These services help us provide better functionality and analyze usage:
                  </p>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-1">•</span>
                      <span><strong className="text-white">Analytics Services:</strong> Google Analytics (or similar) to understand user behavior</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-1">•</span>
                      <span><strong className="text-white">Payment Processors:</strong> Stripe for secure payment processing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-1">•</span>
                      <span><strong className="text-white">CDN Providers:</strong> Content delivery networks for faster loading times</span>
                    </li>
                  </ul>
                  <p>
                    These third parties have their own privacy policies and cookie policies. We recommend reviewing them to understand how they use cookies.
                  </p>
                </div>
              </Card>

              <Card className="p-8 bg-slate-900/50 border-slate-800">
                <h2 className="text-2xl font-bold text-white mb-4">GDPR & CCPA Compliance</h2>
                <div className="text-slate-300 space-y-4 leading-relaxed">
                  <p>
                    We are committed to protecting your privacy and complying with data protection regulations including GDPR (General Data Protection Regulation) and CCPA (California Consumer Privacy Act).
                  </p>
                  <p>
                    <strong className="text-white">Your Rights:</strong>
                  </p>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-1">•</span>
                      <span>Right to access your personal data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-1">•</span>
                      <span>Right to rectify inaccurate data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-1">•</span>
                      <span>Right to erasure ("right to be forgotten")</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-1">•</span>
                      <span>Right to restrict processing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-1">•</span>
                      <span>Right to data portability</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-1">•</span>
                      <span>Right to object to processing</span>
                    </li>
                  </ul>
                  <p>
                    To exercise any of these rights, please contact us at privacy@onlydjs.com.
                  </p>
                </div>
              </Card>

              <Card className="p-8 bg-slate-900/50 border-slate-800">
                <h2 className="text-2xl font-bold text-white mb-4">Updates to This Policy</h2>
                <div className="text-slate-300 space-y-4 leading-relaxed">
                  <p>
                    We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new Cookie Policy on this page and updating the "Last updated" date.
                  </p>
                  <p>
                    We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies.
                  </p>
                </div>
              </Card>

              <Card className="p-8 bg-slate-900/50 border-slate-800">
                <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
                <div className="text-slate-300 space-y-4 leading-relaxed">
                  <p>
                    If you have any questions about this Cookie Policy or our use of cookies, please contact us:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="text-cyan-400">Email:</span>
                      <a href="mailto:privacy@onlydjs.com" className="text-white hover:text-cyan-400 transition-colors">
                        privacy@onlydjs.com
                      </a>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-cyan-400">Website:</span>
                      <a href="/contact" className="text-white hover:text-cyan-400 transition-colors">
                        Contact Form
                      </a>
                    </li>
                  </ul>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
