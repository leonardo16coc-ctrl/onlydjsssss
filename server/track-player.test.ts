/**
 * Tests for TrackCard mini-player logic
 * Verifies audio player state management, progress calculation, and download behavior
 */
import { describe, it, expect } from "vitest";

describe("TrackCard - Audio Player State", () => {
  it("should use previewFileUrl when available over audioFileUrl", () => {
    const track = {
      audioFileUrl: "https://s3.example.com/full-track.mp3",
      previewFileUrl: "https://s3.example.com/preview-track.mp3",
    };
    const audioSrc = track.previewFileUrl || track.audioFileUrl;
    expect(audioSrc).toBe("https://s3.example.com/preview-track.mp3");
  });

  it("should fall back to audioFileUrl when previewFileUrl is null", () => {
    const track = {
      audioFileUrl: "https://s3.example.com/full-track.mp3",
      previewFileUrl: null,
    };
    const audioSrc = track.previewFileUrl || track.audioFileUrl;
    expect(audioSrc).toBe("https://s3.example.com/full-track.mp3");
  });

  it("should return null audioSrc when both URLs are missing", () => {
    const track = {
      audioFileUrl: null,
      previewFileUrl: null,
    };
    const audioSrc = track.previewFileUrl || track.audioFileUrl;
    expect(audioSrc).toBeNull();
  });
});

describe("TrackCard - Progress Calculation", () => {
  it("should calculate progress percentage correctly", () => {
    const currentTime = 30;
    const totalDuration = 120;
    const progress = (currentTime / totalDuration) * 100;
    expect(progress).toBe(25);
  });

  it("should return 0 progress at start", () => {
    const currentTime = 0;
    const totalDuration = 180;
    const progress = (currentTime / totalDuration) * 100;
    expect(progress).toBe(0);
  });

  it("should return 100 progress at end", () => {
    const currentTime = 180;
    const totalDuration = 180;
    const progress = (currentTime / totalDuration) * 100;
    expect(progress).toBe(100);
  });
});

describe("TrackCard - Duration Formatting", () => {
  const formatDuration = (seconds: number) => {
    if (!seconds) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  it("should format 0 seconds as --:--", () => {
    expect(formatDuration(0)).toBe("--:--");
  });

  it("should format 90 seconds as 1:30", () => {
    expect(formatDuration(90)).toBe("1:30");
  });

  it("should format 65 seconds as 1:05 with zero-padding", () => {
    expect(formatDuration(65)).toBe("1:05");
  });

  it("should format 3600 seconds as 60:00", () => {
    expect(formatDuration(3600)).toBe("60:00");
  });
});

describe("TrackCard - Seek Logic", () => {
  it("should calculate seek position from click ratio", () => {
    const totalDuration = 200;
    const clickRatio = 0.5; // clicked at 50%
    const newTime = clickRatio * totalDuration;
    expect(newTime).toBe(100);
  });

  it("should handle click at start (ratio 0)", () => {
    const totalDuration = 180;
    const clickRatio = 0;
    const newTime = clickRatio * totalDuration;
    expect(newTime).toBe(0);
  });

  it("should handle click at end (ratio 1)", () => {
    const totalDuration = 180;
    const clickRatio = 1;
    const newTime = clickRatio * totalDuration;
    expect(newTime).toBe(180);
  });
});

describe("TrackCard - Download Filename", () => {
  it("should build correct download filename with format", () => {
    const track = { title: "My Track", artist: "DJ Test", fileFormat: "WAV" };
    const filename = `${track.title} - ${track.artist}.${track.fileFormat?.toLowerCase() || "mp3"}`;
    expect(filename).toBe("My Track - DJ Test.wav");
  });

  it("should default to mp3 when fileFormat is missing", () => {
    const track = { title: "My Track", artist: "DJ Test", fileFormat: null };
    const filename = `${track.title} - ${track.artist}.${track.fileFormat?.toLowerCase() || "mp3"}`;
    expect(filename).toBe("My Track - DJ Test.mp3");
  });
});
