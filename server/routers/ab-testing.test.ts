import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "../routers";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

describe("A/B Testing Router", () => {
  let testId: number;
  let variantAId: number;
  let variantBId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Clean up any existing test data
    await db.execute(sql`DELETE FROM ab_test_variants WHERE ab_test_id IN (SELECT id FROM ab_tests WHERE name LIKE 'Test%')`);
    await db.execute(sql`DELETE FROM ab_tests WHERE name LIKE 'Test%'`);
  });

  it("should create a new A/B test with variants", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, email: "test@example.com", name: "Test", role: "admin", membershipStatus: "active" },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.abTesting.createTest({
      name: "Test Subject Lines - January 2026",
      description: "Testing different subject line approaches",
      variants: [
        { variant_name: "A", subject_line: "🎵 Únete a ONLYDJS - La plataforma para DJs" },
        { variant_name: "B", subject_line: "Invitación exclusiva: ONLYDJS te espera" },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.testId).toBeDefined();
    testId = result.testId;
  });

  it("should get all A/B tests", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, email: "test@example.com", name: "Test", role: "admin", membershipStatus: "active" },
      req: {} as any,
      res: {} as any,
    });

    const tests = await caller.abTesting.getTests();

    expect(Array.isArray(tests)).toBe(true);
    expect(tests.length).toBeGreaterThan(0);
    
    const ourTest = tests.find((t: any) => t.name === "Test Subject Lines - January 2026");
    expect(ourTest).toBeDefined();
    expect(ourTest.variant_count).toBe(2);
  });

  it("should get test results with variants", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, email: "test@example.com", name: "Test", role: "admin", membershipStatus: "active" },
      req: {} as any,
      res: {} as any,
    });

    const results = await caller.abTesting.getTestResults({ testId });

    expect(results).toBeDefined();
    expect(results.test).toBeDefined();
    expect(results.test.name).toBe("Test Subject Lines - January 2026");
    expect(results.variants).toBeDefined();
    expect(results.variants.length).toBe(2);
    expect(results.isSignificant).toBe(false); // No data yet

    // Store variant IDs for later tests
    variantAId = results.variants[0].id;
    variantBId = results.variants[1].id;
  });

  it("should update test status", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, email: "test@example.com", name: "Test", role: "admin", membershipStatus: "active" },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.abTesting.updateTestStatus({
      testId,
      status: "paused",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("paused");
  });

  it("should reactivate test", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, email: "test@example.com", name: "Test", role: "admin", membershipStatus: "active" },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.abTesting.updateTestStatus({
      testId,
      status: "active",
    });

    expect(result.success).toBe(true);
  });

  it("should declare winner and complete test", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, email: "test@example.com", name: "Test", role: "admin", membershipStatus: "active" },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.abTesting.declareWinner({
      testId,
      variantId: variantAId,
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("ganadora");
    expect(result.winner).toBeDefined();
  });

  it("should get overall stats", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, email: "test@example.com", name: "Test", role: "admin", membershipStatus: "active" },
      req: {} as any,
      res: {} as any,
    });

    const stats = await caller.abTesting.getOverallStats();

    expect(stats).toBeDefined();
    expect(stats.total_tests).toBeGreaterThanOrEqual(1);
    expect(stats.completed_tests).toBeGreaterThanOrEqual(1);
  });

  it("should require authentication", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    await expect(caller.abTesting.getTests()).rejects.toThrow();
  });

  it("should validate minimum 2 variants", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, email: "test@example.com", name: "Test", role: "admin", membershipStatus: "active" },
      req: {} as any,
      res: {} as any,
    });

    await expect(
      caller.abTesting.createTest({
        name: "Invalid Test",
        description: "Only one variant",
        variants: [
          { variant_name: "A", subject_line: "Test" },
        ],
      })
    ).rejects.toThrow();
  });

  it("should validate maximum 5 variants", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, email: "test@example.com", name: "Test", role: "admin", membershipStatus: "active" },
      req: {} as any,
      res: {} as any,
    });

    await expect(
      caller.abTesting.createTest({
        name: "Invalid Test",
        description: "Too many variants",
        variants: [
          { variant_name: "A", subject_line: "Test 1" },
          { variant_name: "B", subject_line: "Test 2" },
          { variant_name: "C", subject_line: "Test 3" },
          { variant_name: "D", subject_line: "Test 4" },
          { variant_name: "E", subject_line: "Test 5" },
          { variant_name: "F", subject_line: "Test 6" },
        ],
      })
    ).rejects.toThrow();
  });
});
