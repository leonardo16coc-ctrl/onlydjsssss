/**
 * Daily Queue Router
 * Provides today's top leads for manual outreach
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDjLeads } from "../db";

export const dailyQueueRouter = router({
  /**
   * Get today's recommended leads for outreach
   * Returns top 10 discovered DJs sorted by talent score
   */
  getTodayQueue: publicProcedure.query(async () => {
    // Get all discovered DJs (not yet contacted)
    const allLeads = await getDjLeads("discovered");
    
    // Sort by talent score (highest first)
    const sorted = allLeads.sort((a, b) => {
      const scoreA = parseFloat(a.talentScore?.toString() || "0");
      const scoreB = parseFloat(b.talentScore?.toString() || "0");
      return scoreB - scoreA;
    });
    
    // Return top 10
    const topLeads = sorted.slice(0, 10);
    
    return {
      leads: topLeads,
      total: allLeads.length,
      contacted: 0, // TODO: Count contacted today
    };
  }),

  /**
   * Get stats for the daily queue
   */
  getQueueStats: publicProcedure.query(async () => {
    const discovered = await getDjLeads("discovered");
    const contacted = await getDjLeads("contacted");
    const responded = await getDjLeads("responded");
    const converted = await getDjLeads("converted");
    
    return {
      discovered: discovered.length,
      contacted: contacted.length,
      responded: responded.length,
      converted: converted.length,
      conversionRate: contacted.length > 0 
        ? ((converted.length / contacted.length) * 100).toFixed(1)
        : "0.0",
    };
  }),
});
