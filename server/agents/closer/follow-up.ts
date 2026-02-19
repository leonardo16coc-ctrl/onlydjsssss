/**
 * Follow-up System for Agent Closer
 * Automatically sends follow-up messages based on lead state
 */

import { db } from '../db-helper';
import { generatePersonalizedMessage } from './message-generator';
import { sendDM } from './dm-sender';
import { MessageType, LeadState } from './types';

/**
 * Follow-up sequence configuration
 * Day 0: Initial message
 * Day 3: First follow-up
 * Day 7: Final follow-up
 */
const FOLLOW_UP_SEQUENCE = [
  { day: 3, messageType: 'follow_up_1' as MessageType, nextState: 'follow_up_1_sent' as LeadState },
  { day: 7, messageType: 'follow_up_2' as MessageType, nextState: 'follow_up_2_sent' as LeadState }
];

/**
 * Check and process pending follow-ups
 */
export async function processFollowUps(): Promise<{
  processed: number;
  sent: number;
  failed: number;
}> {
  console.log('🔄 Processing follow-ups...');
  
  const stats = {
    processed: 0,
    sent: 0,
    failed: 0
  };
  
  // Get all leads that need follow-up
  const pendingFollowUps = await getPendingFollowUps();
  
  console.log(`Found ${pendingFollowUps.length} leads needing follow-up`);
  
  for (const lead of pendingFollowUps) {
    try {
      stats.processed++;
      
      // Determine which follow-up to send
      const followUpType = determineFollowUpType(lead);
      
      if (!followUpType) {
        console.log(`No follow-up needed for DJ ${lead.djId}`);
        continue;
      }
      
      // Get DJ details
      const dj = await db.queryOne<any>(
        'SELECT * FROM discovered_djs WHERE id = ?',
        [lead.djId]
      );
      
      if (!dj) {
        console.log(`DJ ${lead.djId} not found`);
        continue;
      }
      
      // Get previous messages for context
      const previousMessages = await db.query<any>(
        `SELECT messageContent FROM outreach_messages 
         WHERE djId = ? AND campaignId = ? AND status = 'sent'
         ORDER BY sentAt ASC`,
        [lead.djId, lead.campaignId]
      );
      
      // Generate follow-up message
      const platform = dj.instagramUsername ? 'instagram' : 'soundcloud';
      const username = dj.instagramUsername || dj.soundcloudUsername;
      
      const message = await generatePersonalizedMessage({
        djName: dj.fullName || username,
        djUsername: username,
        platform,
        primaryGenre: dj.primaryGenre,
        talentScore: dj.talentScore,
        instagramFollowers: dj.instagramFollowers,
        soundcloudFollowers: dj.soundcloudFollowers,
        instagramEngagementRate: dj.instagramEngagementRate,
        soundcloudEngagementRate: dj.soundcloudEngagementRate,
        bio: dj.bio,
        messageType: followUpType.messageType,
        previousMessages: previousMessages.map(m => m.messageContent)
      });
      
      // Send follow-up
      const result = await sendDM(
        platform,
        username,
        message.content,
        lead.djId,
        lead.campaignId
      );
      
      if (result.success) {
        stats.sent++;
        
        // Update message type in database
        await db.query(
          'UPDATE outreach_messages SET messageType = ? WHERE id = ?',
          [followUpType.messageType, result.messageId]
        );
        
        // Update lead state
        await db.query(
          `UPDATE lead_states SET 
            currentState = ?,
            previousState = currentState,
            lastContactedAt = NOW(),
            totalMessagesSent = totalMessagesSent + 1
          WHERE djId = ? AND campaignId = ?`,
          [followUpType.nextState, lead.djId, lead.campaignId]
        );
        
        console.log(`✅ Sent ${followUpType.messageType} to @${username}`);
      } else {
        stats.failed++;
        console.log(`❌ Failed to send follow-up to @${username}: ${result.error}`);
      }
      
    } catch (error) {
      stats.failed++;
      console.error(`Error processing follow-up for lead ${lead.djId}:`, error);
    }
  }
  
  console.log(`
📊 Follow-up Results:
   Processed: ${stats.processed}
   Sent: ${stats.sent}
   Failed: ${stats.failed}
  `);
  
  return stats;
}

/**
 * Get leads that need follow-up
 */
async function getPendingFollowUps(): Promise<Array<{
  djId: number;
  campaignId: number;
  currentState: LeadState;
  lastContactedAt: Date;
  daysSinceContact: number;
}>> {
  const leads = await db.query<any>(`
    SELECT 
      djId,
      campaignId,
      currentState,
      lastContactedAt,
      DATEDIFF(NOW(), lastContactedAt) as daysSinceContact
    FROM lead_states
    WHERE currentState IN ('contacted', 'follow_up_1_sent')
    AND lastContactedAt IS NOT NULL
    AND (
      (currentState = 'contacted' AND DATEDIFF(NOW(), lastContactedAt) >= 3)
      OR
      (currentState = 'follow_up_1_sent' AND DATEDIFF(NOW(), lastContactedAt) >= 4)
    )
  `);
  
  return leads;
}

/**
 * Determine which follow-up to send based on lead state
 */
function determineFollowUpType(lead: {
  currentState: LeadState;
  daysSinceContact: number;
}): { messageType: MessageType; nextState: LeadState } | null {
  if (lead.currentState === 'contacted' && lead.daysSinceContact >= 3) {
    return {
      messageType: 'follow_up_1',
      nextState: 'follow_up_1_sent'
    };
  }
  
  if (lead.currentState === 'follow_up_1_sent' && lead.daysSinceContact >= 4) {
    return {
      messageType: 'follow_up_2',
      nextState: 'follow_up_2_sent'
    };
  }
  
  return null;
}

/**
 * Mark leads as dormant if no response after final follow-up
 */
export async function markDormantLeads(): Promise<number> {
  const result = await db.query(`
    UPDATE lead_states SET 
      currentState = 'dormant',
      previousState = currentState
    WHERE currentState = 'follow_up_2_sent'
    AND DATEDIFF(NOW(), lastContactedAt) >= 7
    AND lastRespondedAt IS NULL
  `);
  
  const affected = (result as any).affectedRows || 0;
  
  if (affected > 0) {
    console.log(`Marked ${affected} leads as dormant`);
  }
  
  return affected;
}

/**
 * Detect and process responses (SIMULATION)
 * In production, this would integrate with platform APIs or webhooks
 */
export async function detectResponses(): Promise<{
  detected: number;
  processed: number;
}> {
  console.log('🔍 Detecting responses...');
  
  // SIMULATION: Randomly mark some sent messages as responded
  // In production, this would check actual DM inboxes
  const sentMessages = await db.query<any>(`
    SELECT * FROM outreach_messages 
    WHERE status = 'sent'
    AND respondedAt IS NULL
    AND DATEDIFF(NOW(), sentAt) <= 7
    ORDER BY RAND()
    LIMIT 5
  `);
  
  let detected = 0;
  let processed = 0;
  
  for (const message of sentMessages) {
    // Simulate 10% response rate
    if (Math.random() < 0.1) {
      detected++;
      
      try {
        // Mark message as responded
        await db.query(
          `UPDATE outreach_messages SET 
            status = 'responded',
            respondedAt = NOW(),
            responseContent = 'Simulated response'
          WHERE id = ?`,
          [message.id]
        );
        
        // Update lead state
        await db.query(
          `UPDATE lead_states SET 
            currentState = 'responded',
            previousState = currentState,
            lastRespondedAt = NOW(),
            totalResponsesReceived = totalResponsesReceived + 1
          WHERE djId = ? AND campaignId = ?`,
          [message.djId, message.campaignId]
        );
        
        // Update campaign stats
        await db.query(
          'UPDATE outreach_campaigns SET responded = responded + 1 WHERE id = ?',
          [message.campaignId]
        );
        
        // Update DJ discovery status
        await db.query(
          'UPDATE discovered_djs SET discoveryStatus = ? WHERE id = ?',
          ['responded', message.djId]
        );
        
        processed++;
        
        console.log(`✅ Detected response from DJ ${message.djId}`);
      } catch (error) {
        console.error(`Error processing response for message ${message.id}:`, error);
      }
    }
  }
  
  console.log(`
📊 Response Detection:
   Detected: ${detected}
   Processed: ${processed}
  `);
  
  return { detected, processed };
}

/**
 * Run full follow-up cycle
 * Should be called periodically (e.g., daily via cron)
 */
export async function runFollowUpCycle(): Promise<void> {
  console.log('🚀 Starting follow-up cycle...');
  
  try {
    // 1. Process pending follow-ups
    await processFollowUps();
    
    // 2. Detect responses
    await detectResponses();
    
    // 3. Mark dormant leads
    await markDormantLeads();
    
    console.log('✅ Follow-up cycle completed');
  } catch (error) {
    console.error('❌ Follow-up cycle failed:', error);
    throw error;
  }
}

/**
 * Get follow-up statistics for a campaign
 */
export async function getFollowUpStats(campaignId: number): Promise<{
  totalLeads: number;
  contacted: number;
  followUp1Sent: number;
  followUp2Sent: number;
  responded: number;
  dormant: number;
  conversionRate: number;
}> {
  const stats = await db.query<any>(`
    SELECT 
      COUNT(*) as totalLeads,
      SUM(CASE WHEN currentState IN ('contacted', 'follow_up_1_sent', 'follow_up_2_sent', 'responded', 'interested', 'converted') THEN 1 ELSE 0 END) as contacted,
      SUM(CASE WHEN currentState IN ('follow_up_1_sent', 'follow_up_2_sent', 'responded', 'interested', 'converted') THEN 1 ELSE 0 END) as followUp1Sent,
      SUM(CASE WHEN currentState IN ('follow_up_2_sent', 'responded', 'interested', 'converted') THEN 1 ELSE 0 END) as followUp2Sent,
      SUM(CASE WHEN currentState IN ('responded', 'interested', 'converted') THEN 1 ELSE 0 END) as responded,
      SUM(CASE WHEN currentState = 'dormant' THEN 1 ELSE 0 END) as dormant
    FROM lead_states
    WHERE campaignId = ?
  `, [campaignId]);
  
  const result = stats[0] || {
    totalLeads: 0,
    contacted: 0,
    followUp1Sent: 0,
    followUp2Sent: 0,
    responded: 0,
    dormant: 0
  };
  
  const conversionRate = result.contacted > 0 
    ? (result.responded / result.contacted) * 100 
    : 0;
  
  return {
    ...result,
    conversionRate
  };
}
