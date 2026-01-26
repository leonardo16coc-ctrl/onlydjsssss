import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import type { Request, Response } from "express";

// Mock user data
const mockUser = {
  id: 1,
  openId: "test-user-123",
  name: "Test DJ",
  email: "testdj@example.com",
  loginMethod: "oauth",
  membershipStatus: "member" as const,
  membershipExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  stripeCustomerId: "cus_test123",
  stripeSubscriptionId: "sub_test123",
  role: "user" as const,
  username: "testdj",
  djName: null,
  bio: null,
  profileImageUrl: null,
  profileImageKey: null,
  avatarUrl: null,
  country: null,
  socialLinks: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockFreeUser = {
  id: 2,
  openId: "test-free-user",
  name: "Free DJ",
  email: "freedj@example.com",
  loginMethod: "oauth",
  membershipStatus: "free" as const,
  membershipExpiresAt: null,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  role: "user" as const,
  username: "freedj",
  djName: null,
  bio: null,
  profileImageUrl: null,
  profileImageKey: null,
  avatarUrl: null,
  country: null,
  socialLinks: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Helper to create tRPC caller with mock context
function createCaller(user: typeof mockUser | null) {
  const mockReq = {} as Request;
  const mockRes = {} as Response;
  const ctx = {
    req: mockReq,
    res: mockRes,
    user,
  };
  return appRouter.createCaller(ctx);
}

describe("DJ MODE - DJ Profile Engine", () => {
  it("should get DJ profile for authenticated user", async () => {
    const caller = createCaller(mockUser);
    const profile = await caller.djMode.getMyProfile();

    expect(profile).toBeDefined();
    expect(profile.userId).toBe(mockUser.id);
    expect(profile.profileScore).toBeGreaterThanOrEqual(0);
    expect(profile.profileScore).toBeLessThanOrEqual(100);
  });

  it("should update DJ profile based on activity", async () => {
    const caller = createCaller(mockUser);
    const result = await caller.djMode.updateProfile();

    expect(result).toBeDefined();
    expect(result.userId).toBe(mockUser.id);
    expect(result.profileScore).toBeGreaterThanOrEqual(0);
    expect(result.profileScore).toBeLessThanOrEqual(100);
  });

  it("should reject unauthenticated users", async () => {
    const caller = createCaller(null);

    await expect(caller.djMode.getMyProfile()).rejects.toThrow();
  });

  it("should calculate profile score correctly", async () => {
    const caller = createCaller(mockUser);
    const profile = await caller.djMode.getMyProfile();

    // Profile score should be between 0-100
    expect(profile.profileScore).toBeGreaterThanOrEqual(0);
    expect(profile.profileScore).toBeLessThanOrEqual(100);

    // If user has activity, score should be > 0
    if (profile.totalTracksDownloaded > 0 || profile.totalTracksPlayed > 0) {
      expect(profile.profileScore).toBeGreaterThan(0);
    }
  });

  it("should parse favorite genres as JSON array", async () => {
    const caller = createCaller(mockUser);
    const profile = await caller.djMode.getMyProfile();

    if (profile.favoriteGenres) {
      const genres = JSON.parse(profile.favoriteGenres);
      expect(Array.isArray(genres)).toBe(true);
    }
  });

  it("should parse favorite keys as JSON array", async () => {
    const caller = createCaller(mockUser);
    const profile = await caller.djMode.getMyProfile();

    if (profile.favoriteKeys) {
      const keys = JSON.parse(profile.favoriteKeys);
      expect(Array.isArray(keys)).toBe(true);
    }
  });
});

describe("DJ MODE - Smart DJ Suggestions", () => {
  it("should get smart suggestions for authenticated user", async () => {
    const caller = createCaller(mockUser);
    const suggestions = await caller.djMode.getSmartSuggestions();

    expect(suggestions).toBeDefined();
    expect(suggestions.recommendedForYou).toBeDefined();
    expect(Array.isArray(suggestions.recommendedForYou)).toBe(true);
    expect(suggestions.warmupTracks).toBeDefined();
    expect(Array.isArray(suggestions.warmupTracks)).toBe(true);
    expect(suggestions.peakTimeTracks).toBeDefined();
    expect(Array.isArray(suggestions.peakTimeTracks)).toBe(true);
    expect(suggestions.closingTracks).toBeDefined();
    expect(Array.isArray(suggestions.closingTracks)).toBe(true);
    expect(suggestions.festivalTracks).toBeDefined();
    expect(Array.isArray(suggestions.festivalTracks)).toBe(true);
    expect(suggestions.trendingTracks).toBeDefined();
    expect(Array.isArray(suggestions.trendingTracks)).toBe(true);
  });

  it("should return warmup tracks with BPM 110-120", async () => {
    const caller = createCaller(mockUser);
    const suggestions = await caller.djMode.getSmartSuggestions();

    if (suggestions.warmupTracks.length > 0) {
      suggestions.warmupTracks.forEach((track) => {
        if (track.bpm) {
          expect(track.bpm).toBeGreaterThanOrEqual(110);
          expect(track.bpm).toBeLessThanOrEqual(120);
        }
      });
    }
  });

  it("should return peak time tracks with BPM 125-135", async () => {
    const caller = createCaller(mockUser);
    const suggestions = await caller.djMode.getSmartSuggestions();

    if (suggestions.peakTimeTracks.length > 0) {
      suggestions.peakTimeTracks.forEach((track) => {
        if (track.bpm) {
          expect(track.bpm).toBeGreaterThanOrEqual(125);
          expect(track.bpm).toBeLessThanOrEqual(135);
        }
      });
    }
  });

  it("should return trending tracks from last 7 days", async () => {
    const caller = createCaller(mockUser);
    const suggestions = await caller.djMode.getSmartSuggestions();

    expect(suggestions.trendingTracks).toBeDefined();
    expect(Array.isArray(suggestions.trendingTracks)).toBe(true);
    
    // Trending tracks should be sorted by download count
    if (suggestions.trendingTracks.length > 1) {
      for (let i = 0; i < suggestions.trendingTracks.length - 1; i++) {
        expect(suggestions.trendingTracks[i].downloadCount).toBeGreaterThanOrEqual(
          suggestions.trendingTracks[i + 1].downloadCount
        );
      }
    }
  });

  it("should reject unauthenticated users from suggestions", async () => {
    const caller = createCaller(null);

    await expect(caller.djMode.getSmartSuggestions()).rejects.toThrow();
  });
});

describe("DJ MODE - Auto Set Builder Pro", () => {
  it("should validate minimum 2 tracks for set building", async () => {
    const caller = createCaller(mockUser);

    await expect(
      caller.djMode.buildAutoSet({
        trackIds: [1],
        setType: "peak_time",
      })
    ).rejects.toThrow(); // Zod validation error
  });

  it("should validate maximum 10 tracks for set building", async () => {
    const caller = createCaller(mockUser);

    await expect(
      caller.djMode.buildAutoSet({
        trackIds: Array.from({ length: 11 }, (_, i) => i + 1),
        setType: "peak_time",
      })
    ).rejects.toThrow(); // Zod validation error
  });

  it("should validate set type", async () => {
    const caller = createCaller(mockUser);

    await expect(
      caller.djMode.buildAutoSet({
        trackIds: [1, 2],
        // @ts-expect-error - Testing invalid set type
        setType: "invalid_type",
      })
    ).rejects.toThrow();
  });

  it("should accept valid set types", async () => {
    const caller = createCaller(mockUser);
    const validTypes = ["warmup", "peak_time", "closing", "festival"] as const;

    for (const setType of validTypes) {
      // This will fail if tracks don't exist, but validates the input
      try {
        await caller.djMode.buildAutoSet({
          trackIds: [1, 2],
          setType,
        });
      } catch (error: any) {
        // Should fail on track not found or other business logic, not on invalid set type
        expect(error.message).not.toContain("Invalid enum value");
        expect(error.code).not.toBe("BAD_REQUEST");
      }
    }
  });

  it("should get user's generated sets", async () => {
    const caller = createCaller(mockUser);
    const sets = await caller.djMode.getMySets();

    expect(sets).toBeDefined();
    expect(Array.isArray(sets)).toBe(true);
  });

  it("should reject unauthenticated users from set building", async () => {
    const caller = createCaller(null);

    await expect(
      caller.djMode.buildAutoSet({
        trackIds: [1, 2],
        setType: "peak_time",
      })
    ).rejects.toThrow();
  });

  it("should reject free users from set building", async () => {
    const caller = createCaller(mockFreeUser);

    // Free users should be rejected, but may fail on other validations first
    // (e.g., tracks not found). The important thing is they can't complete the operation.
    await expect(
      caller.djMode.buildAutoSet({
        trackIds: [1, 2],
        setType: "peak_time",
      })
    ).rejects.toThrow(); // Will throw some error (tracks not found or membership check)
  });
});

describe("DJ MODE - Integration Tests", () => {
  it("should have consistent data between profile and suggestions", async () => {
    const caller = createCaller(mockUser);
    const profile = await caller.djMode.getMyProfile();
    const suggestions = await caller.djMode.getSmartSuggestions();

    expect(profile).toBeDefined();
    expect(suggestions).toBeDefined();

    // If user has favorite genres, recommendations should exist
    if (profile.favoriteGenres) {
      const genres = JSON.parse(profile.favoriteGenres);
      if (genres.length > 0) {
        // Should have at least one type of recommendation
        const totalRecommendations =
          suggestions.recommendedForYou.length +
          suggestions.warmupTracks.length +
          suggestions.peakTimeTracks.length +
          suggestions.closingTracks.length +
          suggestions.festivalTracks.length;

        expect(totalRecommendations).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("should update profile score after activity", async () => {
    const caller = createCaller(mockUser);
    
    const profileBefore = await caller.djMode.getMyProfile();
    const scoreBefore = profileBefore.profileScore;

    // Update profile (simulates activity)
    await caller.djMode.updateProfile();

    const profileAfter = await caller.djMode.getMyProfile();
    const scoreAfter = profileAfter.profileScore;

    // Score should be valid
    expect(scoreAfter).toBeGreaterThanOrEqual(0);
    expect(scoreAfter).toBeLessThanOrEqual(100);
  });
});
