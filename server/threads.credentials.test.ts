/**
 * Test: Threads credentials validation
 * Verifies that THREADS_APP_ID and THREADS_APP_SECRET are set and non-empty.
 */
import { describe, it, expect } from "vitest";

describe("Threads credentials", () => {
  it("should have THREADS_APP_ID set", () => {
    const appId = process.env.THREADS_APP_ID;
    expect(appId).toBeDefined();
    expect(appId?.trim().length).toBeGreaterThan(0);
  });

  it("should have THREADS_APP_SECRET set", () => {
    const appSecret = process.env.THREADS_APP_SECRET;
    expect(appSecret).toBeDefined();
    expect(appSecret?.trim().length).toBeGreaterThan(0);
  });

  it("should build a valid Threads OAuth URL", () => {
    const appId = process.env.THREADS_APP_ID || "";
    const redirectUri = "https://onlydjs-musi-zsqs9m2e.manus.space/connect-social";
    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      scope: "threads_basic,threads_content_publish,threads_read_replies",
      response_type: "code",
    });
    const url = `https://threads.net/oauth/authorize?${params.toString()}`;
    expect(url).toContain("threads.net/oauth/authorize");
    expect(url).toContain("client_id=");
    expect(url).toContain("threads_basic");
  });
});
