/**
 * Scout Control Router
 * Allows manual triggering of the daily scout from the dashboard
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { runMultiPlatformScout } from "../scouts/multi-platform-scout";

let scoutRunning = false;
let lastRun: Date | null = null;
let lastResult: any = null;

export const scoutControlRouter = router({
  /**
   * Get scout status
   */
  getStatus: publicProcedure.query(() => {
    return {
      running: scoutRunning,
      lastRun: lastRun?.toISOString() || null,
      lastResult,
    };
  }),

  /**
   * Manually trigger the daily scout
   */
  runScout: publicProcedure.mutation(async () => {
    if (scoutRunning) {
      throw new Error("Scout is already running");
    }

    scoutRunning = true;
    lastRun = new Date();

    try {
      const result = await runMultiPlatformScout();
      lastResult = result;
      scoutRunning = false;
      return {
        success: true,
        result,
      };
    } catch (error: any) {
      scoutRunning = false;
      lastResult = { error: error.message };
      throw error;
    }
  }),
});
