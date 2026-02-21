/**
 * Internal Scheduler Service
 * Runs the multi-platform scout every 6 hours automatically
 * No system cron required - runs inside the Node.js process
 */

import cron from "node-cron";
import { runMultiPlatformScout } from "../scouts/multi-platform-scout";

let isRunning = false;
let lastRun: Date | null = null;
let lastResult: any = null;

/**
 * Execute the scout with error handling and logging
 */
async function executeScout() {
  if (isRunning) {
    console.log("[Scheduler] Scout already running, skipping...");
    return;
  }

  isRunning = true;
  lastRun = new Date();
  
  console.log("\n╔═══════════════════════════════════════╗");
  console.log("║  SCHEDULED SCOUT EXECUTION            ║");
  console.log("╚═══════════════════════════════════════╝");
  console.log(`🕐 Started at: ${lastRun.toLocaleString()}\n`);

  try {
    const result = await runMultiPlatformScout();
    lastResult = { success: true, ...result };
    
    console.log("\n✅ Scheduled scout completed successfully");
    console.log(`📊 Discovered: ${result.totalDiscovered} DJs`);
    console.log(`⏭️  Skipped: ${result.totalSkipped} duplicates`);
  } catch (error: any) {
    console.error("\n❌ Scheduled scout failed:", error.message);
    lastResult = { success: false, error: error.message };
  } finally {
    isRunning = false;
    console.log(`🕐 Finished at: ${new Date().toLocaleString()}\n`);
  }
}

/**
 * Initialize the scheduler
 * Runs every 6 hours: 12 AM, 6 AM, 12 PM, 6 PM
 */
export function initializeScheduler() {
  console.log("\n╔═══════════════════════════════════════╗");
  console.log("║  SCOUT SCHEDULER INITIALIZED          ║");
  console.log("╚═══════════════════════════════════════╝");
  console.log("📅 Schedule: Every 6 hours (12 AM, 6 AM, 12 PM, 6 PM)");
  console.log("🎯 Target: 32 DJs per run = 128 DJs/day");
  console.log("🌐 Platforms: SoundCloud, Mixcloud, Instagram\n");

  // Schedule: 0 0,6,12,18 * * * (every 6 hours)
  cron.schedule("0 0,6,12,18 * * *", () => {
    executeScout();
  });

  console.log("✅ Scheduler is active and running\n");

  // Optional: Run immediately on startup (comment out if not desired)
  // setTimeout(() => {
  //   console.log("🚀 Running initial scout on startup...");
  //   executeScout();
  // }, 5000); // Wait 5 seconds after server start
}

/**
 * Get scheduler status (for API/dashboard)
 */
export function getSchedulerStatus() {
  return {
    isRunning,
    lastRun: lastRun?.toISOString() || null,
    lastResult,
    nextRun: getNextRunTime(),
  };
}

/**
 * Calculate next run time
 */
function getNextRunTime(): string | null {
  const now = new Date();
  const hours = [0, 6, 12, 18];
  
  for (const hour of hours) {
    const next = new Date(now);
    next.setHours(hour, 0, 0, 0);
    
    if (next > now) {
      return next.toISOString();
    }
  }
  
  // If no run today, next is tomorrow at midnight
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}

/**
 * Manually trigger scout (for testing/admin)
 */
export async function manualTrigger() {
  if (isRunning) {
    throw new Error("Scout is already running");
  }
  
  console.log("🔧 Manual scout trigger requested");
  await executeScout();
  return lastResult;
}
