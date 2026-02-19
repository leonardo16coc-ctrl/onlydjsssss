/**
 * Type definitions for Agent Closer
 */

export type MessageType = 'initial' | 'follow_up_1' | 'follow_up_2' | 'custom';
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'responded';
export type LeadState = 'new' | 'contacted' | 'follow_up_1_sent' | 'follow_up_2_sent' | 'responded' | 'interested' | 'converted' | 'not_interested' | 'no_response' | 'dormant';
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';
export type Platform = 'instagram' | 'soundcloud';

export interface OutreachCampaign {
  id: number;
  name: string;
  description?: string;
  platform: 'instagram' | 'soundcloud' | 'both';
  targetGenre?: string;
  minTalentScore: number;
  messageTemplate?: string;
  status: CampaignStatus;
  totalTargets: number;
  contacted: number;
  responded: number;
  converted: number;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface OutreachMessage {
  id: number;
  campaignId: number;
  djId: number;
  platform: Platform;
  messageType: MessageType;
  messageContent: string;
  status: MessageStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  respondedAt?: Date;
  responseContent?: string;
  errorMessage?: string;
  retryCount: number;
  scheduledFor?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadStateRecord {
  id: number;
  djId: number;
  campaignId: number;
  currentState: LeadState;
  previousState?: LeadState;
  lastContactedAt?: Date;
  lastRespondedAt?: Date;
  totalMessagesSent: number;
  totalResponsesReceived: number;
  conversionDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CloserConfig {
  id: number;
  platform: Platform;
  enabled: boolean;
  accountUsername?: string;
  accountStatus: 'active' | 'suspended' | 'rate_limited' | 'error';
  dailyLimit: number;
  hourlyLimit: number;
  messagesSentToday: number;
  messagesSentThisHour: number;
  lastMessageSentAt?: Date;
  lastResetAt: Date;
  config?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageGenerationContext {
  djName: string;
  djUsername: string;
  platform: Platform;
  primaryGenre: string;
  talentScore: number;
  instagramFollowers?: number;
  soundcloudFollowers?: number;
  instagramEngagementRate?: number;
  soundcloudEngagementRate?: number;
  bio?: string;
  messageType: MessageType;
  previousMessages?: string[];
}

export interface GeneratedMessage {
  content: string;
  subject?: string;
  tone: 'professional' | 'friendly' | 'casual';
  confidence: number;
}

export interface SendMessageResult {
  success: boolean;
  messageId?: number;
  error?: string;
  retryAfter?: number;
}

export interface CampaignStats {
  totalTargets: number;
  contacted: number;
  responded: number;
  converted: number;
  responseRate: number;
  conversionRate: number;
  avgResponseTime: number;
  messagesSentToday: number;
  messagesRemaining: number;
}
