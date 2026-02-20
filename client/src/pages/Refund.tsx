import { ArrowLeft, DollarSign, Clock, CheckCircle, XCircle, HelpCircle, Mail } from "lucide-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";

export default function Refund() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <section className="pt-24 pb-12 px-4 border-b border-slate-800">
        <div className="container max-w-4xl mx-auto">
          <Link href="/">
            <button className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </Link>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-full mb-6">
            <DollarSign className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-slate-300">Refund Policy</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Refund Policy
            </span>
          </h1>

          <p className="text-xl text-slate-400 leading-relaxed">
            Last updated: February 20, 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4">
        <div className="container max-w-4xl mx-auto space-y-12">
          {/* Overview */}
          <Card className="p-8 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-2 border-cyan-500/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">7-Day Money-Back Guarantee</h2>
                <p className="text-slate-300 leading-relaxed">
                  We stand behind the quality of our platform. If you're not completely satisfied with your Pro subscription within the first 7 days, we'll provide a full refund—no questions asked.
                </p>
              </div>
            </div>
          </Card>

          {/* Eligibility */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-3xl font-black text-white">Refund Eligibility</h2>
            </div>

            <Card className="p-6 bg-slate-900/50 border-slate-800 space-y-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">You are eligible for a refund if:</h3>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>You request a refund within <strong>7 days</strong> of your initial Pro subscription purchase</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>You experienced technical issues that prevented you from using the platform and we were unable to resolve them</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>You were charged incorrectly due to a billing error on our part</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-3">
                <h3 className="text-lg font-semibold text-white">You are NOT eligible for a refund if:</h3>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>More than 7 days have passed since your initial subscription purchase</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>You violated our Terms of Service or engaged in prohibited conduct</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>You're requesting a refund for renewal charges (you must cancel before renewal)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>You've already received a refund for a previous subscription period</span>
                  </li>
                </ul>
              </div>
            </Card>
          </div>

          {/* How to Request */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-3xl font-black text-white">How to Request a Refund</h2>
            </div>

            <Card className="p-6 bg-slate-900/50 border-slate-800">
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <div className="w-8 h-8 bg-cyan-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-cyan-400 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Contact Support</h3>
                    <p className="text-slate-300">
                      Email us at <a href="mailto:support@onlydjs.com" className="text-cyan-400 hover:underline">support@onlydjs.com</a> or use our <Link href="/contact"><span className="text-cyan-400 hover:underline cursor-pointer">contact form</span></Link>
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-400 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Provide Information</h3>
                    <p className="text-slate-300">
                      Include your account email, subscription date, and reason for the refund request
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <div className="w-8 h-8 bg-pink-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-pink-400 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Wait for Confirmation</h3>
                    <p className="text-slate-300">
                      We'll review your request and respond within 2-3 business days
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400 font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Receive Refund</h3>
                    <p className="text-slate-300">
                      If approved, refunds are processed within 5-10 business days to your original payment method
                    </p>
                  </div>
                </li>
              </ol>
            </Card>
          </div>

          {/* Processing Time */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-3xl font-black text-white">Refund Processing Time</h2>
            </div>

            <Card className="p-6 bg-slate-900/50 border-slate-800">
              <div className="space-y-4 text-slate-300">
                <p>
                  Once your refund is approved, it will be processed according to the following timeline:
                </p>

                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-400">•</span>
                    <span><strong className="text-white">Credit/Debit Cards:</strong> 5-10 business days</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-400">•</span>
                    <span><strong className="text-white">PayPal:</strong> 3-5 business days</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-400">•</span>
                    <span><strong className="text-white">Bank Transfer:</strong> 7-14 business days</span>
                  </li>
                </ul>

                <p className="pt-4 border-t border-slate-800">
                  <strong className="text-white">Note:</strong> The exact timing may vary depending on your bank or payment provider. If you don't see the refund after the expected timeframe, please contact your financial institution.
                </p>
              </div>
            </Card>
          </div>

          {/* Subscription Cancellation */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-pink-400" />
              </div>
              <h2 className="text-3xl font-black text-white">Cancellation vs. Refund</h2>
            </div>

            <Card className="p-6 bg-slate-900/50 border-slate-800">
              <div className="space-y-4 text-slate-300">
                <p>
                  <strong className="text-white">Cancellation</strong> stops future billing but does not refund the current period. You'll retain Pro access until the end of your billing cycle.
                </p>

                <p>
                  <strong className="text-white">Refund</strong> returns your payment and immediately revokes Pro access. This is only available within the 7-day guarantee period.
                </p>

                <p className="pt-4 border-t border-slate-800">
                  To cancel your subscription (without requesting a refund), visit your <Link href="/subscription"><span className="text-cyan-400 hover:underline cursor-pointer">subscription settings</span></Link>.
                </p>
              </div>
            </Card>
          </div>

          {/* FAQ */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-3xl font-black text-white">Frequently Asked Questions</h2>
            </div>

            <Card className="p-6 bg-slate-900/50 border-slate-800 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Can I get a partial refund?</h3>
                <p className="text-slate-300">
                  No, we only offer full refunds for the initial subscription period within 7 days. Partial refunds for unused time are not available.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-lg font-semibold text-white mb-2">What happens to my uploaded tracks after a refund?</h3>
                <p className="text-slate-300">
                  Your uploaded tracks will remain on the platform, but you'll lose the ability to upload new tracks or earn revenue from sales until you resubscribe to Pro.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-lg font-semibold text-white mb-2">Can I get a refund if I forgot to cancel before renewal?</h3>
                <p className="text-slate-300">
                  Renewal charges are not eligible for refunds. We send reminder emails before each renewal. Please cancel before your renewal date to avoid charges.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-lg font-semibold text-white mb-2">Do you offer refunds for track purchases?</h3>
                <p className="text-slate-300">
                  Individual track purchases are final and non-refundable due to the digital nature of the product. However, if you experience technical issues downloading a track, contact support for assistance.
                </p>
              </div>
            </Card>
          </div>

          {/* Contact */}
          <Card className="p-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/40 text-center">
            <h2 className="text-2xl font-black text-white mb-4">
              Questions About Refunds?
            </h2>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              Our support team is here to help. Contact us with any questions about our refund policy.
            </p>

            <Link href="/contact">
              <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg">
                Contact Support
              </button>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
}
