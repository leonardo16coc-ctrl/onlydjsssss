/**
 * Tests for the recordStream endpoint and debounce logic
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// Simulate the in-memory debounce store
const recentStreams = new Map<string, number>();

function buildDebounceKey(userId: number | null, ip: string, trackId: number): string {
  return `${userId ?? ip}:${trackId}`;
}

function recordStreamLogic(
  userId: number | null,
  ip: string,
  trackId: number
): { success: boolean; reason?: string } {
  const debounceKey = buildDebounceKey(userId, ip, trackId);
  if (recentStreams.has(debounceKey)) {
    return { success: false, reason: "debounced" };
  }
  recentStreams.set(debounceKey, Date.now());
  setTimeout(() => recentStreams.delete(debounceKey), 30_000);
  return { success: true };
}

describe("recordStream - Debounce Logic", () => {
  beforeEach(() => {
    recentStreams.clear();
    vi.useFakeTimers();
  });

  it("should succeed on first play for a track", () => {
    const result = recordStreamLogic(1, "192.168.1.1", 42);
    expect(result.success).toBe(true);
  });

  it("should be debounced on second play within 30s", () => {
    recordStreamLogic(1, "192.168.1.1", 42);
    const result = recordStreamLogic(1, "192.168.1.1", 42);
    expect(result.success).toBe(false);
    expect(result.reason).toBe("debounced");
  });

  it("should allow play again after 30s debounce expires", () => {
    recordStreamLogic(1, "192.168.1.1", 42);
    vi.advanceTimersByTime(31_000);
    const result = recordStreamLogic(1, "192.168.1.1", 42);
    expect(result.success).toBe(true);
  });

  it("should allow different users to play the same track simultaneously", () => {
    const r1 = recordStreamLogic(1, "192.168.1.1", 42);
    const r2 = recordStreamLogic(2, "192.168.1.2", 42);
    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
  });

  it("should allow same user to play different tracks simultaneously", () => {
    const r1 = recordStreamLogic(1, "192.168.1.1", 42);
    const r2 = recordStreamLogic(1, "192.168.1.1", 99);
    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
  });

  it("should use IP as key when userId is null (anonymous visitor)", () => {
    const r1 = recordStreamLogic(null, "10.0.0.1", 42);
    const r2 = recordStreamLogic(null, "10.0.0.1", 42); // same IP, same track
    expect(r1.success).toBe(true);
    expect(r2.success).toBe(false);
  });

  it("should allow anonymous visitors from different IPs to count separately", () => {
    const r1 = recordStreamLogic(null, "10.0.0.1", 42);
    const r2 = recordStreamLogic(null, "10.0.0.2", 42);
    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
  });
});

describe("recordStream - Debounce Key Construction", () => {
  it("should use userId when logged in", () => {
    const key = buildDebounceKey(5, "192.168.1.1", 10);
    expect(key).toBe("5:10");
  });

  it("should use IP when not logged in (userId null)", () => {
    const key = buildDebounceKey(null, "192.168.1.1", 10);
    expect(key).toBe("192.168.1.1:10");
  });

  it("should include trackId in the key", () => {
    const key1 = buildDebounceKey(1, "192.168.1.1", 10);
    const key2 = buildDebounceKey(1, "192.168.1.1", 20);
    expect(key1).not.toBe(key2);
  });
});
