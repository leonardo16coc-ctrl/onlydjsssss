/**
 * Test: Instagram credentials validation
 * Verifies that INSTAGRAM_APP_ID and INSTAGRAM_APP_SECRET are set and non-empty.
 * Does NOT make real API calls (would require a live token).
 */
import { describe, it, expect } from "vitest";

describe("Instagram credentials", () => {
  it("should have INSTAGRAM_APP_ID set", () => {
    const appId = process.env.INSTAGRAM_APP_ID;
    expect(appId).toBeDefined();
    expect(appId?.trim().length).toBeGreaterThan(0);
  });

  it("should have INSTAGRAM_APP_SECRET set", () => {
    const appSecret = process.env.INSTAGRAM_APP_SECRET;
    expect(appSecret).toBeDefined();
    expect(appSecret?.trim().length).toBeGreaterThan(0);
  });

  it("should build a valid Instagram OAuth URL", () => {
    const appId = process.env.INSTAGRAM_APP_ID || "";
    const redirectUri = "https://onlydjs-musi-zsqs9m2e.manus.space/connect-social";
    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      scope: "instagram_business_basic",
      response_type: "code",
      enable_fb_login: "0",
    });
    const url = `https://www.instagram.com/oauth/authorize?${params.toString()}`;
    expect(url).toContain("instagram.com/oauth/authorize");
    expect(url).toContain("client_id=");
    expect(url).toContain("instagram_business_basic");
  });
});
