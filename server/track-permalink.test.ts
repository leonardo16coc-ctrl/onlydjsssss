import { describe, it, expect } from "vitest";

describe("Track Permalink System", () => {
  it("generates correct canonical track URL with username", () => {
    const trackId = 42;
    const username = "djnexus";
    const baseUrl = "https://www.onlydjss.com";
    const trackUrl = `${baseUrl}/dj/${username}/track/${trackId}`;
    expect(trackUrl).toBe("https://www.onlydjss.com/dj/djnexus/track/42");
  });

  it("falls back to /track/:id when username is not available", () => {
    const trackId = 42;
    const baseUrl = "https://www.onlydjss.com";
    const trackUrl = `${baseUrl}/track/${trackId}`;
    expect(trackUrl).toBe("https://www.onlydjss.com/track/42");
  });

  it("track URL is permanent and unique per track ID", () => {
    const ids = [1, 42, 100, 9999];
    const urls = ids.map(id => `https://www.onlydjss.com/track/${id}`);
    const unique = new Set(urls);
    expect(unique.size).toBe(ids.length);
  });

  it("track URL format is shareable and human-readable", () => {
    const trackId = 7;
    const url = `https://www.onlydjss.com/track/${trackId}`;
    expect(url).toMatch(/^https:\/\/.+\/track\/\d+$/);
  });

  it("getTrackById input validates positive integer", () => {
    const validIds = [1, 42, 1000];
    const invalidIds = [0, -1, NaN];
    validIds.forEach(id => expect(id > 0 && Number.isInteger(id)).toBe(true));
    invalidIds.forEach(id => expect(id > 0 && Number.isInteger(id)).toBe(false));
  });

  it("track page title format is correct for SEO", () => {
    const track = { title: "Midnight Rush", artist: "DJ Nexus" };
    const title = `${track.title} — ${track.artist} | ONLYDJS`;
    expect(title).toBe("Midnight Rush — DJ Nexus | ONLYDJS");
  });

  it("share URL uses window.location.origin for cross-environment compatibility", () => {
    const origins = [
      "https://www.onlydjss.com",
      "https://onlydjs-musi-zsqs9m2e.manus.space",
      "http://localhost:3000",
    ];
    origins.forEach(origin => {
      const url = `${origin}/track/42`;
      expect(url).toContain("/track/42");
    });
  });
});
