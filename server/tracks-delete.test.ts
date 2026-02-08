import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { users, tracks } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Tracks Delete Endpoint", () => {
  let testUserId: number;
  let testTrackId: number;
  let otherUserId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test user
    const testUserResult = await db.insert(users).values({
      openId: "test-delete-user-" + Date.now(),
      name: "Test Delete User",
      email: "testdelete@example.com",
      membershipStatus: "member",
    });
    testUserId = Number(testUserResult[0].insertId);

    // Create another user
    const otherUserResult = await db.insert(users).values({
      openId: "test-other-delete-user-" + Date.now(),
      name: "Other Delete User",
      email: "otherdelete@example.com",
      membershipStatus: "free",
    });
    otherUserId = Number(otherUserResult[0].insertId);

    // Create test track
    const testTrackResult = await db.insert(tracks).values({
      userId: testUserId,
      title: "Track to Delete",
      artist: "Test Artist",
      genre: "Tech House",
      trackType: "Extended Mix",
      audioFileKey: "test-delete-key",
      audioFileUrl: "https://example.com/test-delete.mp3",
      bpm: 128,
      musicalKey: "Am",
    });
    testTrackId = Number(testTrackResult[0].insertId);
  });

  it("should delete track successfully when user is owner", async () => {
    const caller = appRouter.createCaller({
      user: {
        id: testUserId,
        openId: "test-delete-user",
        name: "Test Delete User",
        email: "testdelete@example.com",
        membershipStatus: "member",
        role: "user",
      },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.tracks.delete({
      id: testTrackId,
    });

    expect(result.success).toBe(true);

    // Verify the track was deleted
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const deletedTrack = await db
      .select()
      .from(tracks)
      .where(eq(tracks.id, testTrackId));

    expect(deletedTrack.length).toBe(0);
  });

  it("should reject delete when user is not owner", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create a track for this test
    const trackResult = await db.insert(tracks).values({
      userId: testUserId,
      title: "Protected Track",
      artist: "Test Artist",
      genre: "Tech House",
      trackType: "Extended Mix",
      audioFileKey: "test-protected-key",
      audioFileUrl: "https://example.com/test-protected.mp3",
      bpm: 130,
      musicalKey: "Cm",
    });
    const protectedTrackId = Number(trackResult[0].insertId);

    const caller = appRouter.createCaller({
      user: {
        id: otherUserId,
        openId: "test-other-delete-user",
        name: "Other Delete User",
        email: "otherdelete@example.com",
        membershipStatus: "free",
        role: "user",
      },
      req: {} as any,
      res: {} as any,
    });

    await expect(
      caller.tracks.delete({
        id: protectedTrackId,
      })
    ).rejects.toThrow("No tienes permiso para eliminar este track");

    // Verify the track still exists
    const stillExists = await db
      .select()
      .from(tracks)
      .where(eq(tracks.id, protectedTrackId));

    expect(stillExists.length).toBe(1);
  });

  it("should reject delete for non-existent track", async () => {
    const caller = appRouter.createCaller({
      user: {
        id: testUserId,
        openId: "test-delete-user",
        name: "Test Delete User",
        email: "testdelete@example.com",
        membershipStatus: "member",
        role: "user",
      },
      req: {} as any,
      res: {} as any,
    });

    await expect(
      caller.tracks.delete({
        id: 999999,
      })
    ).rejects.toThrow("Track no encontrado");
  });

  it("should handle multiple delete attempts gracefully", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create a track for this test
    const trackResult = await db.insert(tracks).values({
      userId: testUserId,
      title: "Double Delete Test",
      artist: "Test Artist",
      genre: "Tech House",
      trackType: "Extended Mix",
      audioFileKey: "test-double-delete-key",
      audioFileUrl: "https://example.com/test-double-delete.mp3",
      bpm: 128,
      musicalKey: "Am",
    });
    const doubleDeleteTrackId = Number(trackResult[0].insertId);

    const caller = appRouter.createCaller({
      user: {
        id: testUserId,
        openId: "test-delete-user",
        name: "Test Delete User",
        email: "testdelete@example.com",
        membershipStatus: "member",
        role: "user",
      },
      req: {} as any,
      res: {} as any,
    });

    // First delete should succeed
    const firstDelete = await caller.tracks.delete({
      id: doubleDeleteTrackId,
    });
    expect(firstDelete.success).toBe(true);

    // Second delete should fail
    await expect(
      caller.tracks.delete({
        id: doubleDeleteTrackId,
      })
    ).rejects.toThrow("Track no encontrado");
  });
});
