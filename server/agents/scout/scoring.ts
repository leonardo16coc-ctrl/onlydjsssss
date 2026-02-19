/**
 * Talent Scoring Algorithm
 * Calculates a 0-100 score based on multiple weighted factors
 */

import { ProfileData, TalentScore, GrowthData, ConsistencyData } from '../types';
import { PRIORITY_GENRES } from '../config';
import { logScore, standardDeviation } from '../utils';

/**
 * Calculate the overall Talent Score
 * Formula: Engagement(35%) + Growth(25%) + Consistency(20%) + Reach(15%) + GenreMatch(5%)
 */
export function calculateTalentScore(
  profile: ProfileData,
  growthData?: GrowthData,
  consistencyData?: ConsistencyData
): TalentScore {
  const engagementScore = calculateEngagementScore(profile);
  const growthScore = growthData ? calculateGrowthScore(growthData) : 50; // Default to 50 if no historical data
  const consistencyScore = consistencyData ? calculateConsistencyScore(consistencyData) : 50;
  const reachScore = calculateReachScore(profile);
  const genreMatchScore = calculateGenreMatchScore(profile.primaryGenre);
  
  const talentScore = (
    engagementScore * 0.35 +
    growthScore * 0.25 +
    consistencyScore * 0.20 +
    reachScore * 0.15 +
    genreMatchScore * 0.05
  );
  
  return {
    talentScore: Math.round(talentScore * 100) / 100,
    engagementScore: Math.round(engagementScore * 100) / 100,
    growthScore: Math.round(growthScore * 100) / 100,
    consistencyScore: Math.round(consistencyScore * 100) / 100,
    reachScore: Math.round(reachScore * 100) / 100,
    genreMatchScore: Math.round(genreMatchScore * 100) / 100
  };
}

/**
 * Calculate Engagement Score (35% of total)
 * Measures quality of audience, not just quantity
 */
function calculateEngagementScore(profile: ProfileData): number {
  let totalEngagement = 0;
  let count = 0;
  
  // Instagram engagement
  if (profile.instagram) {
    const igEngagement = profile.instagram.engagementRate * 100;
    totalEngagement += normalizeEngagementRate(igEngagement);
    count++;
  }
  
  // SoundCloud engagement
  if (profile.soundcloud) {
    const scEngagement = profile.soundcloud.engagementRate * 100;
    totalEngagement += normalizeEngagementRate(scEngagement);
    count++;
  }
  
  if (count === 0) return 0;
  
  return totalEngagement / count;
}

/**
 * Normalize engagement rate to 0-100 scale
 * > 5% = Excellent (90-100)
 * 3-5% = Good (70-89)
 * 1-3% = Average (50-69)
 * < 1% = Low (0-49)
 */
function normalizeEngagementRate(rate: number): number {
  if (rate >= 5) {
    return 90 + Math.min((rate - 5) * 2, 10); // 90-100
  } else if (rate >= 3) {
    return 70 + ((rate - 3) / 2) * 20; // 70-90
  } else if (rate >= 1) {
    return 50 + ((rate - 1) / 2) * 20; // 50-70
  } else {
    return rate * 50; // 0-50
  }
}

/**
 * Calculate Growth Score (25% of total)
 * Measures velocity of growth in followers and content
 */
function calculateGrowthScore(growthData: GrowthData): number {
  // Followers growth rate (60% of growth score)
  const followersGrowthRate = growthData.followers30DaysAgo > 0
    ? (growthData.currentFollowers - growthData.followers30DaysAgo) / growthData.followers30DaysAgo
    : 0;
  
  const followersScore = normalizeGrowthRate(followersGrowthRate);
  
  // Content growth rate (40% of growth score)
  const postsGrowth = growthData.currentPosts - growthData.posts30DaysAgo;
  const postsPerDay = postsGrowth / 30;
  const contentScore = normalizeContentGrowth(postsPerDay);
  
  return (followersScore * 0.6) + (contentScore * 0.4);
}

/**
 * Normalize growth rate to 0-100 scale
 * > 10% monthly = Excellent (90-100)
 * 5-10% = Good (70-89)
 * 2-5% = Average (50-69)
 * < 2% = Low (0-49)
 */
function normalizeGrowthRate(rate: number): number {
  const percentageGrowth = rate * 100;
  
  if (percentageGrowth >= 10) {
    return 90 + Math.min((percentageGrowth - 10), 10); // 90-100
  } else if (percentageGrowth >= 5) {
    return 70 + ((percentageGrowth - 5) / 5) * 20; // 70-90
  } else if (percentageGrowth >= 2) {
    return 50 + ((percentageGrowth - 2) / 3) * 20; // 50-70
  } else if (percentageGrowth >= 0) {
    return (percentageGrowth / 2) * 50; // 0-50
  } else {
    return 0; // Negative growth
  }
}

/**
 * Normalize content growth (posts per day) to 0-100 scale
 * Ideal: 3+ posts per week (0.43+ per day)
 */
function normalizeContentGrowth(postsPerDay: number): number {
  const idealPostsPerDay = 0.43; // ~3 posts per week
  
  if (postsPerDay >= idealPostsPerDay) {
    return 100;
  } else {
    return (postsPerDay / idealPostsPerDay) * 100;
  }
}

/**
 * Calculate Consistency Score (20% of total)
 * Measures regularity of posting and content creation
 */
function calculateConsistencyScore(consistencyData: ConsistencyData): number {
  // Post frequency score (50% of consistency)
  const idealPostsPerWeek = 3;
  const frequencyScore = Math.min((consistencyData.postsPerWeek / idealPostsPerWeek), 1) * 100;
  
  // Regularity score (50% of consistency)
  // Lower standard deviation = more consistent
  const stdDev = standardDeviation(consistencyData.daysBetweenPosts);
  const regularityScore = Math.max(0, 100 - (stdDev / 7) * 100); // Penalize if stdDev > 7 days
  
  return (frequencyScore * 0.5) + (regularityScore * 0.5);
}

/**
 * Calculate Reach Score (15% of total)
 * Measures absolute audience size (logarithmic scale)
 */
function calculateReachScore(profile: ProfileData): number {
  let totalReach = 0;
  let count = 0;
  
  // Instagram reach (50% of reach score)
  if (profile.instagram) {
    const igScore = logScore(profile.instagram.followers, 1000000) * 100; // Max: 1M followers
    totalReach += igScore;
    count++;
  }
  
  // SoundCloud reach (50% of reach score)
  if (profile.soundcloud) {
    const scScore = logScore(profile.soundcloud.followers, 100000) * 100; // Max: 100K followers
    totalReach += scScore;
    count++;
  }
  
  if (count === 0) return 0;
  
  return totalReach / count;
}

/**
 * Calculate Genre Match Score (5% of total)
 * Higher score if DJ's genre matches OnlyDJS priority genres
 */
function calculateGenreMatchScore(primaryGenre: string): number {
  return PRIORITY_GENRES.includes(primaryGenre) ? 100 : 50;
}

/**
 * Check if a DJ meets minimum qualification thresholds
 */
export function meetsQualificationThresholds(
  profile: ProfileData,
  scores: TalentScore,
  minTalentScore: number = 60,
  minFollowers: { instagram: number; soundcloud: number } = { instagram: 5000, soundcloud: 1000 }
): boolean {
  // Check talent score
  if (scores.talentScore < minTalentScore) {
    return false;
  }
  
  // Check Instagram followers
  if (profile.instagram && profile.instagram.followers < minFollowers.instagram) {
    return false;
  }
  
  // Check SoundCloud followers
  if (profile.soundcloud && profile.soundcloud.followers < minFollowers.soundcloud) {
    return false;
  }
  
  // Must have at least one platform
  if (!profile.instagram && !profile.soundcloud) {
    return false;
  }
  
  return true;
}

/**
 * Generate AI notes about the DJ based on their profile
 */
export function generateAINotes(profile: ProfileData, scores: TalentScore): string {
  const notes: string[] = [];
  
  // Engagement analysis
  if (scores.engagementScore >= 80) {
    notes.push('High engagement rate indicates strong audience connection');
  } else if (scores.engagementScore < 50) {
    notes.push('Low engagement rate may indicate inactive or bot followers');
  }
  
  // Growth analysis
  if (scores.growthScore >= 80) {
    notes.push('Rapid growth trajectory - trending DJ');
  } else if (scores.growthScore < 40) {
    notes.push('Stagnant growth - may need re-engagement');
  }
  
  // Consistency analysis
  if (scores.consistencyScore >= 80) {
    notes.push('Highly consistent posting schedule - professional behavior');
  } else if (scores.consistencyScore < 50) {
    notes.push('Irregular posting - may be hobby DJ');
  }
  
  // Reach analysis
  if (scores.reachScore >= 70) {
    notes.push('Large audience reach - established DJ');
  } else if (scores.reachScore < 30) {
    notes.push('Small but potentially engaged audience - emerging talent');
  }
  
  // Genre match
  if (scores.genreMatchScore === 100) {
    notes.push(`Perfect genre match: ${profile.primaryGenre}`);
  }
  
  // Overall assessment
  if (scores.talentScore >= 80) {
    notes.push('🌟 HIGH PRIORITY - Excellent candidate for OnlyDJS');
  } else if (scores.talentScore >= 70) {
    notes.push('✅ QUALIFIED - Good candidate for outreach');
  } else if (scores.talentScore >= 60) {
    notes.push('⚠️ MARGINAL - Consider for follow-up');
  }
  
  return notes.join('. ');
}
