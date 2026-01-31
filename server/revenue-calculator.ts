/**
 * Revenue Calculator
 * 
 * Sistema de cálculo y distribución de ganancias para DJs
 * Modelo híbrido: 50% DJs / 50% Plataforma
 * Distribución DJ: 30% descargas + 20% DJ Score
 */

import { getDb } from "./db";
import { downloads, tracks, users, wallets, monthlyRevenuePools, djScores } from "../drizzle/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { REVENUE_MODEL, calculateDJScore } from "./stripe-products";

/**
 * Get total revenue for a given month
 * Based on active PRO subscriptions ($4.99 each)
 */
export async function getMonthlyRevenue(monthStr: string): Promise<number> {
  // monthStr format: "YYYY-MM"
  const [year, month] = monthStr.split("-").map(Number);
  // In a real implementation, this would query Stripe for actual revenue
  // For now, we'll calculate based on active PRO members
  
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  // Count active PRO members during this period
  const activeMembers = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(
      and(
        eq(users.membershipStatus, "member"),
        // Member was active during this month
        sql`${users.createdAt} <= ${endDate}`
      )
    );
  
  const memberCount = Number(activeMembers[0]?.count || 0);
  const monthlyRevenue = memberCount * 4.99; // $4.99 per member
  
  return monthlyRevenue;
}

/**
 * Get DJ metrics for a given month
 */
export async function getDJMetrics(djId: number, monthStr: string) {
  // monthStr format: "YYYY-MM"
  const [year, month] = monthStr.split("-").map(Number);
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  // Get downloads count
  const downloadCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(downloads)
    .innerJoin(tracks, eq(downloads.trackId, tracks.id))
    .where(
      and(
        eq(tracks.userId, djId),
        gte(downloads.downloadedAt, startDate),
        lte(downloads.downloadedAt, endDate)
      )
    );
  
  // Get streams count (estimate from total downloads * 10)
  // TODO: Implement proper streaming tracking
  const streamEstimate = Number(downloadCount[0]?.count || 0) * 10;
  
  // TODO: Implement actual tracking of minutes listened and engagement
  // For now, estimate based on streams
  const estimatedMinutes = streamEstimate * 3; // Avg 3 min per stream
  const estimatedEngagement = Math.floor(Number(downloadCount[0]?.count || 0) * 0.1); // 10% of downloads
  
  return {
    downloads: Number(downloadCount[0]?.count || 0),
    streams: streamEstimate,
    minutes: estimatedMinutes,
    engagement: estimatedEngagement,
  };
}

/**
 * Calculate and save DJ Score for all DJs for a given month
 */
export async function calculateAllDJScores(monthStr: string) {
  // monthStr format: "YYYY-MM"
  const [year, month] = monthStr.split("-").map(Number);
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  // Get all DJs (users with tracks)
  const djs = await db
    .selectDistinct({ djId: tracks.userId })
    .from(tracks)
    .where(sql`${tracks.userId} IS NOT NULL`);
  
  const scores: Array<{
    djId: number;
    score: number;
    metrics: ReturnType<typeof getDJMetrics> extends Promise<infer T> ? T : never;
  }> = [];
  
  for (const { djId } of djs) {
    if (!djId) continue;
    
    const metrics = await getDJMetrics(djId, monthStr);
    const score = calculateDJScore(
      metrics.downloads,
      metrics.streams,
      metrics.minutes,
      metrics.engagement
    );
    
    // Save to database
    await db.insert(djScores).values({
      userId: djId,
      month: monthStr,
      totalDownloads: metrics.downloads,
      totalStreams: metrics.streams,
      totalMinutesListened: metrics.minutes,
      totalFavorites: 0, // TODO: implement favorites tracking
      totalPlaylistAdds: metrics.engagement,
      djScore: score.toString(),
      downloadsScore: (metrics.downloads * REVENUE_MODEL.SCORE_WEIGHTS.DOWNLOADS).toString(),
      streamsScore: (metrics.streams * REVENUE_MODEL.SCORE_WEIGHTS.STREAMS).toString(),
      listeningTimeScore: (metrics.minutes * REVENUE_MODEL.SCORE_WEIGHTS.MINUTES).toString(),
      engagementScore: (metrics.engagement * REVENUE_MODEL.SCORE_WEIGHTS.ENGAGEMENT).toString(),
    });
    
    scores.push({ djId, score, metrics });
  }
  
  return scores;
}

/**
 * Distribute revenue pool among DJs
 */
export async function distributeMonthlyRevenue(monthStr: string) {
  // monthStr format: "YYYY-MM"
  const [year, month] = monthStr.split("-").map(Number);
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  // 1. Get total revenue
  const totalRevenue = await getMonthlyRevenue(monthStr);
  
  // 2. Calculate pools
  const djPool = totalRevenue * REVENUE_MODEL.DJ_SHARE; // 50% to DJs
  const platformPool = totalRevenue * REVENUE_MODEL.PLATFORM_SHARE; // 50% to platform
  
  const downloadsPool = djPool * REVENUE_MODEL.DOWNLOADS_POOL; // 30% of DJ pool
  const scorePool = djPool * REVENUE_MODEL.SCORE_POOL; // 20% of DJ pool
  
  // 3. Calculate DJ Scores
  const djScoresData = await calculateAllDJScores(monthStr);
  
  // 4. Calculate total downloads and total score
  const totalDownloads = djScoresData.reduce((sum, dj) => sum + dj.metrics.downloads, 0);
  const totalScore = djScoresData.reduce((sum, dj) => sum + dj.score, 0);
  
  // 5. Calculate earnings per download and per score point
  const valuePerDownload = totalDownloads > 0 ? downloadsPool / totalDownloads : 0;
  const valuePerScorePoint = totalScore > 0 ? scorePool / totalScore : 0;
  
  // 6. Distribute to each DJ
  const distributions = [];
  
  for (const djData of djScoresData) {
    const downloadEarnings = djData.metrics.downloads * valuePerDownload;
    const scoreEarnings = djData.score * valuePerScorePoint;
    const totalEarnings = downloadEarnings + scoreEarnings;
    const participationPercent = totalRevenue > 0 ? (totalEarnings / djPool) * 100 : 0;
    
    // Update wallet
    const currentWallet = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, djData.djId))
      .limit(1);
    
    if (currentWallet.length > 0) {
      await db
        .update(wallets)
        .set({
          availableBalance: sql`${wallets.availableBalance} + ${totalEarnings}`,
          totalEarnings: sql`${wallets.totalEarnings} + ${totalEarnings}`,
          updatedAt: new Date(),
        })
        .where(eq(wallets.userId, djData.djId));
    } else {
      // Create wallet if doesn't exist
      await db.insert(wallets).values({
        userId: djData.djId,
        availableBalance: totalEarnings.toString(),
        pendingBalance: "0.00",
        totalEarnings: totalEarnings.toString(),
        totalWithdrawn: "0.00",
      });
    }
    
    distributions.push({
      djId: djData.djId,
      downloadEarnings,
      scoreEarnings,
      totalEarnings,
      participationPercent,
    });
  }
  
  // 7. Save revenue pool record
  await db.insert(monthlyRevenuePools).values({
    month: monthStr,
    totalRevenue: totalRevenue.toString(),
    platformShare: platformPool.toString(),
    djsShare: djPool.toString(),
    downloadsPool: downloadsPool.toString(),
    scorePool: scorePool.toString(),
    totalDownloads,
    totalDJScore: totalScore.toString(),
    status: "completed",
    calculatedAt: new Date(),
  });
  
  return {
    totalRevenue,
    platformPool,
    djPool,
    downloadsPool,
    scorePool,
    distributions,
  };
}

/**
 * Get DJ earnings summary for a specific month
 */
export async function getDJEarningsSummary(djId: number, monthStr: string) {
  // monthStr format: "YYYY-MM"
  const [year, month] = monthStr.split("-").map(Number);
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  // Get DJ Score
  const scoreRecord = await db
    .select()
    .from(djScores)
    .where(
      and(
        eq(djScores.userId, djId),
        eq(djScores.month, monthStr)
      )
    )
    .limit(1);
  
  // Get wallet
  const walletRecord = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, djId))
    .limit(1);
  
  // Get revenue pool info
  const poolRecord = await db
    .select()
    .from(monthlyRevenuePools)
    .where(eq(monthlyRevenuePools.month, monthStr))
    .limit(1);
  
  return {
    score: scoreRecord[0] || null,
    wallet: walletRecord[0] || null,
    pool: poolRecord[0] || null,
  };
}
