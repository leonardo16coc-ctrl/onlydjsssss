/**
 * Hybrid Earnings Model - 50% DJs / 50% Platform
 * 
 * Distribution:
 * - Total Revenue → 50% DJs / 50% Platform
 * - DJ Pool (50%) → 30% by Downloads + 20% by DJ Score
 * 
 * DJ Score Formula:
 * DJ_SCORE = (DOWNLOADS × 40%) + (STREAMS × 30%) + (MINUTES × 20%) + (FAVORITES+PLAYLISTS × 10%)
 * 
 * Earnings Formula:
 * GANANCIA_DJ = (DOWNLOADS_DJ × VALUE_PER_DOWNLOAD) + ((DJ_SCORE / TOTAL_SCORE) × POOL_SCORE)
 */

export interface DJMetrics {
  downloads: number;
  streams: number;
  minutesListened: number;
  favoritesPlaylists: number;
}

export interface MonthlyEarningsCalculation {
  // Input
  totalRevenue: number; // Total monthly revenue from subscriptions
  platformTotalDownloads: number; // Total downloads across all DJs
  platformTotalScore: number; // Sum of all DJ scores
  
  // Pools
  poolDJs: number; // 50% of total revenue
  poolPlatform: number; // 50% of total revenue
  poolDownloads: number; // 30% of DJ pool
  poolScore: number; // 20% of DJ pool
  
  // Per-unit values
  valuePerDownload: number; // Pool downloads / total downloads
}

export interface DJEarnings {
  userId: number;
  month: string; // YYYY-MM
  
  // Metrics
  totalDownloads: number;
  totalStreams: number;
  totalMinutesListened: number;
  totalFavoritesPlaylists: number;
  djScore: number;
  
  // Earnings breakdown
  earningsFromDownloads: number;
  earningsFromScore: number;
  totalEarnings: number;
}

/**
 * Calculate DJ Score based on metrics
 * Formula: (DOWNLOADS × 40%) + (STREAMS × 30%) + (MINUTES × 20%) + (FAVORITES+PLAYLISTS × 10%)
 */
export function calculateDJScore(metrics: DJMetrics): number {
  const {
    downloads,
    streams,
    minutesListened,
    favoritesPlaylists,
  } = metrics;

  const score = 
    (downloads * 0.40) +
    (streams * 0.30) +
    (minutesListened * 0.20) +
    (favoritesPlaylists * 0.10);

  return Math.max(0, score); // Ensure non-negative
}

/**
 * Calculate monthly earnings pools
 */
export function calculateMonthlyPools(totalRevenue: number, platformTotalDownloads: number): MonthlyEarningsCalculation {
  // Split 50/50 between DJs and Platform
  const poolDJs = totalRevenue * 0.50;
  const poolPlatform = totalRevenue * 0.50;
  
  // DJ pool distribution: 30% downloads, 20% score
  const poolDownloads = poolDJs * 0.30;
  const poolScore = poolDJs * 0.20;
  
  // Value per download
  const valuePerDownload = platformTotalDownloads > 0 
    ? poolDownloads / platformTotalDownloads 
    : 0;
  
  return {
    totalRevenue,
    platformTotalDownloads,
    platformTotalScore: 0, // Will be calculated after all DJ scores
    poolDJs,
    poolPlatform,
    poolDownloads,
    poolScore,
    valuePerDownload,
  };
}

/**
 * Calculate individual DJ earnings
 */
export function calculateDJEarnings(
  userId: number,
  month: string,
  metrics: DJMetrics,
  pools: MonthlyEarningsCalculation
): DJEarnings {
  // Calculate DJ Score
  const djScore = calculateDJScore(metrics);
  
  // Earnings from downloads
  const earningsFromDownloads = metrics.downloads * pools.valuePerDownload;
  
  // Earnings from score (proportional to total score)
  const earningsFromScore = pools.platformTotalScore > 0
    ? (djScore / pools.platformTotalScore) * pools.poolScore
    : 0;
  
  // Total earnings
  const totalEarnings = earningsFromDownloads + earningsFromScore;
  
  return {
    userId,
    month,
    totalDownloads: metrics.downloads,
    totalStreams: metrics.streams,
    totalMinutesListened: metrics.minutesListened,
    totalFavoritesPlaylists: metrics.favoritesPlaylists,
    djScore,
    earningsFromDownloads,
    earningsFromScore,
    totalEarnings,
  };
}

/**
 * Calculate earnings for all DJs in a month
 * This is the main function to be called by the cron job
 */
export function calculateMonthlyEarningsForAllDJs(
  totalRevenue: number,
  djMetrics: Array<{ userId: number; metrics: DJMetrics }>
): Array<DJEarnings> {
  // Calculate total platform downloads
  const platformTotalDownloads = djMetrics.reduce(
    (sum, dj) => sum + dj.metrics.downloads,
    0
  );
  
  // Calculate pools
  const pools = calculateMonthlyPools(totalRevenue, platformTotalDownloads);
  
  // Calculate all DJ scores first
  const djScores = djMetrics.map((dj) => ({
    userId: dj.userId,
    score: calculateDJScore(dj.metrics),
  }));
  
  // Calculate platform total score
  pools.platformTotalScore = djScores.reduce((sum, dj) => sum + dj.score, 0);
  
  // Calculate earnings for each DJ
  const month = new Date().toISOString().slice(0, 7); // YYYY-MM
  return djMetrics.map((dj) => 
    calculateDJEarnings(dj.userId, month, dj.metrics, pools)
  );
}

/**
 * Example usage:
 * 
 * // Monthly revenue from subscriptions (e.g., 1000 users × $4.99 = $4,990)
 * const totalRevenue = 4990;
 * 
 * // DJ metrics for the month
 * const djMetrics = [
 *   { userId: 1, metrics: { downloads: 100, streams: 500, minutesListened: 1000, favoritesPlaylists: 50 } },
 *   { userId: 2, metrics: { downloads: 200, streams: 800, minutesListened: 1500, favoritesPlaylists: 80 } },
 *   // ... more DJs
 * ];
 * 
 * // Calculate earnings
 * const earnings = calculateMonthlyEarningsForAllDJs(totalRevenue, djMetrics);
 * 
 * // Save to database
 * for (const earning of earnings) {
 *   await db.insert(earnings).values({
 *     userId: earning.userId,
 *     month: earning.month,
 *     totalDownloads: earning.totalDownloads,
 *     totalStreams: earning.totalStreams,
 *     totalMinutesListened: earning.totalMinutesListened,
 *     totalFavoritesPlaylists: earning.totalFavoritesPlaylists,
 *     djScore: earning.djScore.toFixed(2),
 *     earningsFromDownloads: earning.earningsFromDownloads.toFixed(2),
 *     earningsFromScore: earning.earningsFromScore.toFixed(2),
 *     userEarnings: earning.totalEarnings.toFixed(2),
 *     // ... other fields
 *   });
 * }
 */
