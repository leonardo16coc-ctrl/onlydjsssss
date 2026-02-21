/**
 * Internal Scheduler Service
 * Runs the multi-platform scout every 6 hours automatically
 * No system cron required - runs inside the Node.js process
 */

import cron from "node-cron";
import { runMultiPlatformScout } from "../scouts/multi-platform-scout";
import { sendFollowUpEmails } from "../email/follow-up-system";

let isRunning = false;
let lastRun: Date | null = null;
let lastResult: any = null;

let isFollowUpRunning = false;
let lastFollowUpRun: Date | null = null;
let lastFollowUpResult: any = null;

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

  // Schedule follow-up emails: Daily at 10 AM
  cron.schedule("0 10 * * *", () => {
    executeFollowUp();
  });

  console.log("✅ Scout scheduler: Every 6 hours (12 AM, 6 AM, 12 PM, 6 PM)");
  console.log("✅ Follow-up scheduler: Daily at 10 AM");
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
    scout: {
      isRunning,
      lastRun: lastRun?.toISOString() || null,
      lastResult,
      nextRun: getNextRunTime(),
    },
    followUp: {
      isRunning: isFollowUpRunning,
      lastRun: lastFollowUpRun?.toISOString() || null,
      lastResult: lastFollowUpResult,
      nextRun: getNextFollowUpRunTime(),
    },
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

/**
 * Execute follow-up emails with error handling
 */
async function executeFollowUp() {
  if (isFollowUpRunning) {
    console.log("[Scheduler] Follow-up already running, skipping...");
    return;
  }

  isFollowUpRunning = true;
  lastFollowUpRun = new Date();
  
  console.log("\n╔═══════════════════════════════════════╗");
  console.log("║  SCHEDULED FOLLOW-UP EXECUTION        ║");
  console.log("╚═══════════════════════════════════════╝");
  console.log(`🕐 Started at: ${lastFollowUpRun.toLocaleString()}\n`);

  try {
    const result = await sendFollowUpEmails();
    lastFollowUpResult = { success: true, ...result };
    
    console.log("\n✅ Scheduled follow-up completed successfully");
    console.log(`📧 Sent: ${result.sent} emails`);
    console.log(`❌ Failed: ${result.failed} emails`);
  } catch (error: any) {
    console.error("\n❌ Scheduled follow-up failed:", error.message);
    lastFollowUpResult = { success: false, error: error.message };
  } finally {
    isFollowUpRunning = false;
    console.log(`🕐 Finished at: ${new Date().toLocaleString()}\n`);
  }
}

/**
 * Calculate next follow-up run time (daily at 10 AM)
 */
function getNextFollowUpRunTime(): string | null {
  const now = new Date();
  const next = new Date(now);
  next.setHours(10, 0, 0, 0);
  
  if (next <= now) {
    // If 10 AM already passed today, schedule for tomorrow
    next.setDate(next.getDate() + 1);
  }
  
  return next.toISOString();
}

/**
 * Manually trigger follow-up (for testing/admin)
 */
export async function manualFollowUpTrigger() {
  if (isFollowUpRunning) {
    throw new Error("Follow-up is already running");
  }
  
  console.log("🔧 Manual follow-up trigger requested");
  await executeFollowUp();
  return lastFollowUpResult;
}
