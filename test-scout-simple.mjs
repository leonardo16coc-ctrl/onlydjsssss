import { runDailyScout } from "./server/scouts/daily-scout-puppeteer.ts";

console.log("Starting scout test...\n");

runDailyScout()
  .then((result) => {
    console.log("\n✅ Scout test completed!");
    console.log("Result:", JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Scout test failed!");
    console.error("Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  });
