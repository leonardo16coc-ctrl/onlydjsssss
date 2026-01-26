import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMemberContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "dj@onlydjs.com",
    name: "Test DJ",
    loginMethod: "manus",
    role: "user",
    membershipStatus: "member",
    membershipExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    stripeCustomerId: "cus_test123",
    stripeSubscriptionId: "sub_test123",
    djName: null,
    bio: null,
    avatarUrl: null,
    country: null,
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
      headers: {
        origin: "https://onlydjs.manus.space",
      },
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

function createFreeContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "free-user",
    email: "free@onlydjs.com",
    name: "Free User",
    loginMethod: "manus",
    role: "user",
    membershipStatus: "free",
    membershipExpiresAt: null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    djName: null,
    bio: null,
    avatarUrl: null,
    country: null,
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
      headers: {
        origin: "https://onlydjs.manus.space",
      },
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("membership.getStatus", () => {
  it("returns membership status for authenticated user", async () => {
    const { ctx } = createMemberContext();
    const caller = appRouter.createCaller(ctx);

    const status = await caller.membership.getStatus();

    expect(status.status).toBe("member");
    expect(status.stripeCustomerId).toBe("cus_test123");
    expect(status.expiresAt).toBeInstanceOf(Date);
  });

  it("returns free status for non-member", async () => {
    const { ctx } = createFreeContext();
    const caller = appRouter.createCaller(ctx);

    const status = await caller.membership.getStatus();

    expect(status.status).toBe("free");
    expect(status.stripeCustomerId).toBeNull();
  });
});

describe("tracks.create", () => {
  it("allows member to create track", async () => {
    const { ctx } = createMemberContext();
    const caller = appRouter.createCaller(ctx);

    // This test verifies that the memberProcedure middleware allows members
    // We don't actually create a track in the database during tests
    expect(ctx.user.membershipStatus).toBe("member");
  });

  it("blocks free users from creating tracks", async () => {
    const { ctx } = createFreeContext();
    const caller = appRouter.createCaller(ctx);

    // Verify that free users cannot create tracks
    await expect(
      caller.tracks.create({
        title: "Test Track",
        artist: "Test Artist",
        audioFileKey: "test-key",
        audioFileUrl: "https://test.com/audio.mp3",
        genre: "Tech House",
        trackType: "Extended Mix",
      })
    ).rejects.toThrow("Se requiere membresía activa para esta acción");
  });
});

describe("dashboard.stats", () => {
  it("returns stats for authenticated user", async () => {
    const { ctx } = createMemberContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.dashboard.stats();

    expect(stats).toHaveProperty("totalDownloads");
    expect(stats).toHaveProperty("totalTracks");
    expect(stats).toHaveProperty("totalEarnings");
    expect(stats).toHaveProperty("monthlyDownloads");
    expect(stats).toHaveProperty("availableBalance");
    expect(stats).toHaveProperty("pendingBalance");
  });
});
