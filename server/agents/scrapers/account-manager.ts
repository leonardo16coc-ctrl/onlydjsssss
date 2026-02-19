/**
 * Account Manager for Scraper System
 * Manages multiple scraper accounts and handles ban detection
 */

import { db } from '../db-helper';

export interface ScraperAccount {
  id: number;
  platform: 'instagram' | 'soundcloud';
  username: string;
  password: string | null;
  status: 'active' | 'banned' | 'suspended' | 'rate_limited';
  lastUsedAt: Date | null;
  banDetectedAt: Date | null;
  totalActions: number;
  successfulActions: number;
  failedActions: number;
  createdAt: Date;
}

/**
 * Add new scraper account
 */
export async function addScraperAccount(
  platform: 'instagram' | 'soundcloud',
  username: string,
  password?: string
): Promise<number> {
  const result = await db.query(
    `INSERT INTO scraper_accounts (platform, username, password, status)
     VALUES (?, ?, ?, 'active')`,
    [platform, username, password || null]
  );
  
  const accountId = (result as any).insertId;
  
  console.log(`✅ Added scraper account: ${platform}/@${username} (ID: ${accountId})`);
  
  return accountId;
}

/**
 * Get active account for platform
 */
export async function getActiveAccount(platform: 'instagram' | 'soundcloud'): Promise<ScraperAccount | null> {
  const accounts = await db.query<ScraperAccount>(
    `SELECT * FROM scraper_accounts
     WHERE platform = ? AND status = 'active'
     ORDER BY lastUsedAt ASC NULLS FIRST
     LIMIT 1`,
    [platform]
  );
  
  if (accounts.length === 0) {
    console.log(`⚠️ No active accounts available for ${platform}`);
    return null;
  }
  
  return accounts[0];
}

/**
 * Mark account as used
 */
export async function markAccountUsed(accountId: number): Promise<void> {
  await db.query(
    `UPDATE scraper_accounts SET
      lastUsedAt = NOW(),
      totalActions = totalActions + 1
     WHERE id = ?`,
    [accountId]
  );
}

/**
 * Mark account as banned
 */
export async function markAccountBanned(
  accountId: number,
  reason?: string
): Promise<void> {
  await db.query(
    `UPDATE scraper_accounts SET
      status = 'banned',
      banDetectedAt = NOW()
     WHERE id = ?`,
    [accountId]
  );
  
  // Log ban event
  await db.query(
    `INSERT INTO scraper_logs (platform, action, status, error, timestamp)
     SELECT platform, 'account_banned', 'banned', ?, NOW()
     FROM scraper_accounts WHERE id = ?`,
    [reason || 'Ban detected', accountId]
  );
  
  console.log(`🚫 Account ${accountId} marked as banned`);
}

/**
 * Mark account as rate limited
 */
export async function markAccountRateLimited(accountId: number): Promise<void> {
  await db.query(
    `UPDATE scraper_accounts SET
      status = 'rate_limited'
     WHERE id = ?`,
    [accountId]
  );
  
  console.log(`⏳ Account ${accountId} marked as rate limited`);
}

/**
 * Reactivate rate limited accounts (after cooldown)
 */
export async function reactivateRateLimitedAccounts(): Promise<number> {
  const result = await db.query(
    `UPDATE scraper_accounts SET
      status = 'active'
     WHERE status = 'rate_limited'
     AND lastUsedAt < DATE_SUB(NOW(), INTERVAL 24 HOUR)`
  );
  
  const reactivated = (result as any).affectedRows || 0;
  
  if (reactivated > 0) {
    console.log(`✅ Reactivated ${reactivated} rate-limited accounts`);
  }
  
  return reactivated;
}

/**
 * Record successful action
 */
export async function recordSuccessfulAction(accountId: number): Promise<void> {
  await db.query(
    `UPDATE scraper_accounts SET
      successfulActions = successfulActions + 1
     WHERE id = ?`,
    [accountId]
  );
}

/**
 * Record failed action
 */
export async function recordFailedAction(accountId: number): Promise<void> {
  await db.query(
    `UPDATE scraper_accounts SET
      failedActions = failedActions + 1
     WHERE id = ?`,
    [accountId]
  );
}

/**
 * Get account statistics
 */
export async function getAccountStats(platform?: 'instagram' | 'soundcloud') {
  let query = `
    SELECT 
      platform,
      status,
      COUNT(*) as count,
      SUM(totalActions) as totalActions,
      SUM(successfulActions) as successfulActions,
      SUM(failedActions) as failedActions
    FROM scraper_accounts
  `;
  
  const params: any[] = [];
  
  if (platform) {
    query += ' WHERE platform = ?';
    params.push(platform);
  }
  
  query += ' GROUP BY platform, status';
  
  const stats = await db.query(query, params);
  
  return stats;
}

/**
 * Get scraper health report
 */
export async function getScraperHealthReport() {
  // Get account stats
  const accountStats = await getAccountStats();
  
  // Get recent logs (last 24 hours)
  const recentLogs = await db.query(`
    SELECT 
      platform,
      status,
      COUNT(*) as count
    FROM scraper_logs
    WHERE timestamp > DATE_SUB(NOW(), INTERVAL 24 HOUR)
    GROUP BY platform, status
  `);
  
  // Get ban rate (last 7 days)
  const banStats = await db.query(`
    SELECT 
      platform,
      COUNT(*) as totalAccounts,
      SUM(CASE WHEN status = 'banned' THEN 1 ELSE 0 END) as bannedAccounts,
      SUM(CASE WHEN banDetectedAt > DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as recentBans
    FROM scraper_accounts
    GROUP BY platform
  `);
  
  // Calculate success rate
  const successRate = await db.query(`
    SELECT 
      platform,
      SUM(successfulActions) as successful,
      SUM(failedActions) as failed,
      ROUND(SUM(successfulActions) / (SUM(successfulActions) + SUM(failedActions)) * 100, 2) as successRate
    FROM scraper_accounts
    WHERE totalActions > 0
    GROUP BY platform
  `);
  
  return {
    accountStats,
    recentLogs,
    banStats,
    successRate,
    timestamp: new Date()
  };
}

/**
 * Clean up old logs (keep last 30 days)
 */
export async function cleanupOldLogs(): Promise<number> {
  const result = await db.query(
    `DELETE FROM scraper_logs
     WHERE timestamp < DATE_SUB(NOW(), INTERVAL 30 DAY)`
  );
  
  const deleted = (result as any).affectedRows || 0;
  
  if (deleted > 0) {
    console.log(`🧹 Cleaned up ${deleted} old log entries`);
  }
  
  return deleted;
}

/**
 * Get all accounts
 */
export async function getAllAccounts(platform?: 'instagram' | 'soundcloud'): Promise<ScraperAccount[]> {
  let query = 'SELECT * FROM scraper_accounts';
  const params: any[] = [];
  
  if (platform) {
    query += ' WHERE platform = ?';
    params.push(platform);
  }
  
  query += ' ORDER BY createdAt DESC';
  
  const accounts = await db.query<ScraperAccount>(query, params);
  
  return accounts;
}

/**
 * Delete account
 */
export async function deleteAccount(accountId: number): Promise<void> {
  await db.query('DELETE FROM scraper_accounts WHERE id = ?', [accountId]);
  console.log(`🗑️ Deleted account ${accountId}`);
}

/**
 * Update account status
 */
export async function updateAccountStatus(
  accountId: number,
  status: 'active' | 'banned' | 'suspended' | 'rate_limited'
): Promise<void> {
  await db.query(
    'UPDATE scraper_accounts SET status = ? WHERE id = ?',
    [status, accountId]
  );
  
  console.log(`✅ Updated account ${accountId} status to: ${status}`);
}
