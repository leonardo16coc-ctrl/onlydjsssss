import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Music, Github, Twitter, Instagram, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // TODO: Implement newsletter subscription
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3000);
  };

  const footerLinks = [
    {
      title: "Product",
      links: [
        { label: "Discover", href: "/discover" },
        { label: "DJ MODE", href: "/dj-mode" },
        { label: "Mainstage", href: "/mainstage" },
        { label: "Network", href: "/network" },
        { label: "Creator Hub", href: "/upload" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Careers", href: "/careers" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Help Center", href: "/help" },
        { label: "FAQ", href: "/faq" },
        { label: "Community", href: "/community" },
        { label: "API Docs", href: "/api-docs" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms of Service", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Copyright / DMCA", href: "/copyright" },
        { label: "Cookie Policy", href: "/cookies" },
      ],
    },
  ];

  const socialLinks = [
    { icon: Twitter, href: "https://x.com/onlydjss", label: "Twitter" },
    { icon: Instagram, href: "https://www.instagram.com/onlydjss/", label: "Instagram" },
    { icon: Github, href: "https://github.com/onlydjs", label: "GitHub" },
    { icon: Mail, href: "mailto:hello@onlydjs.com", label: "Email" },
  ];

  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="container py-16">
        {/* Top Section - Newsletter */}
        <div className="mb-12 pb-12 border-b border-slate-800">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Stay in the loop
            </h3>
            <p className="text-slate-400 mb-6">
              Get the latest tracks, features, and DJ tips delivered to your inbox
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500"
                required
              />
              <Button 
                type="submit"
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
                disabled={subscribed}
              >
                <Send className="w-4 h-4 mr-2" />
                {subscribed ? "Subscribed!" : "Subscribe"}
              </Button>
            </form>
            {subscribed && (
              <p className="text-sm text-green-400 mt-3">
                Thanks for subscribing! You'll receive updates about new features and tracks.
              </p>
            )}
          </div>
        </div>

        {/* Middle Section - Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <Music className="h-6 w-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              <span className="text-xl font-bold text-white">ONLYDJS</span>
            </Link>
            <p className="text-sm text-slate-400 mb-6 max-w-xs">
              The Operating System for DJs. Create, manage, monetize, and grow your DJ career from one platform.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500 hover:bg-slate-800 flex items-center justify-center transition-all hover:scale-110"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4 text-slate-400 hover:text-cyan-400" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-4 text-white">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
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
        <div className="pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © {currentYear} ONLYDJS. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <span>Made with <span className="text-red-500">♥</span> for DJs worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
