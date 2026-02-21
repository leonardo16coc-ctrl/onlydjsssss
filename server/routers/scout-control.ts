/**
 * Scout Control Router
 * Allows manual triggering of the daily scout from the dashboard
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getSchedulerStatus, manualTrigger } from "../_core/scheduler";

export const scoutControlRouter = router({
  /**
   * Get scout status
   */
  getStatus: publicProcedure.query(() => {
    return getSchedulerStatus();
  }),

  /**
   * Manually trigger the daily scout
   */
  runScout: publicProcedure.mutation(async () => {
    const result = await manualTrigger();
    return {
      success: true,
      result,
    };
  }),
});
