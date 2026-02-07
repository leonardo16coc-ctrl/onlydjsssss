import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { users, tracks } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Tracks Update Endpoint", () => {
  let testUserId: number;
  let testTrackId: number;
  let otherUserId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test user
    const testUserResult = await db.insert(users).values({
      openId: "test-update-user-" + Date.now(),
      name: "Test Update User",
      email: "testupdate@example.com",
      membershipStatus: "member",
    });
    testUserId = Number(testUserResult[0].insertId);

    // Create another user
    const otherUserResult = await db.insert(users).values({
      openId: "test-other-user-" + Date.now(),
      name: "Other User",
      email: "other@example.com",
      membershipStatus: "free",
    });
    otherUserId = Number(otherUserResult[0].insertId);

    // Create test track
    const testTrackResult = await db.insert(tracks).values({
      userId: testUserId,
      title: "Original Title",
      artist: "Original Artist",
      genre: "Tech House",
      trackType: "Extended Mix",
      audioFileKey: "test-key",
      audioFileUrl: "https://example.com/test.mp3",
      bpm: 128,
      musicalKey: "Am",
    });
    testTrackId = Number(testTrackResult[0].insertId);
  });

  it("should update track successfully when user is owner", async () => {
    const caller = appRouter.createCaller({
      user: {
        id: testUserId,
        openId: "test-update-user",
        name: "Test Update User",
        email: "testupdate@example.com",
        membershipStatus: "member",
        role: "user",
      },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.tracks.update({
      id: testTrackId,
      title: "Updated Title",
      artist: "Updated Artist",
      bpm: 130,
      musicalKey: "Cm",
    });

    expect(result.success).toBe(true);

    // Verify the update
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const [updatedTrack] = await db
      .select()
      .from(tracks)
      .where(eq(tracks.id, testTrackId));

    expect(updatedTrack.title).toBe("Updated Title");
    expect(updatedTrack.artist).toBe("Updated Artist");
    expect(updatedTrack.bpm).toBe(130);
    expect(updatedTrack.musicalKey).toBe("Cm");
  });

  it("should update only cover image without changing other fields", async () => {
    const caller = appRouter.createCaller({
      user: {
        id: testUserId,
        openId: "test-update-user",
        name: "Test Update User",
        email: "testupdate@example.com",
        membershipStatus: "member",
        role: "user",
      },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.tracks.update({
      id: testTrackId,
      coverImageKey: "new-cover-key",
      coverImageUrl: "https://example.com/new-cover.jpg",
    });

    expect(result.success).toBe(true);

    // Verify the update
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const [updatedTrack] = await db
      .select()
      .from(tracks)
      .where(eq(tracks.id, testTrackId));

    expect(updatedTrack.coverImageKey).toBe("new-cover-key");
    expect(updatedTrack.coverImageUrl).toBe("https://example.com/new-cover.jpg");
    // Other fields should remain unchanged
    expect(updatedTrack.title).toBe("Updated Title");
    expect(updatedTrack.artist).toBe("Updated Artist");
  });

  it("should reject update when user is not owner", async () => {
    const caller = appRouter.createCaller({
      user: {
        id: otherUserId,
        openId: "test-other-user",
        name: "Other User",
        email: "other@example.com",
        membershipStatus: "free",
        role: "user",
      },
      req: {} as any,
      res: {} as any,
    });

    await expect(
      caller.tracks.update({
        id: testTrackId,
        title: "Hacked Title",
      })
    ).rejects.toThrow("No tienes permiso para editar este track");
  });

  it("should reject update for non-existent track", async () => {
    const caller = appRouter.createCaller({
      user: {
        id: testUserId,
        openId: "test-update-user",
        name: "Test Update User",
        email: "testupdate@example.com",
        membershipStatus: "member",
        role: "user",
      },
      req: {} as any,
      res: {} as any,
    });

    await expect(
      caller.tracks.update({
        id: 999999,
        title: "Non-existent Track",
      })
    ).rejects.toThrow("Track no encontrado");
  });

  it("should update genre and track type", async () => {
    const caller = appRouter.createCaller({
      user: {
        id: testUserId,
        openId: "test-update-user",
        name: "Test Update User",
        email: "testupdate@example.com",
        membershipStatus: "member",
        role: "user",
      },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.tracks.update({
      id: testTrackId,
      genre: "Bass House",
      trackType: "Remix",
    });

    expect(result.success).toBe(true);

    // Verify the update
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const [updatedTrack] = await db
      .select()
      .from(tracks)
      .where(eq(tracks.id, testTrackId));

    expect(updatedTrack.genre).toBe("Bass House");
    expect(updatedTrack.trackType).toBe("Remix");
  });
});
