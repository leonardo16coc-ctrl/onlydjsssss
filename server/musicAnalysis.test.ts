import { describe, expect, it } from "vitest";
import { analyzeAudioFile, batchAnalyzeAudio } from "./musicAnalysis";

describe("Music Analysis Service", () => {
  describe("analyzeAudioFile", () => {
    it("should analyze audio file and return valid BPM", async () => {
      const result = await analyzeAudioFile(
        "https://example.com/audio.mp3",
        "Tech House",
        "Extended Mix"
      );

      expect(result.bpm).toBeGreaterThanOrEqual(60);
      expect(result.bpm).toBeLessThanOrEqual(200);
      expect(Number.isInteger(result.bpm)).toBe(true);
    }, 30000); // 30 second timeout for LLM call

    it("should detect musical key in valid format", async () => {
      const result = await analyzeAudioFile(
        "https://example.com/audio.mp3",
        "Techno",
        "Edit"
      );

      const validKeys = [
        "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
        "Cm", "C#m", "Dm", "D#m", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "A#m", "Bm"
      ];

      expect(validKeys).toContain(result.musicalKey);
    }, 30000);

    it("should return energy level between 0-100", async () => {
      const result = await analyzeAudioFile(
        "https://example.com/audio.mp3",
        "Big Room",
        "Extended Mix"
      );

      expect(result.energy).toBeGreaterThanOrEqual(0);
      expect(result.energy).toBeLessThanOrEqual(100);
    }, 30000);

    it("should detect song structure with all sections", async () => {
      const result = await analyzeAudioFile(
        "https://example.com/audio.mp3",
        "Bass House",
        "Extended Mix"
      );

      expect(result.structure).toBeDefined();
      expect(result.structure.intro).toBeDefined();
      expect(result.structure.build).toBeInstanceOf(Array);
      expect(result.structure.drop).toBeInstanceOf(Array);
      expect(result.structure.breakdown).toBeInstanceOf(Array);
      expect(result.structure.outro).toBeDefined();
    }, 30000);

    it("should return confidence scores", async () => {
      const result = await analyzeAudioFile(
        "https://example.com/audio.mp3",
        "Tech House",
        "Edit"
      );

      expect(result.confidence.bpm).toBeGreaterThanOrEqual(0);
      expect(result.confidence.bpm).toBeLessThanOrEqual(1);
      expect(result.confidence.key).toBeGreaterThanOrEqual(0);
      expect(result.confidence.key).toBeLessThanOrEqual(1);
    }, 30000);

    it("should return fallback values on error", async () => {
      // Test with invalid URL to trigger fallback
      const result = await analyzeAudioFile(
        "",
        "Tech House",
        "Extended Mix"
      );

      // Should still return valid structure even on error
      expect(result.bpm).toBeDefined();
      expect(result.musicalKey).toBeDefined();
      expect(result.energy).toBeDefined();
      expect(result.mood).toBeDefined();
    }, 30000);
  });

  describe("batchAnalyzeAudio", () => {
    it("should analyze multiple files in batch", async () => {
      const files = [
        { url: "https://example.com/track1.mp3", genre: "Tech House", trackType: "Extended Mix" },
        { url: "https://example.com/track2.mp3", genre: "Techno", trackType: "Edit" },
      ];

      const results = await batchAnalyzeAudio(files);

      expect(results).toHaveLength(2);
      expect(results[0].bpm).toBeDefined();
      expect(results[1].bpm).toBeDefined();
    }, 60000); // 60 second timeout for batch processing
  });

  describe("Genre-specific analysis", () => {
    it("should return appropriate BPM range for Tech House", async () => {
      const result = await analyzeAudioFile(
        "https://example.com/audio.mp3",
        "Tech House",
        "Extended Mix"
      );

      // Tech House typically 120-128 BPM
      expect(result.bpm).toBeGreaterThanOrEqual(115);
      expect(result.bpm).toBeLessThanOrEqual(135);
    }, 30000);

    it("should return appropriate BPM range for Techno", async () => {
      const result = await analyzeAudioFile(
        "https://example.com/audio.mp3",
        "Techno",
        "Extended Mix"
      );

      // Techno typically 125-135 BPM
      expect(result.bpm).toBeGreaterThanOrEqual(120);
      expect(result.bpm).toBeLessThanOrEqual(140);
    }, 30000);

    it("should return high energy for Big Room", async () => {
      const result = await analyzeAudioFile(
        "https://example.com/audio.mp3",
        "Big Room",
        "Extended Mix"
      );

      // Big Room should have high energy
      expect(result.energy).toBeGreaterThanOrEqual(80);
    }, 30000);
  });
});
