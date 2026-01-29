import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Music, Github, Twitter, Instagram, Mail } from "lucide-react";

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: t('footer.product'),
      links: [
        { label: t('nav.explore'), href: "/explore" },
        { label: t('nav.upload'), href: "/upload" },
        { label: t('nav.djMode'), href: "/dj-mode" },
        { label: t('nav.mainstage'), href: "/mainstage" },
      ],
    },
    {
      title: t('footer.company'),
      links: [
        { label: t('footer.about'), href: "/about" },
        { label: t('footer.blog'), href: "/blog" },
        { label: t('footer.careers'), href: "/careers" },
        { label: t('footer.contact'), href: "/contact" },
      ],
    },
    {
      title: t('footer.legal'),
      links: [
        { label: t('footer.privacy'), href: "/privacy" },
        { label: t('footer.terms'), href: "/terms" },
        { label: t('footer.cookies'), href: "/cookies" },
        { label: t('footer.dmca'), href: "/dmca" },
      ],
    },
    {
      title: t('footer.support'),
      links: [
        { label: t('footer.help'), href: "/help" },
        { label: t('footer.faq'), href: "/faq" },
        { label: t('footer.community'), href: "/community" },
        { label: t('footer.feedback'), href: "/feedback" },
      ],
    },
  ];

  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com/onlydjs", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com/onlydjs", label: "Instagram" },
    { icon: Github, href: "https://github.com/onlydjs", label: "GitHub" },
    { icon: Mail, href: "mailto:hello@onlydjs.com", label: "Email" },
  ];

  return (
    <footer className="border-t border-border bg-background">
      <div className="container py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Music className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">ONLYDJS</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              {t('footer.tagline')}
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-md border border-border hover:border-primary hover:bg-primary/10 flex items-center justify-center transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-3">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} ONLYDJS. {t('footer.rights')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('footer.madeWith')} <span className="text-red-500">♥</span> {t('footer.forDJs')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
