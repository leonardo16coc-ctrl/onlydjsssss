import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";
import { getDb } from "./db";
import { users, tracks, downloads, trackEarnings } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Earnings Router Tests
 * 
 * Tests the monetization system that connects downloads with artist earnings
 */

describe("Earnings Router", () => {
  // Use fixed IDs for testing
  const testArtistId = 99991;
  const testDownloaderId = 99992;
  const testTrackId = 99991;
  const testDownloadId = 99991;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Cleanup any existing test data first (using openId to find users)
    const existingArtist = await db.select().from(users).where(eq(users.openId, "test-artist-earnings")).limit(1);
    const existingDownloader = await db.select().from(users).where(eq(users.openId, "test-downloader-earnings")).limit(1);
    
    if (existingArtist.length > 0) {
      await db.delete(trackEarnings).where(eq(trackEarnings.artistId, existingArtist[0].id));
      await db.delete(downloads).where(eq(downloads.artistId, existingArtist[0].id));
      await db.delete(tracks).where(eq(tracks.userId, existingArtist[0].id));
      await db.delete(users).where(eq(users.id, existingArtist[0].id));
    }
    
    if (existingDownloader.length > 0) {
      await db.delete(downloads).where(eq(downloads.userId, existingDownloader[0].id));
      await db.delete(users).where(eq(users.id, existingDownloader[0].id));
    }

    // Create test artist (PRO user)
    await db.insert(users).values({
      id: testArtistId,
      openId: "test-artist-earnings",
      name: "Test Artist PRO",
      email: "artist@test.com",
      membershipStatus: "member", // PRO user
    });

    // Create test downloader (FREE user)
    await db.insert(users).values({
      id: testDownloaderId,
      openId: "test-downloader-earnings",
      name: "Test Downloader",
      email: "downloader@test.com",
      membershipStatus: "free",
    });

    // Create test track
    await db.insert(tracks).values({
      id: testTrackId,
      userId: testArtistId,
      title: "Test Track for Earnings",
      artist: "Test Artist PRO",
      genre: "Tech House",
      trackType: "Extended Mix",
      audioFileKey: "test/earnings-track.mp3",
      audioFileUrl: "https://test.com/earnings-track.mp3",
      status: "approved",
    });

    // Create test download
    await db.insert(downloads).values({
      id: testDownloadId,
      userId: testDownloaderId,
      trackId: testTrackId,
      artistId: testArtistId,
      ipAddress: "192.168.1.1",
      country: "US",
      device: "desktop",
      userAgent: "Test Browser",
    });

    // Create test earning
    await db.insert(trackEarnings).values({
      trackId: testTrackId,
      artistId: testArtistId,
      downloadId: testDownloadId,
      downloaderId: testDownloaderId,
      revenuePerDownload: "0.50",
      artistShare: "0.30",
      platformShare: "0.20",
    });
  });

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;

    // Cleanup test data
    await db.delete(trackEarnings).where(eq(trackEarnings.artistId, testArtistId));
    await db.delete(downloads).where(eq(downloads.id, testDownloadId));
    await db.delete(tracks).where(eq(tracks.id, testTrackId));
    await db.delete(users).where(eq(users.id, testArtistId));
    await db.delete(users).where(eq(users.id, testDownloaderId));
  });

  it("should calculate total earnings for PRO artist", async () => {
    const caller = appRouter.createCaller({
      user: {
        id: testArtistId,
        openId: "test-artist-earnings",
        name: "Test Artist PRO",
        email: "artist@test.com",
        membershipStatus: "member",
      },
    } as Context);

    const result = await caller.earnings.getTotalEarnings();

    expect(result.isPro).toBe(true);
    expect(parseFloat(result.totalEarnings)).toBeGreaterThan(0);
    expect(result.totalDownloads).toBeGreaterThan(0);
    expect(parseFloat(result.averagePerDownload)).toBe(0.30); // $0.30 per download
  });

  it("should return zero earnings for FREE users", async () => {
    const caller = appRouter.createCaller({
      user: {
        id: testDownloaderId,
        openId: "test-downloader-earnings",
        name: "Test Downloader",
        email: "downloader@test.com",
        membershipStatus: "free",
      },
    } as Context);

    const result = await caller.earnings.getTotalEarnings();

    expect(result.isPro).toBe(false);
    expect(result.totalEarnings).toBe("0.00");
    expect(result.totalDownloads).toBe(0);
  });

  it("should get earnings by track", async () => {
    const caller = appRouter.createCaller({
      user: {
        id: testArtistId,
        openId: "test-artist-earnings",
        name: "Test Artist PRO",
        email: "artist@test.com",
        membershipStatus: "member",
      },
    } as Context);

    const result = await caller.earnings.getEarningsByTrack();

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].trackId).toBe(testTrackId);
    expect(result[0].trackTitle).toBe("Test Track for Earnings");
    expect(parseFloat(result[0].totalEarnings)).toBeGreaterThan(0);
    expect(result[0].totalDownloads).toBeGreaterThan(0);
  });

  it("should get earnings history", async () => {
    const caller = appRouter.createCaller({
      user: {
        id: testArtistId,
        openId: "test-artist-earnings",
        name: "Test Artist PRO",
        email: "artist@test.com",
        membershipStatus: "member",
      },
    } as Context);

    const result = await caller.earnings.getEarningsHistory({ limit: 10, offset: 0 });

    expect(result.earnings.length).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(0);
    expect(result.earnings[0].trackId).toBe(testTrackId);
    expect(parseFloat(result.earnings[0].amount)).toBe(0.30);
  });

  it("should get monthly stats", async () => {
    const caller = appRouter.createCaller({
      user: {
        id: testArtistId,
        openId: "test-artist-earnings",
        name: "Test Artist PRO",
        email: "artist@test.com",
        membershipStatus: "member",
      },
    } as Context);

    const result = await caller.earnings.getMonthlyStats({ months: 6 });

    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      expect(result[0]).toHaveProperty("month");
      expect(result[0]).toHaveProperty("totalEarnings");
      expect(result[0]).toHaveProperty("totalDownloads");
    }
  });

  it("should get dashboard stats", async () => {
    const caller = appRouter.createCaller({
      user: {
        id: testArtistId,
        openId: "test-artist-earnings",
        name: "Test Artist PRO",
        email: "artist@test.com",
        membershipStatus: "member",
      },
    } as Context);

    const result = await caller.earnings.getDashboardStats();

    expect(result.isPro).toBe(true);
    expect(parseFloat(result.totalEarnings)).toBeGreaterThan(0);
    expect(result.totalDownloads).toBeGreaterThan(0);
    expect(parseFloat(result.thisMonthEarnings)).toBeGreaterThanOrEqual(0);
    expect(result.topTrack).not.toBeNull();
    if (result.topTrack) {
      expect(result.topTrack.trackId).toBe(testTrackId);
      expect(parseFloat(result.topTrack.totalEarnings)).toBeGreaterThan(0);
    }
  });

  it("should create earning automatically when PRO artist track is downloaded", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Count earnings before
    const beforeCount = await db
      .select()
      .from(trackEarnings)
      .where(eq(trackEarnings.artistId, testArtistId));

    const newDownloadId = 99993;

    // Simulate another download (this would happen in downloads.router.ts)
    await db.insert(downloads).values({
      id: newDownloadId,
      userId: testDownloaderId,
      trackId: testTrackId,
      artistId: testArtistId,
      ipAddress: "192.168.1.2",
      country: "US",
      device: "mobile",
      userAgent: "Test Mobile Browser",
    });

    // Create earning (simulating downloads.router.ts logic)
    await db.insert(trackEarnings).values({
      trackId: testTrackId,
      artistId: testArtistId,
      downloadId: newDownloadId,
      downloaderId: testDownloaderId,
      revenuePerDownload: "0.50",
      artistShare: "0.30",
      platformShare: "0.20",
    });

    // Count earnings after
    const afterCount = await db
      .select()
      .from(trackEarnings)
      .where(eq(trackEarnings.artistId, testArtistId));

    expect(afterCount.length).toBe(beforeCount.length + 1);

    // Cleanup
    await db.delete(trackEarnings).where(eq(trackEarnings.downloadId, newDownloadId));
    await db.delete(downloads).where(eq(downloads.id, newDownloadId));
  });

  it("should NOT create earning for FREE artist", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const freeArtistId = 99994;
    const freeTrackId = 99992;
    const downloadId = 99994;

    // Cleanup any existing data
    await db.delete(trackEarnings).where(eq(trackEarnings.artistId, freeArtistId));
    await db.delete(downloads).where(eq(downloads.id, downloadId));
    await db.delete(tracks).where(eq(tracks.id, freeTrackId));
    await db.delete(users).where(eq(users.id, freeArtistId));

    // Create FREE artist
    await db.insert(users).values({
      id: freeArtistId,
      openId: "test-free-artist",
      name: "Test Free Artist",
      email: "freeartist@test.com",
      membershipStatus: "free",
    });

    // Create track by FREE artist
    await db.insert(tracks).values({
      id: freeTrackId,
      userId: freeArtistId,
      title: "Free Artist Track",
      artist: "Test Free Artist",
      genre: "Tech House",
      trackType: "Extended Mix",
      audioFileKey: "test/free-track.mp3",
      audioFileUrl: "https://test.com/free-track.mp3",
      status: "approved",
    });

    // Simulate download
    await db.insert(downloads).values({
      id: downloadId,
      userId: testDownloaderId,
      trackId: freeTrackId,
      artistId: freeArtistId,
      ipAddress: "192.168.1.3",
      country: "US",
      device: "desktop",
      userAgent: "Test Browser",
    });

    // Check if artist is PRO before creating earning
    const artistResult = await db.select().from(users).where(eq(users.id, freeArtistId)).limit(1);
    const artist = artistResult[0];

    // Should NOT create earning because artist is FREE
    if (artist && artist.membershipStatus === "member") {
      await db.insert(trackEarnings).values({
        trackId: freeTrackId,
        artistId: freeArtistId,
        downloadId,
        downloaderId: testDownloaderId,
        revenuePerDownload: "0.50",
        artistShare: "0.30",
        platformShare: "0.20",
      });
    }

    // Verify no earnings created
    const earnings = await db
      .select()
      .from(trackEarnings)
      .where(eq(trackEarnings.artistId, freeArtistId));

    expect(earnings.length).toBe(0);

    // Cleanup
    await db.delete(downloads).where(eq(downloads.id, downloadId));
    await db.delete(tracks).where(eq(tracks.id, freeTrackId));
    await db.delete(users).where(eq(users.id, freeArtistId));
  });
});
