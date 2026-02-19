/**
 * Agent Closer - Main Module
 * Automates outreach to discovered DJs
 */

import { db } from '../db-helper';
import { generatePersonalizedMessage } from './message-generator';
import { sendDM, initializePlatformConfig, getPlatformStats } from './dm-sender';
import { runFollowUpCycle, getFollowUpStats } from './follow-up';
import { Platform, OutreachCampaign } from './types';

/**
 * Create a new outreach campaign
 */
export async function createCampaign(params: {
  name: string;
  description?: string;
  platform: 'instagram' | 'soundcloud' | 'both';
  targetGenre?: string;
  minTalentScore?: number;
}): Promise<number> {
  const result = await db.query(
    `INSERT INTO outreach_campaigns (
      name, description, platform, targetGenre, minTalentScore, status
    ) VALUES (?, ?, ?, ?, ?, 'draft')`,
    [
      params.name,
      params.description || null,
      params.platform,
      params.targetGenre || null,
      params.minTalentScore || 60
    ]
  );
  
  const campaignId = (result as any).insertId;
  
  console.log(`✅ Created campaign: ${params.name} (ID: ${campaignId})`);
  
  return campaignId;
}

/**
 * Start a campaign - send initial messages to qualified DJs
 */
export async function startCampaign(campaignId: number): Promise<{
  targeted: number;
  sent: number;
  failed: number;
}> {
  console.log(`🚀 Starting campaign ${campaignId}...`);
  
  // Get campaign details
  const campaign = await db.queryOne<OutreachCampaign>(
    'SELECT * FROM outreach_campaigns WHERE id = ?',
    [campaignId]
  );
  
  if (!campaign) {
    throw new Error(`Campaign ${campaignId} not found`);
  }
  
  if (campaign.status !== 'draft') {
    throw new Error(`Campaign must be in draft status to start`);
  }
  
  // Get qualified DJs
  const djs = await getQualifiedDJs(campaign);
  
  console.log(`Found ${djs.length} qualified DJs`);
  
  const stats = {
    targeted: djs.length,
    sent: 0,
    failed: 0
  };
  
  // Update campaign status
  await db.query(
    'UPDATE outreach_campaigns SET status = ?, startedAt = NOW(), totalTargets = ? WHERE id = ?',
    ['active', djs.length, campaignId]
  );
  
  // Send initial messages
  for (const dj of djs) {
    try {
      const platform: Platform = dj.instagramUsername ? 'instagram' : 'soundcloud';
      const username = dj.instagramUsername || dj.soundcloudUsername;
      
      // Generate personalized message
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
        messageType: 'initial'
      });
      
      // Send DM
      const result = await sendDM(
        platform,
        username,
        message.content,
        dj.id,
        campaignId
      );
      
      if (result.success) {
        stats.sent++;
        console.log(`✅ Sent message to @${username}`);
      } else {
        stats.failed++;
        console.log(`❌ Failed to send to @${username}: ${result.error}`);
      }
      
      // Small delay between messages
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      stats.failed++;
      console.error(`Error sending to DJ ${dj.id}:`, error);
    }
  }
  
  console.log(`
📊 Campaign Results:
   Targeted: ${stats.targeted}
   Sent: ${stats.sent}
   Failed: ${stats.failed}
  `);
  
  return stats;
}

/**
 * Get qualified DJs for a campaign
 */
async function getQualifiedDJs(campaign: OutreachCampaign): Promise<any[]> {
  let query = `
    SELECT * FROM discovered_djs
    WHERE talentScore >= ?
    AND discoveryStatus IN ('qualified', 'new')
  `;
  
  const params: any[] = [campaign.minTalentScore];
  
  // Filter by genre
  if (campaign.targetGenre) {
    query += ' AND primaryGenre = ?';
    params.push(campaign.targetGenre);
  }
  
  // Filter by platform
  if (campaign.platform === 'instagram') {
    query += ' AND instagramUsername IS NOT NULL';
  } else if (campaign.platform === 'soundcloud') {
    query += ' AND soundcloudUsername IS NOT NULL';
  }
  
  // Exclude DJs already contacted in this campaign
  query += `
    AND id NOT IN (
      SELECT djId FROM outreach_messages WHERE campaignId = ?
    )
  `;
  params.push(campaign.id);
  
  query += ' LIMIT 50'; // Safety limit
  
  const djs = await db.query(query, params);
  
  return djs;
}

/**
 * Get campaign statistics
 */
export async function getCampaignStats(campaignId: number) {
  const campaign = await db.queryOne<OutreachCampaign>(
    'SELECT * FROM outreach_campaigns WHERE id = ?',
    [campaignId]
  );
  
  if (!campaign) {
    throw new Error(`Campaign ${campaignId} not found`);
  }
  
  const followUpStats = await getFollowUpStats(campaignId);
  
  const responseRate = campaign.contacted > 0 
    ? (campaign.responded / campaign.contacted) * 100 
    : 0;
    
  const conversionRate = campaign.contacted > 0 
    ? (campaign.converted / campaign.contacted) * 100 
    : 0;
  
  return {
    ...campaign,
    responseRate,
    conversionRate,
    followUpStats
  };
}

/**
 * Pause a campaign
 */
export async function pauseCampaign(campaignId: number): Promise<void> {
  await db.query(
    'UPDATE outreach_campaigns SET status = ? WHERE id = ?',
    ['paused', campaignId]
  );
  
  console.log(`⏸️ Paused campaign ${campaignId}`);
}

/**
 * Resume a campaign
 */
export async function resumeCampaign(campaignId: number): Promise<void> {
  await db.query(
    'UPDATE outreach_campaigns SET status = ? WHERE id = ?',
    ['active', campaignId]
  );
  
  console.log(`▶️ Resumed campaign ${campaignId}`);
}

/**
 * Complete a campaign
 */
export async function completeCampaign(campaignId: number): Promise<void> {
  await db.query(
    'UPDATE outreach_campaigns SET status = ?, completedAt = NOW() WHERE id = ?',
    ['completed', campaignId]
  );
  
  console.log(`✅ Completed campaign ${campaignId}`);
}

/**
 * Get all campaigns
 */
export async function getAllCampaigns(): Promise<OutreachCampaign[]> {
  const campaigns = await db.query<OutreachCampaign>(
    'SELECT * FROM outreach_campaigns ORDER BY createdAt DESC'
  );
  
  return campaigns;
}

/**
 * Initialize Agent Closer
 */
export async function initializeAgentCloser(): Promise<void> {
  console.log('🤖 Initializing Agent Closer...');
  
  // Initialize platform configs
  await initializePlatformConfig('instagram', {
    enabled: false,
    dailyLimit: 50,
    hourlyLimit: 10
  });
  
  await initializePlatformConfig('soundcloud', {
    enabled: false,
    dailyLimit: 50,
    hourlyLimit: 10
  });
  
  console.log('✅ Agent Closer initialized');
}

/**
 * Run Agent Closer cycle (should be called daily)
 */
export async function runAgentCloserCycle(): Promise<void> {
  console.log('🤖 Running Agent Closer cycle...');
  
  try {
    // Run follow-up cycle
    await runFollowUpCycle();
    
    console.log('✅ Agent Closer cycle completed');
  } catch (error) {
    console.error('❌ Agent Closer cycle failed:', error);
    throw error;
  }
}

// Export all functions
export * from './types';
export * from './message-generator';
export * from './dm-sender';
export * from './follow-up';
