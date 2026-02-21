import { router, protectedProcedure } from "../_core/trpc";
import { manualFollowUpTrigger } from "../_core/scheduler";
import { detectFollowUpNeeded, getFollowUpStats } from "../email/follow-up-system";

export const followUpRouter = router({
  /**
   * Get list of DJs that need follow-up
   */
  getNeedingFollowUp: protectedProcedure.query(async () => {
    const djs = await detectFollowUpNeeded();
    return {
      count: djs.length,
      djs,
    };
  }),

  /**
   * Get follow-up statistics
   */
  getStats: protectedProcedure.query(async () => {
    const stats = await getFollowUpStats();
    return stats || {
      total_follow_ups: 0,
      opened: 0,
      replied: 0,
    };
  }),

  /**
   * Manually trigger follow-up emails
   */
  sendNow: protectedProcedure.mutation(async () => {
    try {
      const result = await manualFollowUpTrigger();
      return {
        success: true,
        ...result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }),
});
