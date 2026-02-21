import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "../routers";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

describe("Email Analytics Router", () => {
  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Insert test data for email campaigns
    await db.execute(sql`
      INSERT IGNORE INTO email_campaigns 
      (dj_id, email_to, subject, message_text, platform, status, sent_at, opened_at, clicked_at, replied_at)
      VALUES 
      (1, 'test1@example.com', 'Test Email 1', 'Test message', 'email', 'sent', NOW(), NOW(), NOW(), NULL),
      (2, 'test2@example.com', 'Test Email 2', 'Test message', 'email', 'sent', NOW(), NOW(), NULL, NULL),
      (3, 'test3@example.com', 'Test Email 3', 'Test message', 'instagram', 'sent', NOW(), NULL, NULL, NULL)
    `);
  });

  it("should get overall email stats", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, email: "test@example.com", name: "Test", role: "admin", membershipStatus: "active" },
      req: {} as any,
      res: {} as any,
    });

    const stats = await caller.emailAnalytics.getOverallStats();

    expect(stats).toBeDefined();
    expect(stats.total_sent).toBeGreaterThanOrEqual(0);
    expect(stats.open_rate).toBeGreaterThanOrEqual(0);
    expect(stats.click_rate).toBeGreaterThanOrEqual(0);
    expect(stats.reply_rate).toBeGreaterThanOrEqual(0);
  });

  it("should get stats by date range", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, email: "test@example.com", name: "Test", role: "admin", membershipStatus: "active" },
      req: {} as any,
      res: {} as any,
    });

    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = new Date().toISOString();

    const stats = await caller.emailAnalytics.getStatsByDateRange({
      startDate,
      endDate,
    });

    expect(Array.isArray(stats)).toBe(true);
  });

  it("should get stats by platform", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, email: "test@example.com", name: "Test", role: "admin", membershipStatus: "active" },
      req: {} as any,
      res: {} as any,
    });

    const stats = await caller.emailAnalytics.getStatsByPlatform();

    expect(Array.isArray(stats)).toBe(true);
    if (stats.length > 0) {
      expect(stats[0]).toHaveProperty("platform");
      expect(stats[0]).toHaveProperty("total_sent");
      expect(stats[0]).toHaveProperty("open_rate");
      expect(stats[0]).toHaveProperty("click_rate");
    }
  });

  it("should get conversion funnel stats", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, email: "test@example.com", name: "Test", role: "admin", membershipStatus: "active" },
      req: {} as any,
      res: {} as any,
    });

    const funnel = await caller.emailAnalytics.getConversionFunnel();

    expect(funnel).toBeDefined();
    expect(funnel).toHaveProperty("discovered");
    expect(funnel).toHaveProperty("contacted");
    expect(funnel).toHaveProperty("opened");
    expect(funnel).toHaveProperty("clicked");
    expect(funnel).toHaveProperty("replied");
    expect(funnel).toHaveProperty("converted");
    expect(funnel).toHaveProperty("open_rate");
    expect(funnel).toHaveProperty("click_rate");
    expect(funnel).toHaveProperty("reply_rate");
  });

  it("should get recent campaigns", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, email: "test@example.com", name: "Test", role: "admin", membershipStatus: "active" },
      req: {} as any,
      res: {} as any,
    });

    const campaigns = await caller.emailAnalytics.getRecentCampaigns({ limit: 10 });

    expect(Array.isArray(campaigns)).toBe(true);
    if (campaigns.length > 0) {
      expect(campaigns[0]).toHaveProperty("email_to");
      expect(campaigns[0]).toHaveProperty("subject");
      expect(campaigns[0]).toHaveProperty("platform");
      expect(campaigns[0]).toHaveProperty("status");
      expect(campaigns[0]).toHaveProperty("sent_at");
    }
  });

  it("should get stats by genre", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, email: "test@example.com", name: "Test", role: "admin", membershipStatus: "active" },
      req: {} as any,
      res: {} as any,
    });

    const stats = await caller.emailAnalytics.getStatsByGenre();

    expect(Array.isArray(stats)).toBe(true);
    if (stats.length > 0) {
      expect(stats[0]).toHaveProperty("genre");
      expect(stats[0]).toHaveProperty("total_sent");
      expect(stats[0]).toHaveProperty("open_rate");
    }
  });

  it("should require authentication", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    await expect(caller.emailAnalytics.getOverallStats()).rejects.toThrow();
  });
});
