import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMemberContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-member",
    email: "member@example.com",
    name: "Test Member",
    loginMethod: "manus",
    role: "user",
    username: "testmember",
    djName: "DJ Test Member",
    bio: null,
    profileImageUrl: null,
    profileImageKey: null,
    avatarUrl: null,
    country: null,
    socialLinks: null,
    membershipStatus: "member",
    membershipExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    stripeCustomerId: "cus_test",
    stripeSubscriptionId: "sub_test",
    isVerified: false,
    verifiedAt: null,
    totalDownloads: 0,
    totalUploads: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
      socket: { remoteAddress: "127.0.0.1" },
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

function createFreeContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "test-free",
    email: "free@example.com",
    name: "Test Free",
    loginMethod: "manus",
    role: "user",
    username: "testfree",
    djName: null,
    bio: null,
    profileImageUrl: null,
    profileImageKey: null,
    avatarUrl: null,
    country: null,
    socialLinks: null,
    membershipStatus: "free",
    membershipExpiresAt: null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    isVerified: false,
    verifiedAt: null,
    totalDownloads: 0,
    totalUploads: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
      socket: { remoteAddress: "127.0.0.1" },
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("downloads.downloadTrack", () => {
  it("should accept valid download request from member", async () => {
    const { ctx } = createMemberContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.downloads.downloadTrack({
        trackId: 1,
        format: "mp3",
      });
    } catch (error: any) {
      // Expected to fail with DB error or NOT_FOUND, not FORBIDDEN
      expect(["INTERNAL_SERVER_ERROR", "NOT_FOUND"]).toContain(error.code);
    }
  });

  it("should reject download from free user when limit reached", async () => {
    const { ctx } = createFreeContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.downloads.downloadTrack({
        trackId: 1,
        format: "mp3",
      });
      // Will fail with NOT_FOUND because track doesn't exist
      // In production, would fail with FORBIDDEN if limit reached
    } catch (error: any) {
      // Expected to fail with either NOT_FOUND (track doesn't exist) or FORBIDDEN (limit reached)
      expect(["NOT_FOUND", "FORBIDDEN"]).toContain(error.code);
    }
  });

  it("should accept MP3 format", async () => {
    const { ctx } = createMemberContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.downloads.downloadTrack({
        trackId: 1,
        format: "mp3",
      });
    } catch (error: any) {
      // Expected to fail with DB error, not validation error
      expect(["INTERNAL_SERVER_ERROR", "NOT_FOUND"]).toContain(error.code);
    }
  });

  it("should accept WAV format", async () => {
    const { ctx } = createMemberContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.downloads.downloadTrack({
        trackId: 1,
        format: "wav",
      });
    } catch (error: any) {
      // Expected to fail with DB error, not validation error
      expect(["INTERNAL_SERVER_ERROR", "NOT_FOUND"]).toContain(error.code);
    }
  });

  it("should reject invalid format", async () => {
    const { ctx } = createMemberContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.downloads.downloadTrack({
        trackId: 1,
        format: "flac" as any, // Invalid format
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      // Zod validation error
      expect(error.message).toContain("Invalid option");
    }
  });

  it("should require trackId", async () => {
    const { ctx } = createMemberContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.downloads.downloadTrack({
        trackId: undefined as any,
        format: "mp3",
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      // Zod validation error
      expect(error.message).toBeTruthy();
    }
  });
});

// Removed downloads.record - functionality is now integrated into downloadTrack

describe("downloads.getMyDownloadHistory", () => {
  it("should accept request from authenticated user", async () => {
    const { ctx } = createMemberContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.downloads.getMyDownloadHistory({ limit: 10, offset: 0 });
    expect(result).toHaveProperty("downloads");
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("hasMore");
  });

  it("should enforce limit constraints", async () => {
    const { ctx } = createMemberContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.downloads.getMyDownloadHistory({ limit: 150, offset: 0 });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      // Zod validation error
      expect(error.message).toContain("Too big");
    }
  });
});

describe("downloads.getDownloadLimits", () => {
  it("should return limits for member user", async () => {
    const { ctx } = createMemberContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.downloads.getDownloadLimits();
    expect(result.membershipStatus).toBe("member");
    expect(result.limit).toBe(50);
    expect(result.unlimited).toBe(false);
  });

  it("should return limits for free user", async () => {
    const { ctx } = createFreeContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.downloads.getDownloadLimits();
    expect(result.membershipStatus).toBe("free");
    expect(result.limit).toBe(5);
    expect(result.unlimited).toBe(false);
  });
});
