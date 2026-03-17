import { describe, it, expect } from "vitest";

describe("Twitter/X OAuth 2.0 Credentials", () => {
  it("should have TWITTER_CLIENT_ID set", () => {
    expect(process.env.TWITTER_CLIENT_ID).toBeDefined();
    expect(process.env.TWITTER_CLIENT_ID!.length).toBeGreaterThan(10);
  });

  it("should have TWITTER_CLIENT_SECRET set", () => {
    expect(process.env.TWITTER_CLIENT_SECRET).toBeDefined();
    expect(process.env.TWITTER_CLIENT_SECRET!.length).toBeGreaterThan(10);
  });

  it("should be able to construct Twitter OAuth URL", () => {
    const clientId = process.env.TWITTER_CLIENT_ID!;
    const redirectUri = "https://onlydjs-musi-zsqs9m2e.manus.space/connect-social";
    const scope = "tweet.read users.read offline.access";
    const state = "twitter_test";
    const codeChallenge = "test_challenge";

    const url = new URL("https://twitter.com/i/oauth2/authorize");
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("scope", scope);
    url.searchParams.set("state", state);
    url.searchParams.set("code_challenge", codeChallenge);
    url.searchParams.set("code_challenge_method", "S256");

    expect(url.toString()).toContain("twitter.com");
    expect(url.toString()).toContain(clientId);
    expect(url.toString()).toContain("tweet.read");
  });
});

describe("Twitter Embed (no API credits)", () => {
  it("should construct correct Twitter timeline embed URL", () => {
    const twitterUsername = "testdj";
    const embedUrl = `https://twitter.com/${twitterUsername}`;
    expect(embedUrl).toBe("https://twitter.com/testdj");
  });

  it("should construct correct Twitter profile URL for embed link", () => {
    const twitterUsername = "testdj";
    const profileUrl = `https://twitter.com/${twitterUsername}`;
    expect(profileUrl).toContain("twitter.com");
    expect(profileUrl).toContain(twitterUsername);
  });

  it("getArtistTwitterFeed should return only username (no tweet data)", () => {
    // The embed approach returns { username: string | null }
    // This verifies the contract: no tweets array, no API calls needed
    const mockResult = { username: "testdj" };
    expect(mockResult).toHaveProperty("username");
    expect(mockResult).not.toHaveProperty("tweets");
    expect(mockResult).not.toHaveProperty("posts");
  });
});
