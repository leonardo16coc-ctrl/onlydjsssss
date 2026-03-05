import { useEffect } from "react";

interface SEOOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";
  /** Extra arbitrary meta tags keyed by property or name */
  extra?: Record<string, string>;
}

const DEFAULT_TITLE = "ONLYDJS – The Operating System for DJs";
const DEFAULT_DESCRIPTION =
  "Create AI-powered DJ sets, manage your music library, monetize content, and track performance analytics — all from one cloud platform.";
const DEFAULT_IMAGE = "https://www.onlydjss.com/logo-new-gradient.webp";
const DEFAULT_URL = "https://www.onlydjss.com";

/**
 * Injects dynamic SEO meta tags into <head>.
 * Restores defaults when the component unmounts.
 */
export function useSEO(options: SEOOptions) {
  useEffect(() => {
    const {
      title = DEFAULT_TITLE,
      description = DEFAULT_DESCRIPTION,
      image = DEFAULT_IMAGE,
      url = DEFAULT_URL,
      type = "website",
      twitterCard = "summary_large_image",
      extra = {},
    } = options;

    // ── helpers ────────────────────────────────────────────────────────────
    const setMeta = (attr: "property" | "name", key: string, content: string) => {
      let tag = document.querySelector<HTMLMetaElement>(
        `meta[${attr}="${key}"]`
      );
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    const setOG = (key: string, content: string) => setMeta("property", key, content);
    const setTW = (key: string, content: string) => setMeta("name", key, content);

    // ── document title ─────────────────────────────────────────────────────
    const prevTitle = document.title;
    document.title = title;

    // ── standard meta ──────────────────────────────────────────────────────
    setMeta("name", "description", description);

    // ── Open Graph ─────────────────────────────────────────────────────────
    setOG("og:title", title);
    setOG("og:description", description);
    setOG("og:image", image);
    setOG("og:url", url);
    setOG("og:type", type);
    setOG("og:site_name", "ONLYDJS");

    // ── Twitter Card ───────────────────────────────────────────────────────
    setTW("twitter:card", twitterCard);
    setTW("twitter:title", title);
    setTW("twitter:description", description);
    setTW("twitter:image", image);
    setTW("twitter:site", "@onlydjs");

    // ── extra tags ─────────────────────────────────────────────────────────
    Object.entries(extra).forEach(([key, content]) => {
      const attr = key.startsWith("og:") || key.startsWith("music:") ? "property" : "name";
      setMeta(attr, key, content);
    });

    // ── cleanup: restore defaults on unmount ───────────────────────────────
    return () => {
      document.title = prevTitle || DEFAULT_TITLE;
      setMeta("name", "description", DEFAULT_DESCRIPTION);
      setOG("og:title", DEFAULT_TITLE);
      setOG("og:description", DEFAULT_DESCRIPTION);
      setOG("og:image", DEFAULT_IMAGE);
      setOG("og:url", DEFAULT_URL);
      setOG("og:type", "website");
      setTW("twitter:card", "summary_large_image");
      setTW("twitter:title", DEFAULT_TITLE);
      setTW("twitter:description", DEFAULT_DESCRIPTION);
      setTW("twitter:image", DEFAULT_IMAGE);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(options)]);
}
