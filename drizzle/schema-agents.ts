import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, bigint, index, json, uniqueIndex } from "drizzle-orm/mysql-core";

/**
 * AGENT SCOUT - Discovered DJs Table
 * Stores all DJs discovered by Agent Scout with their metrics and scores
 */
export const discoveredDjs = mysqlTable("discovered_djs", {
  id: int("id").autoincrement().primaryKey(),
  
  // Identification
  instagramUsername: varchar("instagramUsername", { length: 255 }),
  soundcloudUsername: varchar("soundcloudUsername", { length: 255 }),
  fullName: varchar("fullName", { length: 255 }),
  email: varchar("email", { length: 255 }),
  
  // Instagram Metrics
  instagramFollowers: int("instagramFollowers"),
  instagramPostsCount: int("instagramPostsCount"),
  instagramAvgLikes: decimal("instagramAvgLikes", { precision: 10, scale: 2 }),
  instagramAvgComments: decimal("instagramAvgComments", { precision: 10, scale: 2 }),
  instagramEngagementRate: decimal("instagramEngagementRate", { precision: 5, scale: 4 }),
  instagramPostsPerWeek: decimal("instagramPostsPerWeek", { precision: 5, scale: 2 }),
  
  // SoundCloud Metrics
  soundcloudFollowers: int("soundcloudFollowers"),
  soundcloudTracksCount: int("soundcloudTracksCount"),
  soundcloudTotalPlays: bigint("soundcloudTotalPlays", { mode: "number" }),
  soundcloudAvgLikes: decimal("soundcloudAvgLikes", { precision: 10, scale: 2 }),
  soundcloudAvgReposts: decimal("soundcloudAvgReposts", { precision: 10, scale: 2 }),
  soundcloudEngagementRate: decimal("soundcloudEngagementRate", { precision: 5, scale: 4 }),
  soundcloudUploadsPerMonth: decimal("soundcloudUploadsPerMonth", { precision: 5, scale: 2 }),
  
  // Scoring (0-100 scale)
  talentScore: decimal("talentScore", { precision: 5, scale: 2 }),
  engagementScore: decimal("engagementScore", { precision: 5, scale: 2 }),
  growthScore: decimal("growthScore", { precision: 5, scale: 2 }),
  consistencyScore: decimal("consistencyScore", { precision: 5, scale: 2 }),
  reachScore: decimal("reachScore", { precision: 5, scale: 2 }),
  genreMatchScore: decimal("genreMatchScore", { precision: 5, scale: 2 }),
  
  // Classification
  primaryGenre: varchar("primaryGenre", { length: 100 }),
  secondaryGenres: json("secondaryGenres").$type<string[]>(), // Array of genres
  
  // Estado y tracking
  discoveryStatus: mysqlEnum("discoveryStatus", [
    "discovered",
    "qualified", 
    "contacted",
    "responded",
    "converted",
    "rejected",
    "dormant"
  ]).default("discovered").notNull(),
  discoveryDate: timestamp("discoveryDate").defaultNow().notNull(),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
  lastScraped: timestamp("lastScraped"),
  
  // Metadatos
  bio: text("bio"),
  profileImageUrl: text("profileImageUrl"),
  instagramUrl: text("instagramUrl"),
  soundcloudUrl: text("soundcloudUrl"),
  
  // Notes from AI analysis
  aiNotes: text("aiNotes"), // AI-generated insights about the DJ
  
}, (table) => ({
  // Unique constraint: at least one username must be present and unique
  usernamesIdx: uniqueIndex("usernames_idx").on(table.instagramUsername, table.soundcloudUsername),
  talentScoreIdx: index("talent_score_idx").on(table.talentScore),
  discoveryStatusIdx: index("discovery_status_idx").on(table.discoveryStatus),
  primaryGenreIdx: index("primary_genre_idx").on(table.primaryGenre),
  discoveryDateIdx: index("discovery_date_idx").on(table.discoveryDate),
}));

export type DiscoveredDj = typeof discoveredDjs.$inferSelect;
export type InsertDiscoveredDj = typeof discoveredDjs.$inferInsert;

/**
 * AGENT SCOUT - Historical Metrics
 * Stores snapshots of DJ metrics over time for growth analysis
 */
export const scoutMetrics = mysqlTable("scout_metrics", {
  id: int("id").autoincrement().primaryKey(),
  djId: int("djId").notNull(), // FK to discovered_djs
  
  // Snapshot de métricas
  instagramFollowers: int("instagramFollowers"),
  soundcloudFollowers: int("soundcloudFollowers"),
  instagramEngagementRate: decimal("instagramEngagementRate", { precision: 5, scale: 4 }),
  soundcloudEngagementRate: decimal("soundcloudEngagementRate", { precision: 5, scale: 4 }),
  
  // Timestamp
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
}, (table) => ({
  djRecordedIdx: index("dj_recorded_idx").on(table.djId, table.recordedAt),
}));

export type ScoutMetric = typeof scoutMetrics.$inferSelect;
export type InsertScoutMetric = typeof scoutMetrics.$inferInsert;

/**
 * AGENT CLOSER - Outreach Campaigns
 * Tracks all outreach messages sent to DJs
 */
export const outreachCampaigns = mysqlTable("outreach_campaigns", {
  id: int("id").autoincrement().primaryKey(),
  djId: int("djId").notNull(), // FK to discovered_djs
  
  // Campaign details
  campaignType: mysqlEnum("campaignType", [
    "cold_outreach",
    "follow_up_1", 
    "follow_up_2",
    "re_engagement"
  ]).default("cold_outreach").notNull(),
  platform: mysqlEnum("platform", ["instagram", "soundcloud"]).notNull(),
  
  // Message content
  messageText: text("messageText").notNull(),
  messageVariant: varchar("messageVariant", { length: 50 }), // For A/B testing
  
  // Status tracking
  status: mysqlEnum("status", [
    "pending",
    "sent", 
    "delivered",
    "read",
    "responded",
    "failed"
  ]).default("pending").notNull(),
  sentAt: timestamp("sentAt"),
  deliveredAt: timestamp("deliveredAt"),
  readAt: timestamp("readAt"),
  respondedAt: timestamp("respondedAt"),
  
  // Response handling
  responseText: text("responseText"),
  responseSentiment: mysqlEnum("responseSentiment", ["positive", "negative", "neutral"]),
  
  // Conversion tracking
  converted: boolean("converted").default(false).notNull(),
  convertedAt: timestamp("convertedAt"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  djStatusIdx: index("dj_status_idx").on(table.djId, table.status),
  sentAtIdx: index("sent_at_idx").on(table.sentAt),
  campaignTypeIdx: index("campaign_type_idx").on(table.campaignType),
}));

export type OutreachCampaign = typeof outreachCampaigns.$inferSelect;
export type InsertOutreachCampaign = typeof outreachCampaigns.$inferInsert;

/**
 * AGENT CLOSER - Lead States
 * Tracks the current state of each lead in the pipeline
 */
export const leadStates = mysqlTable("lead_states", {
  id: int("id").autoincrement().primaryKey(),
  djId: int("djId").notNull().unique(), // FK to discovered_djs
  
  // Current state
  currentState: mysqlEnum("currentState", [
    "discovered",
    "qualified",
    "contacted", 
    "responded",
    "interested",
    "onboarding",
    "converted",
    "rejected",
    "dormant"
  ]).default("discovered").notNull(),
  
  // State history (JSON array of state transitions)
  stateHistory: json("stateHistory").$type<Array<{state: string, timestamp: string}>>(),
  
  // Timestamps
  discoveredAt: timestamp("discoveredAt"),
  contactedAt: timestamp("contactedAt"),
  respondedAt: timestamp("respondedAt"),
  convertedAt: timestamp("convertedAt"),
  rejectedAt: timestamp("rejectedAt"),
  
  // Metrics
  totalMessagesSent: int("totalMessagesSent").default(0).notNull(),
  totalResponsesReceived: int("totalResponsesReceived").default(0).notNull(),
  daysInPipeline: int("daysInPipeline").default(0).notNull(),
  
  // Metadata
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  currentStateIdx: index("current_state_idx").on(table.currentState),
  daysInPipelineIdx: index("days_in_pipeline_idx").on(table.daysInPipeline),
}));

export type LeadState = typeof leadStates.$inferSelect;
export type InsertLeadState = typeof leadStates.$inferInsert;

/**
 * AGENT MONETIZER - Monetization Opportunities
 * Stores detected opportunities for revenue optimization
 */
export const monetizationOpportunities = mysqlTable("monetization_opportunities", {
  id: int("id").autoincrement().primaryKey(),
  
  // Target
  userId: int("userId").notNull(), // FK to users (converted DJs)
  trackId: int("trackId"), // NULL if opportunity is user-level
  
  // Opportunity details
  opportunityType: mysqlEnum("opportunityType", [
    "upsell",
    "pricing_adjustment",
    "churn_prevention",
    "growth_opportunity"
  ]).notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  
  // Financial impact
  currentRevenueMonthly: decimal("currentRevenueMonthly", { precision: 10, scale: 2 }),
  potentialRevenueMonthly: decimal("potentialRevenueMonthly", { precision: 10, scale: 2 }),
  estimatedImpactMonthly: decimal("estimatedImpactMonthly", { precision: 10, scale: 2 }),
  confidenceScore: decimal("confidenceScore", { precision: 5, scale: 2 }), // 0-100
  
  // Recommendation
  recommendationText: text("recommendationText").notNull(),
  actionItems: json("actionItems").$type<string[]>(), // Array of actions
  
  // Status tracking
  status: mysqlEnum("status", ["active", "in_progress", "completed", "dismissed"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  actionedAt: timestamp("actionedAt"),
  completedAt: timestamp("completedAt"),
  
  // Results tracking
  actualImpactMonthly: decimal("actualImpactMonthly", { precision: 10, scale: 2 }),
  success: boolean("success"),
}, (table) => ({
  userStatusIdx: index("user_status_idx").on(table.userId, table.status),
  opportunityTypeIdx: index("opportunity_type_idx").on(table.opportunityType),
  priorityIdx: index("priority_idx").on(table.priority),
  estimatedImpactIdx: index("estimated_impact_idx").on(table.estimatedImpactMonthly),
}));

export type MonetizationOpportunity = typeof monetizationOpportunities.$inferSelect;
export type InsertMonetizationOpportunity = typeof monetizationOpportunities.$inferInsert;

/**
 * AGENT MONETIZER - DJ Metrics Daily
 * Daily snapshots of DJ metrics for trend analysis
 */
export const djMetricsDaily = mysqlTable("dj_metrics_daily", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // FK to users
  
  // Date of snapshot
  snapshotDate: varchar("snapshotDate", { length: 10 }).notNull(), // YYYY-MM-DD
  
  // Engagement metrics
  tracksUploadedTotal: int("tracksUploadedTotal"),
  tracksUploadedLast30d: int("tracksUploadedLast30d"),
  daysSinceLastUpload: int("daysSinceLastUpload"),
  
  // Monetization metrics
  downloadsTotal: bigint("downloadsTotal", { mode: "number" }),
  downloadsLast30d: int("downloadsLast30d"),
  revenueTotal: decimal("revenueTotal", { precision: 10, scale: 2 }),
  revenueLast30d: decimal("revenueLast30d", { precision: 10, scale: 2 }),
  avgPricePerDownload: decimal("avgPricePerDownload", { precision: 5, scale: 2 }),
  
  // Growth metrics
  downloadsGrowthRate: decimal("downloadsGrowthRate", { precision: 5, scale: 4 }), // Month-over-month
  revenueGrowthRate: decimal("revenueGrowthRate", { precision: 5, scale: 4 }),
  
  // Churn prediction
  churnRiskScore: decimal("churnRiskScore", { precision: 5, scale: 2 }), // 0-100
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userSnapshotIdx: uniqueIndex("user_snapshot_idx").on(table.userId, table.snapshotDate),
  snapshotDateIdx: index("snapshot_date_idx").on(table.snapshotDate),
  churnRiskIdx: index("churn_risk_idx").on(table.churnRiskScore),
}));

export type DjMetricDaily = typeof djMetricsDaily.$inferSelect;
export type InsertDjMetricDaily = typeof djMetricsDaily.$inferInsert;

/**
 * AGENT SYSTEM - Configuration and Settings
 */
export const agentConfig = mysqlTable("agent_config", {
  id: int("id").autoincrement().primaryKey(),
  agentName: mysqlEnum("agentName", ["scout", "closer", "monetizer"]).notNull().unique(),
  
  // Status
  enabled: boolean("enabled").default(true).notNull(),
  
  // Configuration (JSON)
  config: json("config").$type<Record<string, any>>(),
  
  // Execution tracking
  lastRunAt: timestamp("lastRunAt"),
  lastRunStatus: mysqlEnum("lastRunStatus", ["success", "failed", "running"]),
  lastRunError: text("lastRunError"),
  
  // Metrics
  totalRuns: int("totalRuns").default(0).notNull(),
  successfulRuns: int("successfulRuns").default(0).notNull(),
  failedRuns: int("failedRuns").default(0).notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AgentConfig = typeof agentConfig.$inferSelect;
export type InsertAgentConfig = typeof agentConfig.$inferInsert;
