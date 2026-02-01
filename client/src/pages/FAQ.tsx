import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

export default function FAQ() {
  const { t } = useTranslation();

  const faqSections = [
    {
      id: "monetization",
      title: t("faq.monetization.title"),
      icon: "💰",
      questions: [
        {
          q: t("faq.monetization.q1"),
          a: t("faq.monetization.a1"),
        },
        {
          q: t("faq.monetization.q2"),
          a: t("faq.monetization.a2"),
        },
        {
          q: t("faq.monetization.q3"),
          a: t("faq.monetization.a3"),
        },
        {
          q: t("faq.monetization.q4"),
          a: t("faq.monetization.a4"),
        },
      ],
    },
    {
      id: "djscore",
      title: t("faq.djscore.title"),
      icon: "📊",
      questions: [
        {
          q: t("faq.djscore.q1"),
          a: t("faq.djscore.a1"),
        },
        {
          q: t("faq.djscore.q2"),
          a: t("faq.djscore.a2"),
        },
        {
          q: t("faq.djscore.q3"),
          a: t("faq.djscore.a3"),
        },
      ],
    },
    {
      id: "payments",
      title: t("faq.payments.title"),
      icon: "💳",
      questions: [
        {
          q: t("faq.payments.q1"),
          a: t("faq.payments.a1"),
        },
        {
          q: t("faq.payments.q2"),
          a: t("faq.payments.a2"),
        },
        {
          q: t("faq.payments.q3"),
          a: t("faq.payments.a3"),
        },
        {
          q: t("faq.payments.q4"),
          a: t("faq.payments.a4"),
        },
      ],
    },
    {
      id: "ambassador",
      title: t("faq.ambassador.title"),
      icon: "🤝",
      questions: [
        {
          q: t("faq.ambassador.q1"),
          a: t("faq.ambassador.a1"),
        },
        {
          q: t("faq.ambassador.q2"),
          a: t("faq.ambassador.a2"),
        },
        {
          q: t("faq.ambassador.q3"),
          a: t("faq.ambassador.a3"),
        },
      ],
    },
    {
      id: "membership",
      title: t("faq.membership.title"),
      icon: "⭐",
      questions: [
        {
          q: t("faq.membership.q1"),
          a: t("faq.membership.a1"),
        },
        {
          q: t("faq.membership.q2"),
          a: t("faq.membership.a2"),
        },
        {
          q: t("faq.membership.q3"),
          a: t("faq.membership.a3"),
        },
        {
          q: t("faq.membership.q4"),
          a: t("faq.membership.a4"),
        },
      ],
    },
    {
      id: "uploads",
      title: t("faq.uploads.title"),
      icon: "📤",
      questions: [
        {
          q: t("faq.uploads.q1"),
          a: t("faq.uploads.a1"),
        },
        {
          q: t("faq.uploads.q2"),
          a: t("faq.uploads.a2"),
        },
        {
          q: t("faq.uploads.q3"),
          a: t("faq.uploads.a3"),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950">
      {/* Hero Section */}
      <div className="container py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {t("faq.hero.title")}
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            {t("faq.hero.subtitle")}
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="max-w-4xl mx-auto space-y-8">
          {faqSections.map((section) => (
            <Card
              key={section.id}
              className="bg-slate-900/50 border-slate-800 backdrop-blur-sm p-6"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                <span className="text-3xl">{section.icon}</span>
                {section.title}
              </h2>

              <Accordion type="single" collapsible className="space-y-4">
                {section.questions.map((item, idx) => (
                  <AccordionItem
                    key={`${section.id}-${idx}`}
                    value={`${section.id}-${idx}`}
                    className="border-slate-700"
                  >
                    <AccordionTrigger className="text-left text-lg font-semibold text-slate-200 hover:text-cyan-400 transition-colors">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-400 leading-relaxed whitespace-pre-line">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border-cyan-500/20 backdrop-blur-sm p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-white">
              {t("faq.cta.title")}
            </h3>
            <p className="text-slate-300 mb-6">
              {t("faq.cta.description")}
            </p>
            <a
              href="mailto:support@onlydjs.com"
              className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all"
            >
              {t("faq.cta.button")}
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
}
