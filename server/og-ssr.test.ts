import { describe, it, expect } from "vitest";

describe("Open Graph SSR Endpoint", () => {
  const BOT_USER_AGENTS = [
    'facebookexternalhit', 'twitterbot', 'whatsapp', 'telegrambot',
    'slackbot', 'linkedinbot', 'discordbot', 'googlebot', 'bingbot',
    'applebot', 'pinterest', 'vkshare', 'w3c_validator', 'curl', 'wget',
    'python-requests', 'axios', 'node-fetch', 'got',
  ];

  const isBot = (userAgent: string = '') => {
    const ua = userAgent.toLowerCase();
    return BOT_USER_AGENTS.some(bot => ua.includes(bot));
  };

  it("detects WhatsApp bot correctly", () => {
    expect(isBot("WhatsApp/2.23.1")).toBe(true);
  });

  it("detects Telegram bot correctly", () => {
    expect(isBot("TelegramBot (like TwitterBot)")).toBe(true);
  });

  it("detects Facebook crawler correctly", () => {
    expect(isBot("facebookexternalhit/1.1")).toBe(true);
  });

  it("detects Discord bot correctly", () => {
    expect(isBot("Mozilla/5.0 (compatible; Discordbot/2.0)")).toBe(true);
  });

  it("does NOT flag regular Chrome browser as bot", () => {
    expect(isBot("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0")).toBe(false);
  });

  it("does NOT flag Safari as bot", () => {
    expect(isBot("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1")).toBe(false);
  });

  it("builds canonical URL with username", () => {
    const track = { id: 42, username: "djnexus" };
    const siteUrl = 'https://www.onlydjss.com';
    const url = track.username
      ? `${siteUrl}/dj/${track.username}/track/${track.id}`
      : `${siteUrl}/track/${track.id}`;
    expect(url).toBe("https://www.onlydjss.com/dj/djnexus/track/42");
  });

  it("builds fallback URL without username", () => {
    const track = { id: 42, username: null };
    const siteUrl = 'https://www.onlydjss.com';
    const url = track.username
      ? `${siteUrl}/dj/${track.username}/track/${track.id}`
      : `${siteUrl}/track/${track.id}`;
    expect(url).toBe("https://www.onlydjss.com/track/42");
  });

  it("builds OG title with trackType and djName", () => {
    const track = { title: "Acid Rain", trackType: "Remix", djName: "DJ Nexus" };
    const typeInfo = track.trackType ? ` [${track.trackType}]` : '';
    const title = `${track.title}${typeInfo} — ${track.djName}`;
    expect(title).toBe("Acid Rain [Remix] — DJ Nexus");
  });

  it("builds OG description with genre, BPM and key", () => {
    const track = { genre: "Tech House", bpm: 128, musicalKey: "Am" };
    const bpmInfo = track.bpm ? ` • ${track.bpm} BPM` : '';
    const keyInfo = track.musicalKey ? ` • ${track.musicalKey}` : '';
    const description = `${track.genre}${bpmInfo}${keyInfo} | Escúchalo y descárgalo en ONLYDJS — La plataforma de DJs profesionales.`;
    expect(description).toBe("Tech House • 128 BPM • Am | Escúchalo y descárgalo en ONLYDJS — La plataforma de DJs profesionales.");
  });

  it("uses fallback image when no cover art", () => {
    const track = { coverImageUrl: null };
    const siteUrl = 'https://www.onlydjss.com';
    const image = track.coverImageUrl || `${siteUrl}/logo-new-gradient.webp`;
    expect(image).toBe("https://www.onlydjss.com/logo-new-gradient.webp");
  });
});
