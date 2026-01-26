import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    username: "testuser",
    djName: "DJ Test",
    bio: null,
    profileImageUrl: null,
    profileImageKey: null,
    avatarUrl: null,
    country: null,
    socialLinks: null,
    membershipStatus: "member",
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
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("search.advancedSearch", () => {
  it("should accept valid search filters", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.search.advancedSearch({
        query: "test track",
        bpmMin: 120,
        bpmMax: 130,
        musicalKey: ["Am", "C"],
        genres: ["Tech House"],
        trackTypes: ["Extended Mix"],
        energyMin: 50,
        energyMax: 80,
        moods: ["Energetic"],
        sortBy: "recent",
        limit: 20,
        offset: 0,
      });
    } catch (error: any) {
      // Expected to fail with DB error, not validation error
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
    }
  });

  it("should accept empty filters", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.search.advancedSearch({});
    } catch (error: any) {
      // Expected to fail with DB error, not validation error
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
    }
  });

  it("should reject invalid BPM range", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.search.advancedSearch({
        bpmMin: 50, // Below minimum
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      // Zod validation error
      expect(error.message).toContain("Too small");
    }
  });

  it("should reject invalid energy range", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.search.advancedSearch({
        energyMax: 150, // Above maximum
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      // Zod validation error
      expect(error.message).toContain("Too big");
    }
  });

  it("should accept valid sort options", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const sortOptions: ("recent" | "popular" | "bpm" | "downloads")[] = [
      "recent",
      "popular",
      "bpm",
      "downloads",
    ];

    for (const sortBy of sortOptions) {
      try {
        await caller.search.advancedSearch({ sortBy });
      } catch (error: any) {
        // Expected to fail with DB error, not validation error
        expect(error.code).toBe("INTERNAL_SERVER_ERROR");
      }
    }
  });

  it("should accept valid track types", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.search.advancedSearch({
        trackTypes: ["Extended Mix", "Edit", "Mashup"],
      });
    } catch (error: any) {
      // Expected to fail with DB error, not validation error
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
    }
  });

  it("should enforce pagination limits", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.search.advancedSearch({
        limit: 150, // Above maximum
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      // Zod validation error
      expect(error.message).toContain("Too big");
    }
  });
});

describe("search.getCompatibleTracks", () => {
  it("should accept valid track ID", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.search.getCompatibleTracks({
        trackId: 1,
        limit: 10,
      });
    } catch (error: any) {
      // Expected to fail with DB error or NOT_FOUND, not validation error
      expect(["INTERNAL_SERVER_ERROR", "NOT_FOUND"]).toContain(error.code);
    }
  });

  it("should enforce limit constraints", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.search.getCompatibleTracks({
        trackId: 1,
        limit: 100, // Above maximum
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      // Zod validation error
      expect(error.message).toContain("Too big");
    }
  });
});

describe("search.getFilterOptions", () => {
  it("should return filter options structure", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      const result = await caller.search.getFilterOptions();
      
      // Should have these properties even if empty
      expect(result).toHaveProperty("genres");
      expect(result).toHaveProperty("trackTypes");
      expect(result).toHaveProperty("moods");
      expect(result).toHaveProperty("musicalKeys");
      
      // Musical keys should always be populated
      expect(result.musicalKeys.length).toBeGreaterThan(0);
    } catch (error: any) {
      // Expected to fail with DB error, not validation error
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
    }
  });
});
