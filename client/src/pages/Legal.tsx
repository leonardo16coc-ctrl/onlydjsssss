import { Link } from "wouter";
import { Helmet } from "react-helmet";
import { FileText, Shield, Copyright as CopyrightIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Legal() {
  const legalPages = [
    {
      title: "Terms of Service",
      description: "Our terms govern your use of ONLYDJS. Learn about subscriptions, user responsibilities, acceptable use, and platform policies.",
      icon: FileText,
      link: "/terms",
      color: "text-blue-500"
    },
    {
      title: "Privacy Policy",
      description: "Understand how we collect, use, and protect your personal information. Review your data rights and our security practices.",
      icon: Shield,
      link: "/privacy",
      color: "text-green-500"
    },
    {
      title: "Copyright & DMCA",
      description: "Our copyright policy and DMCA procedures. Learn how to report infringement or submit counter-notifications.",
      icon: CopyrightIcon,
      link: "/copyright",
      color: "text-purple-500"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Legal Information - ONLYDJS</title>
        <meta name="description" content="Access ONLYDJS legal policies: Terms of Service, Privacy Policy, and Copyright/DMCA procedures. Review your rights, data protection practices, and platform guidelines." />
      </Helmet>
      <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Legal Information</h1>
            <p className="text-lg text-muted-foreground">
              Review our legal policies and terms. These documents outline your rights, responsibilities, and how we protect your information.
            </p>
          </div>

          {/* Legal Pages Grid */}
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            {legalPages.map((page) => {
              const Icon = page.icon;
              return (
                <Link key={page.link} href={page.link}>
                  <Card className="h-full transition-all hover:shadow-lg hover:border-primary cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className={`h-8 w-8 ${page.color}`} />
                      </div>
                      <CardTitle className="text-xl">{page.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {page.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <span className="text-sm text-primary hover:underline">
                        Read full document →
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Additional Information */}
          <div className="mt-12 p-6 bg-muted rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Questions or Concerns?</h2>
            <p className="text-muted-foreground mb-4">
              If you have any questions about our legal policies or need clarification on any terms, please don't hesitate to contact us.
            </p>
            <div className="space-y-2 text-sm">
              <p>
                <strong>General Inquiries:</strong>{" "}
                <a href="mailto:support@onlydjss.com" className="text-primary hover:underline">
                  support@onlydjss.com
                </a>
              </p>
              <p>
                <strong>Privacy Concerns:</strong>{" "}
                <a href="mailto:privacy@onlydjss.com" className="text-primary hover:underline">
                  privacy@onlydjss.com
                </a>
              </p>
              <p>
                <strong>Copyright/DMCA:</strong>{" "}
                <a href="mailto:dmca@onlydjss.com" className="text-primary hover:underline">
                  dmca@onlydjss.com
                </a>
              </p>
            </div>
          </div>

          {/* Last Updated */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>All legal documents were last updated on February 8, 2026</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
