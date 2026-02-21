import { describe, it, expect } from "vitest";
import { Resend } from "resend";

describe("Resend API Key Validation", () => {
  it("should validate Resend API key by checking API keys list", async () => {
    const apiKey = process.env.RESEND_API_KEY;
    
    expect(apiKey).toBeDefined();
    expect(apiKey).toMatch(/^re_[a-zA-Z0-9_]+$/);
    
    const resend = new Resend(apiKey);
    
    // Test API key by listing API keys (lightweight endpoint)
    const result = await resend.apiKeys.list();
    
    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data?.data)).toBe(true);
  }, 10000);
});
