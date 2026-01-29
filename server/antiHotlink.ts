/**
 * Anti-Hotlink Protection System
 * 
 * Protects download endpoints from:
 * - Hotlinking from external sites
 * - Scraping and automated abuse
 * - Token leaking and reuse
 * 
 * Features:
 * - Referer validation with whitelist
 * - JWT-based anti-leech tokens (5 min expiration)
 * - Suspicious activity detection with scoring
 * - Automatic IP blocking (24h duration)
 * - Bot detection by user agent
 */

import jwt from "jsonwebtoken";
import { getDb } from "./db";
import { sql } from "drizzle-orm";
import { ENV } from "./_core/env";

// Allowed referers (whitelist) - Add your production domain here
const ALLOWED_REFERERS = [
  "localhost",
  "127.0.0.1",
  "onlydjs.com",
  "manus.computer", // For development/preview
];

// Suspicious activity thresholds
const SCRAPING_THRESHOLDS = {
  DOWNLOADS_PER_MINUTE: 10,
  DOWNLOADS_PER_HOUR: 200,
  SUSPICION_SCORE_ALERT: 80,
  SUSPICION_SCORE_BLOCK: 90,
};

// Known bot user agents (partial matches, lowercase)
const BOT_USER_AGENTS = [
  "bot",
  "crawler",
  "spider",
  "scraper",
  "wget",
  "curl",
  "python-requests",
  "axios",
  "postman",
];

/**
 * Validate referer header against whitelist
 */
export function validateReferer(referer: string | undefined): boolean {
  if (!referer) {
    // Allow requests without referer (direct browser access)
    return true;
  }

  const refererLower = referer.toLowerCase();
  return ALLOWED_REFERERS.some(allowed => refererLower.includes(allowed));
}

/**
 * Generate anti-leech token for download
 * Token expires in 5 minutes and includes user/track/IP info
 */
export function generateDownloadToken(payload: {
  userId: number;
  trackId: number;
  ipAddress: string;
}): string {
  const secret = ENV.cookieSecret || "fallback-secret-change-in-production";
  
  return jwt.sign(
    {
      ...payload,
      type: "download",
      timestamp: Date.now(),
    },
    secret,
    { expiresIn: "5m" } // Token expires in 5 minutes
  );
}

/**
 * Verify anti-leech token
 * Returns validation result with payload or error message
 */
export function verifyDownloadToken(token: string, ipAddress: string): {
  valid: boolean;
  payload?: any;
  error?: string;
} {
  try {
    const secret = ENV.cookieSecret || "fallback-secret-change-in-production";
    const decoded = jwt.verify(token, secret) as any;

    // Verify token type
    if (decoded.type !== "download") {
      return { valid: false, error: "Invalid token type" };
    }

    // Verify IP matches (prevent token sharing)
    if (decoded.ipAddress !== ipAddress) {
      return { valid: false, error: "IP mismatch - token cannot be shared" };
    }

    return { valid: true, payload: decoded };
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return { valid: false, error: "Token expired" };
    }
    return { valid: false, error: "Invalid token" };
  }
}

/**
 * Calculate suspicion score based on activity patterns
 * Score ranges from 0-100, higher = more suspicious
 */
export async function calculateSuspicionScore(ipAddress: string): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  let score = 0;

  // Check downloads in last minute
  const downloadsLastMinute = await db.execute(sql`
    SELECT COUNT(*) as count
    FROM downloads
    WHERE ip_address = ${ipAddress}
    AND downloaded_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE)
  `);
  const countLastMinute = (downloadsLastMinute[0] as any)?.count || 0;
  if (countLastMinute > SCRAPING_THRESHOLDS.DOWNLOADS_PER_MINUTE) {
    score += 40; // High suspicion
  } else if (countLastMinute > 5) {
    score += 20; // Medium suspicion
  }

  // Check downloads in last hour
  const downloadsLastHour = await db.execute(sql`
    SELECT COUNT(*) as count
    FROM downloads
    WHERE ip_address = ${ipAddress}
    AND downloaded_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
  `);
  const countLastHour = (downloadsLastHour[0] as any)?.count || 0;
  if (countLastHour > SCRAPING_THRESHOLDS.DOWNLOADS_PER_HOUR) {
    score += 50; // Very high suspicion
  } else if (countLastHour > 100) {
    score += 30; // High suspicion
  }

  // Check for sequential downloads (no pauses - likely automated)
  const recentDownloads = await db.execute(sql`
    SELECT downloaded_at
    FROM downloads
    WHERE ip_address = ${ipAddress}
    ORDER BY downloaded_at DESC
    LIMIT 10
  `);
  
  if (Array.isArray(recentDownloads) && recentDownloads.length >= 5) {
    const timestamps = recentDownloads.map((row: any) => new Date(row.downloaded_at).getTime());
    const intervals = [];
    for (let i = 0; i < timestamps.length - 1; i++) {
      intervals.push(timestamps[i] - timestamps[i + 1]);
    }
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    
    // If average interval is less than 2 seconds, likely automated
    if (avgInterval < 2000) {
      score += 30;
    }
  }

  return Math.min(score, 100); // Cap at 100
}

/**
 * Check if IP is currently blocked
 */
export async function isIPBlocked(ipAddress: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db.execute(sql`
    SELECT COUNT(*) as count
    FROM blocked_ips
    WHERE ip_address = ${ipAddress}
    AND (expires_at IS NULL OR expires_at > NOW())
  `);

  return ((result[0] as any)?.count || 0) > 0;
}

/**
 * Block IP address for specified duration
 * Default: 24 hours
 */
export async function blockIP(
  ipAddress: string,
  reason: string,
  durationHours: number = 24
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + durationHours);

  await db.execute(sql`
    INSERT INTO blocked_ips (ip_address, reason, blocked_at, expires_at)
    VALUES (${ipAddress}, ${reason}, NOW(), ${expiresAt})
    ON DUPLICATE KEY UPDATE
      reason = ${reason},
      blocked_at = NOW(),
      expires_at = ${expiresAt}
  `);

  console.log(`[Anti-Hotlink] 🚫 Blocked IP ${ipAddress} for ${durationHours}h. Reason: ${reason}`);
}

/**
 * Log suspicious activity to database
 */
export async function logSuspiciousActivity(
  ipAddress: string,
  activityType: string,
  details: string,
  suspicionScore: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.execute(sql`
    INSERT INTO suspicious_activities (ip_address, activity_type, details, suspicion_score, detected_at)
    VALUES (${ipAddress}, ${activityType}, ${details}, ${suspicionScore}, NOW())
  `);

  // Alert if score is high
  if (suspicionScore >= SCRAPING_THRESHOLDS.SUSPICION_SCORE_ALERT) {
    console.warn(`[Anti-Hotlink] ⚠️  ALERT: Suspicious activity from ${ipAddress}. Score: ${suspicionScore}. Type: ${activityType}`);
  }

  // Auto-block if score is very high
  if (suspicionScore >= SCRAPING_THRESHOLDS.SUSPICION_SCORE_BLOCK) {
    await blockIP(ipAddress, `Auto-blocked: High suspicion score (${suspicionScore})`, 24);
  }
}

/**
 * Detect if user agent is a known bot
 */
export function isBotUserAgent(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some(bot => ua.includes(bot));
}

/**
 * Check all anti-hotlink protections for a download request
 * Returns { allowed: boolean, reason?: string }
 */
export async function checkDownloadProtection(
  ipAddress: string,
  referer: string | undefined,
  userAgent: string
): Promise<{ allowed: boolean; reason?: string }> {
  // Check if IP is blocked
  if (await isIPBlocked(ipAddress)) {
    await logSuspiciousActivity(
      ipAddress,
      "blocked_ip_attempt",
      "Attempted access from blocked IP",
      100
    );
    return {
      allowed: false,
      reason: "Your IP has been temporarily blocked due to suspicious activity",
    };
  }

  // Validate referer
  if (!validateReferer(referer)) {
    await logSuspiciousActivity(
      ipAddress,
      "hotlink_attempt",
      `Invalid referer: ${referer || "none"}`,
      30
    );
    return {
      allowed: false,
      reason: "Direct linking from external sites is not permitted",
    };
  }

  // Check for bot user agent
  if (isBotUserAgent(userAgent)) {
    await logSuspiciousActivity(
      ipAddress,
      "bot_detected",
      `Bot user agent: ${userAgent}`,
      50
    );
    return {
      allowed: false,
      reason: "Automated access is not permitted",
    };
  }

  // Calculate suspicion score
  const score = await calculateSuspicionScore(ipAddress);
  if (score >= SCRAPING_THRESHOLDS.SUSPICION_SCORE_BLOCK) {
    await logSuspiciousActivity(
      ipAddress,
      "high_activity",
      `Suspicion score: ${score}`,
      score
    );
    return {
      allowed: false,
      reason: "Your activity has been flagged as suspicious. Please try again later.",
    };
  }

  // All checks passed
  return { allowed: true };
}
