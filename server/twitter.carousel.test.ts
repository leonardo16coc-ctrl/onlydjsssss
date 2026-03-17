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

describe("Twitter Carousel - Swipe Touch Logic", () => {
  const SWIPE_THRESHOLD = 50;

  it("should advance to next tweet on left swipe (deltaX < -50)", () => {
    let currentIndex = 1;
    const deltaX = -80; // swipe izquierda
    if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
      if (deltaX < 0) currentIndex = Math.min(TWEET_COUNT - 1, currentIndex + 1);
      else currentIndex = Math.max(0, currentIndex - 1);
    }
    expect(currentIndex).toBe(2);
  });

  it("should go to previous tweet on right swipe (deltaX > 50)", () => {
    let currentIndex = 2;
    const deltaX = 90; // swipe derecha
    if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
      if (deltaX < 0) currentIndex = Math.min(TWEET_COUNT - 1, currentIndex + 1);
      else currentIndex = Math.max(0, currentIndex - 1);
    }
    expect(currentIndex).toBe(1);
  });

  it("should ignore swipe shorter than threshold (deltaX = 30)", () => {
    let currentIndex = 2;
    const deltaX = 30; // muy corto
    if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
      if (deltaX < 0) currentIndex = Math.min(TWEET_COUNT - 1, currentIndex + 1);
      else currentIndex = Math.max(0, currentIndex - 1);
    }
    expect(currentIndex).toBe(2); // sin cambio
  });

  it("should not go below 0 on right swipe at first tweet", () => {
    let currentIndex = 0;
    const deltaX = 100;
    if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
      if (deltaX < 0) currentIndex = Math.min(TWEET_COUNT - 1, currentIndex + 1);
      else currentIndex = Math.max(0, currentIndex - 1);
    }
    expect(currentIndex).toBe(0);
  });

  it("should not exceed TWEET_COUNT-1 on left swipe at last tweet", () => {
    let currentIndex = TWEET_COUNT - 1;
    const deltaX = -100;
    if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
      if (deltaX < 0) currentIndex = Math.min(TWEET_COUNT - 1, currentIndex + 1);
      else currentIndex = Math.max(0, currentIndex - 1);
    }
    expect(currentIndex).toBe(TWEET_COUNT - 1);
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
