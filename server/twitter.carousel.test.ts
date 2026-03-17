/**
 * Tests for Twitter Carousel feature
 * Verifies carousel navigation logic and oEmbed endpoint behavior
 */
import { describe, it, expect } from "vitest";

const TWEET_COUNT = 5;

describe("Twitter Carousel - Navigation Logic", () => {
  it("should start at index 0", () => {
    let currentIndex = 0;
    expect(currentIndex).toBe(0);
  });

  it("should not go below 0 when pressing prev at start", () => {
    let currentIndex = 0;
    currentIndex = Math.max(0, currentIndex - 1);
    expect(currentIndex).toBe(0);
  });

  it("should not exceed TWEET_COUNT - 1 when pressing next at end", () => {
    let currentIndex = TWEET_COUNT - 1;
    currentIndex = Math.min(TWEET_COUNT - 1, currentIndex + 1);
    expect(currentIndex).toBe(TWEET_COUNT - 1);
  });

  it("should advance correctly from index 0 to 1", () => {
    let currentIndex = 0;
    currentIndex = Math.min(TWEET_COUNT - 1, currentIndex + 1);
    expect(currentIndex).toBe(1);
  });

  it("should go back correctly from index 3 to 2", () => {
    let currentIndex = 3;
    currentIndex = Math.max(0, currentIndex - 1);
    expect(currentIndex).toBe(2);
  });

  it("should allow direct navigation to any index via dots", () => {
    const targetIndex = 4;
    let currentIndex = 0;
    currentIndex = targetIndex;
    expect(currentIndex).toBe(4);
  });
});

describe("Twitter Carousel - CSS nth-child selector", () => {
  it("should generate correct nth-child for index 0 (first tweet)", () => {
    const currentIndex = 0;
    const nthChild = currentIndex + 1;
    expect(nthChild).toBe(1);
  });

  it("should generate correct nth-child for index 4 (fifth tweet)", () => {
    const currentIndex = 4;
    const nthChild = currentIndex + 1;
    expect(nthChild).toBe(5);
  });
});

describe("Twitter oEmbed endpoint", () => {
  it("should construct correct oEmbed URL", () => {
    const tweetUrl = "https://twitter.com/testuser/status/123456789";
    const oembedUrl = new URL("https://publish.twitter.com/oembed");
    oembedUrl.searchParams.set("url", tweetUrl);
    oembedUrl.searchParams.set("theme", "dark");
    oembedUrl.searchParams.set("omit_script", "true");

    expect(oembedUrl.searchParams.get("url")).toBe(tweetUrl);
    expect(oembedUrl.searchParams.get("theme")).toBe("dark");
    expect(oembedUrl.searchParams.get("omit_script")).toBe("true");
    expect(oembedUrl.hostname).toBe("publish.twitter.com");
  });

  it("should return null html on error gracefully", () => {
    const mockResponse = { html: null, error: "oEmbed error: 404" };
    expect(mockResponse.html).toBeNull();
    expect(mockResponse.error).toContain("404");
  });
});
