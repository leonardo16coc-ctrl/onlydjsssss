import { SoundCloudScout } from "./server/scouts/soundcloud-scout";

/**
 * Test script for SoundCloud Scout
 * Run with: tsx test-scout.ts
 */
async function main() {
  console.log("🚀 Starting SoundCloud Scout Test...\n");

  const scout = new SoundCloudScout();

  // Test with a few genres
  const genres = ["Tech House", "Techno", "Bass House"];

  await scout.runMultiGenre(genres, 5); // 5 DJs per genre

  console.log("\n✅ Scout test completed!");
}

main().catch((error) => {
  console.error("❌ Scout test failed:", error);
  process.exit(1);
});
