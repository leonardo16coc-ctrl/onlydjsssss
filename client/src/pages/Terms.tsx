import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { FileText, Shield, DollarSign, AlertTriangle, Scale, Users, Lock, Ban } from "lucide-react";

export default function Terms() {
  const sections = [
    {
      id: "overview",
      icon: FileText,
      title: "1. Platform Overview",
      color: "cyan",
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>
            ONLYDJS is a subscription-based Software-as-a-Service (SaaS) platform that provides users with access to software tools, platform features, and a private community for DJs. ONLYDJS operates strictly as a technology and platform provider. We do not sell digital products individually, provide content creation services, offer custom or commissioned creative work, operate as a freelance platform or marketplace, or facilitate payments between users.
          </p>
          <p>
            By subscribing to ONLYDJS, you gain access to our platform's features and tools. You do not purchase individual content or services. ONLYDJS does not promote, distribute, or commercially exploit user-generated content.
          </p>
        </div>
      )
    },
    {
      id: "acceptance",
      icon: FileText,
      title: "2. Acceptance of Terms",
      color: "purple",
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>
            By creating an account, accessing, or using the ONLYDJS platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the platform.
          </p>
        </div>
      )
    },
    {
      id: "eligibility",
      icon: Users,
      title: "3. Eligibility and User Accounts",
      color: "pink",
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>
            You must be at least 18 years of age to use ONLYDJS. By creating an account, you represent and warrant that you meet this age requirement.
          </p>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </p>
        </div>
      )
    },
    {
      id: "subscriptions",
      icon: DollarSign,
      title: "4. Subscriptions and Billing",
      color: "cyan",
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>
            ONLYDJS operates on a recurring monthly membership subscription model. By subscribing, you authorize us to charge your payment method on a recurring basis until you cancel your subscription.
          </p>
          <p>
            <strong className="text-white">Subscription Fees:</strong> Subscription fees are billed in advance on a monthly basis and are non-refundable except as required by law.
          </p>
          <p>
            <strong className="text-white">Cancellation:</strong> You may cancel your subscription at any time through your account settings. Cancellation will take effect at the end of your current billing period. You will retain access to the platform until the end of the paid period.
          </p>
          <p>
            <strong className="text-white">Changes to Fees:</strong> We reserve the right to modify subscription fees with at least 30 days' advance notice. Continued use of the platform after a fee change constitutes acceptance of the new fees.
          </p>
          <p>
            <strong className="text-white">No Content Guarantees:</strong> Your subscription provides access to platform features and tools. We do not guarantee the availability of specific content, as content availability may vary based on user contributions and platform updates.
          </p>
        </div>
      )
    },
    {
      id: "user-content",
      icon: Shield,
      title: "5. User Content",
      color: "purple",
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>
            ONLYDJS allows users to upload their own original content to the platform. By uploading content, you represent and warrant that:
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li>You own all rights to the content or have obtained all necessary permissions and licenses.</li>
            <li>Your content does not infringe on the intellectual property rights, privacy rights, or any other rights of third parties.</li>
            <li>Your content complies with all applicable laws and regulations.</li>
          </ul>
          <p>
            <strong className="text-white">User Responsibility:</strong> You are solely responsible for all content you upload to ONLYDJS. We do not own, sell, license, or pre-approve user content.
          </p>
          <p>
            <strong className="text-white">Content Ownership:</strong> You retain all ownership rights to your content. By uploading content to the platform, you grant ONLYDJS a limited, non-exclusive, royalty-free license to host, store, and display your content solely for the technical operation of the platform and user account functionality.
          </p>
          <p>
            <strong className="text-white">Content Removal:</strong> We reserve the right to remove any content that violates these Terms of Service, infringes on third-party rights, or is otherwise objectionable, without prior notice.
          </p>
        </div>
      )
    },
    {
      id: "acceptable-use",
      icon: Ban,
      title: "6. Acceptable Use Policy",
      color: "pink",
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>You agree not to use the ONLYDJS platform to:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>Upload, post, or transmit any content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable.</li>
            <li>Infringe on the intellectual property rights, privacy rights, or other rights of any third party.</li>
            <li>Engage in any activity that disrupts or interferes with the platform or servers.</li>
            <li>Attempt to gain unauthorized access to any part of the platform, other user accounts, or computer systems or networks.</li>
            <li>Use the platform for any unauthorized commercial activity outside the scope of personal platform access.</li>
            <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity.</li>
            <li>Distribute viruses, malware, or any other harmful code.</li>
          </ul>
          <p>
            Violation of this Acceptable Use Policy may result in immediate suspension or termination of your account.
          </p>
        </div>
      )
    },
    {
      id: "intellectual-property",
      icon: Lock,
      title: "7. Intellectual Property",
      color: "cyan",
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>
            <strong className="text-white">Platform IP:</strong> All content, features, functionality, and intellectual property of the ONLYDJS platform, including but not limited to software, text, graphics, logos, and trademarks, are owned by ONLYDJS or its licensors and are protected by copyright, trademark, and other intellectual property laws.
          </p>
          <p>
            <strong className="text-white">User Content IP:</strong> Users retain all ownership rights to content they upload. ONLYDJS does not claim ownership of user-generated content.
          </p>
          <p>
            You may not reproduce, distribute, modify, create derivative works of, publicly display, or otherwise exploit any part of the platform without our prior written consent.
          </p>
        </div>
      )
    },
    {
      id: "disclaimers",
      icon: AlertTriangle,
      title: "8. Disclaimers",
      color: "purple",
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p className="uppercase font-semibold text-white">
            THE ONLYDJS PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
          </p>
          <p>
            We do not warrant that the platform will be uninterrupted, error-free, or free of viruses or other harmful components. We do not guarantee the accuracy, completeness, or reliability of any content available on the platform.
          </p>
        </div>
      )
    },
    {
      id: "liability",
      icon: Shield,
      title: "9. Limitation of Liability",
      color: "pink",
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p className="uppercase font-semibold text-white">
            TO THE FULLEST EXTENT PERMITTED BY LAW, ONLYDJS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li>Your use or inability to use the platform.</li>
            <li>Any unauthorized access to or use of our servers or any personal information stored therein.</li>
            <li>Any interruption or cessation of transmission to or from the platform.</li>
            <li>Any bugs, viruses, or other harmful code that may be transmitted to or through the platform.</li>
            <li>Any errors or omissions in any content or for any loss or damage incurred as a result of the use of any content posted, emailed, transmitted, or otherwise made available through the platform.</li>
          </ul>
          <p className="uppercase font-semibold text-white">
            IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL DAMAGES EXCEED THE AMOUNT YOU PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE LIABILITY.
          </p>
        </div>
      )
    },
    {
      id: "termination",
      icon: AlertTriangle,
      title: "10. Account Suspension and Termination",
      color: "cyan",
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>
            We reserve the right to suspend or terminate your account at any time, with or without notice, for any reason, including but not limited to:
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li>Violation of these Terms of Service.</li>
            <li>Fraudulent, abusive, or illegal activity.</li>
            <li>Non-payment of subscription fees.</li>
          </ul>
          <p>
            Upon termination, your right to access and use the platform will immediately cease. We are not liable for any loss or damage resulting from account suspension or termination.
          </p>
        </div>
      )
    },
    {
      id: "indemnification",
      icon: Shield,
      title: "11. Indemnification",
      color: "purple",
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>
            You agree to indemnify, defend, and hold harmless ONLYDJS, its affiliates, officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or in any way connected with:
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li>Your access to or use of the platform.</li>
            <li>Your violation of these Terms of Service.</li>
            <li>Your violation of any third-party rights, including intellectual property rights or privacy rights.</li>
            <li>Any content you upload to the platform.</li>
          </ul>
        </div>
      )
    },
    {
      id: "changes",
      icon: FileText,
      title: "12. Changes to Terms",
      color: "pink",
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>
            We reserve the right to modify these Terms of Service at any time. We will provide notice of material changes by posting the updated Terms on the platform and updating the "Last Updated" date. Your continued use of the platform after changes are posted constitutes your acceptance of the revised Terms.
          </p>
        </div>
      )
    },
    {
      id: "governing-law",
      icon: Scale,
      title: "13. Governing Law and Dispute Resolution",
      color: "cyan",
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>
            These Terms of Service shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
          </p>
          <p>
            Any disputes arising out of or relating to these Terms or your use of the platform shall be resolved through binding arbitration in accordance with applicable arbitration rules, except where prohibited by law. You agree to waive any right to a jury trial or to participate in a class action.
          </p>
        </div>
      )
    },
    {
      id: "severability",
      icon: FileText,
      title: "14. Severability",
      color: "purple",
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>
            If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
          </p>
        </div>
      )
    },
    {
      id: "entire-agreement",
      icon: FileText,
      title: "15. Entire Agreement",
      color: "pink",
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>
            These Terms of Service, together with our Privacy Policy and any other policies referenced herein, constitute the entire agreement between you and ONLYDJS regarding your use of the platform.
          </p>
        </div>
      )
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
              <Scale className="w-10 h-10 text-cyan-400" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Terms of Service
              </span>
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Please read these terms carefully before using ONLYDJS
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
              <span><strong className="text-white">Effective Date:</strong> February 8, 2026</span>
              <span>•</span>
              <span><strong className="text-white">Last Updated:</strong> February 19, 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="py-12 bg-slate-900/50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 bg-slate-900/50 border-slate-800">
              <h2 className="text-2xl font-bold text-white mb-6">Table of Contents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 hover:border-cyan-500/50 transition-all group"
                  >
                    <div className={`w-10 h-10 bg-${section.color}-500/10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <section.icon className={`w-5 h-5 text-${section.color}-400`} />
                    </div>
                    <span className="text-slate-300 group-hover:text-cyan-400 transition-colors text-sm">
                      {section.title}
                    </span>
                  </a>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Terms Sections */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-12">
            {sections.map((section) => (
              <Card key={section.id} id={section.id} className="p-8 bg-slate-900/50 border-slate-800 scroll-mt-24">
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-12 h-12 bg-${section.color}-500/10 rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <section.icon className={`w-6 h-6 text-${section.color}-400`} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-4">{section.title}</h2>
                    {section.content}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-slate-900/50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 bg-slate-900/50 border-slate-800">
              <h2 className="text-2xl font-bold text-white mb-4">16. Contact Information</h2>
              <div className="text-slate-300 space-y-4 leading-relaxed">
                <p>
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">Email:</span>
                    <a href="mailto:support@onlydjs.com" className="text-white hover:text-cyan-400 transition-colors">
                      support@onlydjs.com
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">Legal:</span>
                    <a href="mailto:legal@onlydjs.com" className="text-white hover:text-cyan-400 transition-colors">
                      legal@onlydjs.com
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">Contact Form:</span>
                    <a href="/contact" className="text-white hover:text-cyan-400 transition-colors">
                      /contact
                    </a>
                  </li>
                </ul>
                <div className="border-t border-slate-800 pt-6 mt-6">
                  <p className="text-sm text-slate-400">
                    By using ONLYDJS, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
