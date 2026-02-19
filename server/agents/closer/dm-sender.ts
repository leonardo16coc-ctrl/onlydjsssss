/**
 * DM Sender for Agent Closer
 * Handles sending messages with rate limiting and error handling
 * 
 * IMPORTANT: This is a SIMULATION for educational purposes.
 * In production, you MUST use official APIs and respect platform ToS.
 */

import { db } from '../db-helper';
import { Platform, SendMessageResult, CloserConfig } from './types';
import { delay, randomDelay } from '../utils';

/**
 * Check if we can send a message (rate limiting)
 */
export async function canSendMessage(platform: Platform): Promise<{
  canSend: boolean;
  reason?: string;
  retryAfter?: number;
}> {
  const config = await db.queryOne<CloserConfig>(
    'SELECT * FROM closer_config WHERE platform = ?',
    [platform]
  );
  
  if (!config) {
    return {
      canSend: false,
      reason: 'Platform not configured'
    };
  }
  
  if (!config.enabled) {
    return {
      canSend: false,
      reason: 'Platform disabled'
    };
  }
  
  if (config.accountStatus !== 'active') {
    return {
      canSend: false,
      reason: `Account status: ${config.accountStatus}`
    };
  }
  
  // Check hourly limit
  if (config.messagesSentThisHour >= config.hourlyLimit) {
    return {
      canSend: false,
      reason: 'Hourly limit reached',
      retryAfter: 3600 // 1 hour in seconds
    };
  }
  
  // Check daily limit
  if (config.messagesSentToday >= config.dailyLimit) {
    return {
      canSend: false,
      reason: 'Daily limit reached',
      retryAfter: 86400 // 24 hours in seconds
    };
  }
  
  // Check minimum delay between messages (anti-spam)
  if (config.lastMessageSentAt) {
    const timeSinceLastMessage = Date.now() - new Date(config.lastMessageSentAt).getTime();
    const minDelay = 60000; // 1 minute minimum
    
    if (timeSinceLastMessage < minDelay) {
      return {
        canSend: false,
        reason: 'Too soon since last message',
        retryAfter: Math.ceil((minDelay - timeSinceLastMessage) / 1000)
      };
    }
  }
  
  return { canSend: true };
}

/**
 * Send a DM (SIMULATION - replace with real API calls)
 */
export async function sendDM(
  platform: Platform,
  username: string,
  message: string,
  djId: number,
  campaignId: number
): Promise<SendMessageResult> {
  // Check rate limits
  const rateLimitCheck = await canSendMessage(platform);
  
  if (!rateLimitCheck.canSend) {
    return {
      success: false,
      error: rateLimitCheck.reason,
      retryAfter: rateLimitCheck.retryAfter
    };
  }
  
  try {
    // SIMULATION: In production, this would call Instagram/SoundCloud API
    console.log(`[SIMULATION] Sending ${platform} DM to @${username}`);
    console.log(`Message: ${message.substring(0, 100)}...`);
    
    // Simulate network delay
    await delay(randomDelay(1000, 3000));
    
    // Simulate 95% success rate
    const success = Math.random() > 0.05;
    
    if (!success) {
      throw new Error('Simulated send failure');
    }
    
    // Save message to database
    const result = await db.query(
      `INSERT INTO outreach_messages (
        campaignId, djId, platform, messageType, messageContent, 
        status, sentAt
      ) VALUES (?, ?, ?, 'initial', ?, 'sent', NOW())`,
      [campaignId, djId, platform, message]
    );
    
    const messageId = (result as any).insertId;
    
    // Update rate limit counters
    await updateRateLimitCounters(platform);
    
    // Update lead state
    await updateLeadState(djId, campaignId, 'contacted');
    
    // Update campaign stats
    await db.query(
      'UPDATE outreach_campaigns SET contacted = contacted + 1 WHERE id = ?',
      [campaignId]
    );
    
    console.log(`[SUCCESS] Message sent to @${username} (messageId: ${messageId})`);
    
    return {
      success: true,
      messageId
    };
    
  } catch (error: any) {
    console.error(`[ERROR] Failed to send message to @${username}:`, error.message);
    
    // Log failed message
    await db.query(
      `INSERT INTO outreach_messages (
        campaignId, djId, platform, messageType, messageContent, 
        status, errorMessage
      ) VALUES (?, ?, ?, 'initial', ?, 'failed', ?)`,
      [campaignId, djId, platform, message, error.message]
    );
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Update rate limit counters after sending a message
 */
async function updateRateLimitCounters(platform: Platform): Promise<void> {
  const now = new Date();
  const config = await db.queryOne<CloserConfig>(
    'SELECT * FROM closer_config WHERE platform = ?',
    [platform]
  );
  
  if (!config) return;
  
  // Check if we need to reset hourly counter
  const lastReset = new Date(config.lastResetAt);
  const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceReset >= 1) {
    // Reset hourly counter
    await db.query(
      `UPDATE closer_config SET 
        messagesSentThisHour = 1,
        messagesSentToday = messagesSentToday + 1,
        lastMessageSentAt = NOW(),
        lastResetAt = NOW()
      WHERE platform = ?`,
      [platform]
    );
  } else {
    // Increment counters
    await db.query(
      `UPDATE closer_config SET 
        messagesSentThisHour = messagesSentThisHour + 1,
        messagesSentToday = messagesSentToday + 1,
        lastMessageSentAt = NOW()
      WHERE platform = ?`,
      [platform]
    );
  }
  
  // Check if we need to reset daily counter (at midnight)
  const daysSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSinceReset >= 1) {
    await db.query(
      'UPDATE closer_config SET messagesSentToday = 0 WHERE platform = ?',
      [platform]
    );
  }
}

/**
 * Update lead state after action
 */
async function updateLeadState(
  djId: number,
  campaignId: number,
  newState: string
): Promise<void> {
  const existing = await db.queryOne(
    'SELECT * FROM lead_states WHERE djId = ? AND campaignId = ?',
    [djId, campaignId]
  );
  
  if (existing) {
    await db.query(
      `UPDATE lead_states SET 
        previousState = currentState,
        currentState = ?,
        lastContactedAt = NOW(),
        totalMessagesSent = totalMessagesSent + 1,
        updatedAt = NOW()
      WHERE djId = ? AND campaignId = ?`,
      [newState, djId, campaignId]
    );
  } else {
    await db.query(
      `INSERT INTO lead_states (
        djId, campaignId, currentState, lastContactedAt, totalMessagesSent
      ) VALUES (?, ?, ?, NOW(), 1)`,
      [djId, campaignId, newState]
    );
  }
}

/**
 * Send batch messages with proper rate limiting
 */
export async function sendBatchMessages(
  messages: Array<{
    platform: Platform;
    username: string;
    message: string;
    djId: number;
    campaignId: number;
  }>
): Promise<SendMessageResult[]> {
  const results: SendMessageResult[] = [];
  
  for (const msg of messages) {
    const result = await sendDM(
      msg.platform,
      msg.username,
      msg.message,
      msg.djId,
      msg.campaignId
    );
    
    results.push(result);
    
    // Wait between messages to avoid rate limiting
    if (result.success) {
      await delay(randomDelay(60000, 120000)); // 1-2 minutes between messages
    } else if (result.retryAfter) {
      console.log(`Rate limited. Waiting ${result.retryAfter} seconds...`);
      await delay(result.retryAfter * 1000);
    }
  }
  
  return results;
}

/**
 * Initialize platform configuration
 */
export async function initializePlatformConfig(
  platform: Platform,
  config: Partial<CloserConfig>
): Promise<void> {
  const existing = await db.queryOne(
    'SELECT * FROM closer_config WHERE platform = ?',
    [platform]
  );
  
  if (existing) {
    await db.query(
      `UPDATE closer_config SET 
        enabled = ?,
        accountUsername = ?,
        dailyLimit = ?,
        hourlyLimit = ?
      WHERE platform = ?`,
      [
        config.enabled ?? existing.enabled,
        config.accountUsername ?? existing.accountUsername,
        config.dailyLimit ?? existing.dailyLimit,
        config.hourlyLimit ?? existing.hourlyLimit,
        platform
      ]
    );
  } else {
    await db.query(
      `INSERT INTO closer_config (
        platform, enabled, accountUsername, dailyLimit, hourlyLimit
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        platform,
        config.enabled ?? false,
        config.accountUsername ?? null,
        config.dailyLimit ?? 50,
        config.hourlyLimit ?? 10
      ]
    );
  }
}

/**
 * Get platform statistics
 */
export async function getPlatformStats(platform: Platform): Promise<{
  messagesSentToday: number;
  messagesRemaining: number;
  accountStatus: string;
  lastMessageSentAt?: Date;
}> {
  const config = await db.queryOne<CloserConfig>(
    'SELECT * FROM closer_config WHERE platform = ?',
    [platform]
  );
  
  if (!config) {
    return {
      messagesSentToday: 0,
      messagesRemaining: 0,
      accountStatus: 'not_configured'
    };
  }
  
  return {
    messagesSentToday: config.messagesSentToday,
    messagesRemaining: config.dailyLimit - config.messagesSentToday,
    accountStatus: config.accountStatus,
    lastMessageSentAt: config.lastMessageSentAt
  };
}
