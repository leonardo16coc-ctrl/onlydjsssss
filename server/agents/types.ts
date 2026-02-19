/**
 * Type definitions for Agent System
 */

export interface InstagramData {
  username: string;
  fullName: string;
  bio: string;
  profileImageUrl: string;
  followers: number;
  postsCount: number;
  avgLikes: number;
  avgComments: number;
  engagementRate: number;
  postsPerWeek: number;
  recentPosts: Array<{
    likes: number;
    comments: number;
    timestamp: Date;
  }>;
}

export interface SoundCloudData {
  username: string;
  fullName: string;
  bio: string;
  profileImageUrl: string;
  followers: number;
  tracksCount: number;
  totalPlays: number;
  avgLikes: number;
  avgReposts: number;
  engagementRate: number;
  uploadsPerMonth: number;
  recentTracks: Array<{
    title: string;
    plays: number;
    likes: number;
    reposts: number;
    uploadedAt: Date;
  }>;
  genres: string[];
}

export interface ProfileData {
  instagram?: InstagramData;
  soundcloud?: SoundCloudData;
  fullName: string;
  primaryGenre: string;
  secondaryGenres: string[];
  bio: string;
  profileImageUrl: string;
  instagramUrl?: string;
  soundcloudUrl?: string;
  email?: string;
}

export interface TalentScore {
  talentScore: number;
  engagementScore: number;
  growthScore: number;
  consistencyScore: number;
  reachScore: number;
  genreMatchScore: number;
}

export interface DiscoveredDJ {
  id: number;
  instagramUsername?: string;
  soundcloudUsername?: string;
  fullName?: string;
  email?: string;
  
  // Instagram metrics
  instagramFollowers?: number;
  instagramPostsCount?: number;
  instagramAvgLikes?: number;
  instagramAvgComments?: number;
  instagramEngagementRate?: number;
  instagramPostsPerWeek?: number;
  
  // SoundCloud metrics
  soundcloudFollowers?: number;
  soundcloudTracksCount?: number;
  soundcloudTotalPlays?: number;
  soundcloudAvgLikes?: number;
  soundcloudAvgReposts?: number;
  soundcloudEngagementRate?: number;
  soundcloudUploadsPerMonth?: number;
  
  // Scores
  talentScore?: number;
  engagementScore?: number;
  growthScore?: number;
  consistencyScore?: number;
  reachScore?: number;
  genreMatchScore?: number;
  
  // Classification
  primaryGenre?: string;
  secondaryGenres?: string[];
  
  // Status
  discoveryStatus: 'discovered' | 'qualified' | 'contacted' | 'responded' | 'converted' | 'rejected' | 'dormant';
  discoveryDate: Date;
  lastUpdated: Date;
  lastScraped?: Date;
  
  // Metadata
  bio?: string;
  profileImageUrl?: string;
  instagramUrl?: string;
  soundcloudUrl?: string;
  aiNotes?: string;
}

export interface ScoutMetric {
  id: number;
  djId: number;
  instagramFollowers?: number;
  soundcloudFollowers?: number;
  instagramEngagementRate?: number;
  soundcloudEngagementRate?: number;
  recordedAt: Date;
}

export interface AgentConfig {
  id: number;
  agentName: 'scout' | 'closer' | 'monetizer';
  enabled: boolean;
  config?: Record<string, any>;
  lastRunAt?: Date;
  lastRunStatus?: 'success' | 'failed' | 'running';
  lastRunError?: string;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScoutJobData {
  genre: string;
  platform: 'instagram' | 'soundcloud';
  limit: number;
}

export interface ScoutResult {
  profilesScraped: number;
  profilesQualified: number;
  profilesSaved: number;
  errors: number;
  duration: number;
}

export interface GrowthData {
  followers30DaysAgo: number;
  currentFollowers: number;
  posts30DaysAgo: number;
  currentPosts: number;
}

export interface ConsistencyData {
  postsPerWeek: number;
  uploadsPerMonth: number;
  daysBetweenPosts: number[];
}
