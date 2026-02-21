import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

export const emailAnalyticsRouter = router({
  /**
   * Get overall email campaign statistics
   */
  getOverallStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [stats] = await db.execute(sql`
      SELECT 
        COUNT(*) as total_sent,
        SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as total_opened,
        SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) as total_clicked,
        SUM(CASE WHEN replied_at IS NOT NULL THEN 1 ELSE 0 END) as total_replied,

        ROUND(
          (SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) * 100.0) / NULLIF(COUNT(*), 0), 
          2
        ) as open_rate,
        ROUND(
          (SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) * 100.0) / NULLIF(COUNT(*), 0), 
          2
        ) as click_rate,
        ROUND(
          (SUM(CASE WHEN replied_at IS NOT NULL THEN 1 ELSE 0 END) * 100.0) / NULLIF(COUNT(*), 0), 
          2
        ) as reply_rate
      FROM email_campaigns
      WHERE status != 'failed'
    `);

    return stats as any || {
      total_sent: 0,
      total_opened: 0,
      total_clicked: 0,
      total_replied: 0,

      open_rate: 0,
      click_rate: 0,
      reply_rate: 0,

    };
  }),

  /**
   * Get email stats by date range
   */
  getStatsByDateRange: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const stats = await db.execute(sql`
        SELECT 
          DATE(sent_at) as date,
          COUNT(*) as sent,
          SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as opened,
          SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) as clicked,
          SUM(CASE WHEN replied_at IS NOT NULL THEN 1 ELSE 0 END) as replied,
          ROUND(
            (SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) * 100.0) / NULLIF(COUNT(*), 0), 
            2
          ) as open_rate,
          ROUND(
            (SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) * 100.0) / NULLIF(COUNT(*), 0), 
            2
          ) as click_rate
        FROM email_campaigns
        WHERE sent_at >= ${input.startDate}
          AND sent_at <= ${input.endDate}
          AND status != 'failed'
        GROUP BY DATE(sent_at)
        ORDER BY date DESC
      `);

      return stats as any[] || [];
    }),

  /**
   * Get stats by platform (email, instagram, etc.)
   */
  getStatsByPlatform: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const stats = await db.execute(sql`
      SELECT 
        platform,
        COUNT(*) as total_sent,
        SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as opened,
        SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) as clicked,
        SUM(CASE WHEN replied_at IS NOT NULL THEN 1 ELSE 0 END) as replied,
        ROUND(
          (SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) * 100.0) / NULLIF(COUNT(*), 0), 
          2
        ) as open_rate,
        ROUND(
          (SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) * 100.0) / NULLIF(COUNT(*), 0), 
          2
        ) as click_rate
      FROM email_campaigns
      WHERE status != 'failed'
      GROUP BY platform
      ORDER BY total_sent DESC
    `);

    return stats as any[] || [];
  }),

  /**
   * Get conversion funnel stats
   * discovered → contacted → opened → clicked → replied → converted
   */
  getConversionFunnel: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Total DJs discovered
    const [discovered] = await db.execute(sql`
      SELECT COUNT(*) as count FROM discovered_djs
    `);

    // Total DJs contacted (emails sent)
    const [contacted] = await db.execute(sql`
      SELECT COUNT(DISTINCT dj_id) as count 
      FROM email_campaigns 
      WHERE status != 'failed'
    `);

    // Total DJs who opened emails
    const [opened] = await db.execute(sql`
      SELECT COUNT(DISTINCT dj_id) as count 
      FROM email_campaigns 
      WHERE opened_at IS NOT NULL
    `);

    // Total DJs who clicked links
    const [clicked] = await db.execute(sql`
      SELECT COUNT(DISTINCT dj_id) as count 
      FROM email_campaigns 
      WHERE clicked_at IS NOT NULL
    `);

    // Total DJs who replied
    const [replied] = await db.execute(sql`
      SELECT COUNT(DISTINCT dj_id) as count 
      FROM email_campaigns 
      WHERE replied_at IS NOT NULL
    `);

    // Total DJs converted (status = 'converted' in discovered_djs)
    const [converted] = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM discovered_djs 
      WHERE discoverystatus = 'converted'
    `);

    const discoveredCount = (discovered as any).count || 0;
    const contactedCount = (contacted as any).count || 0;
    const openedCount = (opened as any).count || 0;
    const clickedCount = (clicked as any).count || 0;
    const repliedCount = (replied as any).count || 0;
    const convertedCount = (converted as any).count || 0;

    return {
      discovered: discoveredCount,
      contacted: contactedCount,
      opened: openedCount,
      clicked: clickedCount,
      replied: repliedCount,
      converted: convertedCount,
      // Conversion rates
      contact_rate: discoveredCount > 0 ? ((contactedCount / discoveredCount) * 100).toFixed(2) : "0",
      open_rate: contactedCount > 0 ? ((openedCount / contactedCount) * 100).toFixed(2) : "0",
      click_rate: openedCount > 0 ? ((clickedCount / openedCount) * 100).toFixed(2) : "0",
      reply_rate: clickedCount > 0 ? ((repliedCount / clickedCount) * 100).toFixed(2) : "0",
      conversion_rate: repliedCount > 0 ? ((convertedCount / repliedCount) * 100).toFixed(2) : "0",
    };
  }),

  /**
   * Get recent email campaigns with detailed info
   */
  getRecentCampaigns: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const campaigns = await db.execute(sql`
        SELECT 
          ec.id,
          ec.dj_id,
          ec.email_to,
          ec.subject,
          ec.platform,
          ec.status,
          ec.sent_at,
          ec.opened_at,
          ec.clicked_at,
          ec.replied_at,

          dj.fullname as dj_name,
          dj.primarygenre as genre
        FROM email_campaigns ec
        LEFT JOIN discovered_djs dj ON ec.dj_id = dj.id
        WHERE ec.status != 'failed'
        ORDER BY ec.sent_at DESC
        LIMIT ${input.limit}
      `);

      return campaigns as any[] || [];
    }),

  /**
   * Get stats by DJ genre
   */
  getStatsByGenre: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const stats = await db.execute(sql`
      SELECT 
        dj.primarygenre as genre,
        COUNT(ec.id) as total_sent,
        SUM(CASE WHEN ec.opened_at IS NOT NULL THEN 1 ELSE 0 END) as opened,
        SUM(CASE WHEN ec.clicked_at IS NOT NULL THEN 1 ELSE 0 END) as clicked,
        SUM(CASE WHEN ec.replied_at IS NOT NULL THEN 1 ELSE 0 END) as replied,
        ROUND(
          (SUM(CASE WHEN ec.opened_at IS NOT NULL THEN 1 ELSE 0 END) * 100.0) / NULLIF(COUNT(ec.id), 0), 
          2
        ) as open_rate,
        ROUND(
          (SUM(CASE WHEN ec.clicked_at IS NOT NULL THEN 1 ELSE 0 END) * 100.0) / NULLIF(COUNT(ec.id), 0), 
          2
        ) as click_rate
      FROM email_campaigns ec
      INNER JOIN discovered_djs dj ON ec.dj_id = dj.id
      WHERE ec.status != 'failed'
        AND dj.primarygenre IS NOT NULL
      GROUP BY dj.primarygenre
      ORDER BY total_sent DESC
      LIMIT 10
    `);

    return stats as any[] || [];
  }),
});
