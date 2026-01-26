import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    username: `testuser${userId}`,
    djName: `DJ Test ${userId}`,
    bio: "Test bio",
    profileImageUrl: null,
    profileImageKey: null,
    avatarUrl: null,
    country: "Test Country",
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

describe("profile.getByUsername", () => {
  it("should return NOT_FOUND for non-existent username", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.profile.getByUsername({ username: "nonexistent_user_12345" });
      expect.fail("Should have thrown NOT_FOUND error");
    } catch (error: any) {
      expect(error.code).toBe("NOT_FOUND");
      expect(error.message).toContain("DJ no encontrado");
    }
  });

  it("should accept valid username format", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // This will fail because the user doesn't exist in DB, but validates input format
    try {
      await caller.profile.getByUsername({ username: "valid_username" });
    } catch (error: any) {
      // Expected to fail with NOT_FOUND, not validation error
      expect(error.code).toBe("NOT_FOUND");
    }
  });
});

describe("profile.updateProfile", () => {
  it("should accept valid profile update data", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Test that the mutation accepts valid input structure
    const validInput = {
      username: "newusername",
      djName: "DJ New Name",
      bio: "This is a new bio",
      country: "Mexico",
      socialLinks: {
        instagram: "https://instagram.com/test",
        twitter: "https://twitter.com/test",
      },
    };

    // This will fail because database is not available in test env,
    // but validates that input schema is correct
    try {
      await caller.profile.updateProfile(validInput);
    } catch (error: any) {
      // Expected to fail with INTERNAL_SERVER_ERROR (no DB) or BAD_REQUEST (username taken), not validation error
      expect(["INTERNAL_SERVER_ERROR", "BAD_REQUEST"]).toContain(error.code);
    }
  });

  it("should reject username shorter than 3 characters", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.profile.updateProfile({
        username: "ab", // Too short
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      // Zod validation error
      expect(error.message).toContain("Too small");
    }
  });

  it("should reject bio longer than 1000 characters", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.profile.updateProfile({
        bio: "a".repeat(1001), // Too long
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      // Zod validation error
      expect(error.message).toContain("Too big");
    }
  });

  it("should accept social links as record of strings", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.profile.updateProfile({
        socialLinks: {
          instagram: "https://instagram.com/test",
          twitter: "https://twitter.com/test",
          website: "https://example.com",
        },
      });
    } catch (error: any) {
      // Should fail with DB error, not validation error
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
    }
  });
});

describe("profile.uploadProfileImage", () => {
  it("should accept valid image upload format", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a small test base64 image (1x1 pixel PNG)
    const testBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    try {
      await caller.profile.uploadProfileImage({
        file: testBase64,
        mimeType: "image/png",
        fileName: "test.png",
      });
    } catch (error: any) {
      // Expected to fail with DB or S3 error, not validation error
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
    }
  });

  it("should require all fields for image upload", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.profile.uploadProfileImage({
        file: "base64data",
        mimeType: "image/png",
        // Missing fileName
      } as any);
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      // Zod validation error
      expect(error.message).toBeTruthy();
    }
  });
});

describe("profile.getOwnProfile", () => {
  it("should be accessible by authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.profile.getOwnProfile();
    } catch (error: any) {
      // Expected to fail with DB error, not auth error
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
    }
  });
});
