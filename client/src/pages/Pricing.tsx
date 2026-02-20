import { Check, X, Zap, Crown, Sparkles, TrendingUp, DollarSign, HelpCircle } from "lucide-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for discovering and exploring music",
      icon: Sparkles,
      iconColor: "text-cyan-400",
      bgGradient: "from-cyan-500/10 to-purple-500/10",
      borderColor: "border-cyan-500/20",
      features: [
        { name: "Browse entire music library", included: true },
        { name: "Preview tracks (30 seconds)", included: true },
        { name: "Basic search & filters", included: true },
        { name: "AI-powered recommendations", included: true },
        { name: "Create playlists", included: true },
        { name: "Full track downloads", included: false },
        { name: "Upload & monetize tracks", included: false },
        { name: "AI set generator", included: false },
        { name: "Advanced analytics dashboard", included: false },
        { name: "Priority support", included: false },
      ],
      cta: "Start Free",
      ctaLink: "/",
      popular: false,
    },
    {
      name: "Pro",
      price: "$4.99",
      period: "per month",
      description: "Unlock full platform access and monetization",
      icon: Crown,
      iconColor: "text-purple-400",
      bgGradient: "from-purple-500/20 to-pink-500/20",
      borderColor: "border-purple-500/40",
      features: [
        { name: "Browse entire music library", included: true },
        { name: "Unlimited full track downloads", included: true },
        { name: "Advanced search & filters", included: true },
        { name: "AI-powered recommendations", included: true },
        { name: "Create unlimited playlists", included: true },
        { name: "Upload & monetize your tracks", included: true },
        { name: "AI set generator (unlimited)", included: true },
        { name: "Advanced analytics dashboard", included: true },
        { name: "Revenue tracking & payouts", included: true },
        { name: "Priority support", included: true },
      ],
      cta: "Upgrade to Pro",
      ctaLink: "https://onlydjs.sellfy.store/p/subscription/",
      popular: true,
      external: true,
    },
  ];

  const faqs = [
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes! You can cancel your Pro subscription at any time. You'll continue to have Pro access until the end of your current billing period, then your account will automatically revert to the Free plan.",
    },
    {
      question: "How do payouts work for uploaded tracks?",
      answer: "Pro members earn 70% of each track sale. Payouts are processed monthly via PayPal or bank transfer once you reach a minimum balance of $50. You can track your earnings in real-time through the analytics dashboard.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express, Discover) and debit cards through our secure payment processor Stripe.",
    },
    {
      question: "Is there a free trial for Pro?",
      answer: "While we don't offer a traditional free trial, our Free plan gives you full access to browse and preview the entire library. You can upgrade to Pro anytime to unlock downloads and monetization features.",
    },
    {
      question: "Can I switch between plans?",
      answer: "Absolutely! You can upgrade from Free to Pro instantly. If you downgrade from Pro to Free, the change will take effect at the end of your current billing cycle.",
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 7-day money-back guarantee for new Pro subscriptions. If you're not satisfied within the first 7 days, contact support for a full refund.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-full mb-8">
            <DollarSign className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-slate-300">Simple, transparent pricing</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6">
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Choose Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Start free and upgrade when you're ready to unlock full platform access,
            downloads, and monetization features.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative p-8 bg-gradient-to-br ${plan.bgGradient} border-2 ${plan.borderColor} hover:scale-105 transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                    <span className="text-sm font-bold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      MOST POPULAR
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center`}>
                    <plan.icon className={`w-8 h-8 ${plan.iconColor}`} />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-slate-400 text-sm mb-6">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-5xl font-black text-white">{plan.price}</span>
                    <span className="text-slate-400 ml-2">/ {plan.period}</span>
                  </div>

                  {plan.external ? (
                    <a href={plan.ctaLink} target="_blank" rel="noopener noreferrer">
                      <button
                        className={`w-full px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg ${
                          plan.popular
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                            : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                        }`}
                      >
                        {plan.cta}
                      </button>
                    </a>
                  ) : (
                    <Link href={plan.ctaLink}>
                      <button
                        className={`w-full px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg ${
                          plan.popular
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                            : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                        }`}
                      >
                        {plan.cta}
                      </button>
                    </Link>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-green-400" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <X className="w-3 h-3 text-slate-600" />
                        </div>
                      )}
                      <span
                        className={`text-sm ${
                          feature.included ? "text-slate-300" : "text-slate-600"
                        }`}
                      >
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 px-4 bg-gradient-to-r from-cyan-500/5 to-purple-500/5">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-slate-300">Why upgrade to Pro?</span>
          </div>

          <h2 className="text-4xl font-black text-white mb-12">
            Unlock Your Full Potential
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 bg-slate-900/50 border-slate-800">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Monetize Your Music</h3>
              <p className="text-slate-400 text-sm">
                Upload your tracks and earn 70% on every sale. Turn your passion into profit.
              </p>
            </Card>

            <Card className="p-6 bg-slate-900/50 border-slate-800">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI-Powered Tools</h3>
              <p className="text-slate-400 text-sm">
                Generate perfect DJ sets instantly with our advanced AI set generator.
              </p>
            </Card>

            <Card className="p-6 bg-slate-900/50 border-slate-800">
              <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Advanced Analytics</h3>
              <p className="text-slate-400 text-sm">
                Track downloads, revenue, and audience insights with detailed analytics.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="container max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-slate-300">Frequently asked questions</span>
            </div>

            <h2 className="text-4xl font-black text-white mb-4">
              Got Questions?
            </h2>
            <p className="text-slate-400">
              Everything you need to know about our pricing and plans
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="bg-slate-900/50 border border-slate-800 rounded-xl px-6 data-[state=open]:bg-slate-900/80"
              >
                <AccordionTrigger className="text-left text-white hover:no-underline py-5">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-slate-400 pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="container max-w-4xl mx-auto">
          <Card className="p-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/40 text-center">
            <h2 className="text-4xl font-black text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of DJs already using ONLYDJS to discover, create, and monetize music.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg">
                  Start Free Today
                </button>
              </Link>

              <Link href="/contact">
                <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all hover:scale-105 border border-slate-700">
                  Contact Sales
                </button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
