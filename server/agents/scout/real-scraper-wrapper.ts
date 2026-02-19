/**
 * Real Scraper Wrapper for Agent Scout
 * Integrates Puppeteer-based scrapers with Agent Scout
 */

import { ProfileData } from '../types';
import { 
  scrapeInstagramProfile as scrapeInstagramReal,
  loginInstagram,
  closeBrowser as closeInstagramBrowser,
  getSessionStats as getInstagramStats
} from '../scrapers/instagram-real';
import {
  scrapeSoundCloudProfile as scrapeSoundCloudReal,
  searchSoundCloudByGenre as searchSoundCloudReal,
  closeBrowser as closeSoundCloudBrowser,
  getSessionStats as getSoundCloudStats
} from '../scrapers/soundcloud-real';
import {
  getActiveAccount,
  markAccountUsed,
  markAccountBanned,
  recordSuccessfulAction,
  recordFailedAction
} from '../scrapers/account-manager';

/**
 * Scrape Instagram profile with account management
 */
export async function scrapeInstagramProfile(username: string): Promise<ProfileData | null> {
  try {
    // Get active account
    const account = await getActiveAccount('instagram');
    
    if (!account) {
      console.log('⚠️ No active Instagram accounts available. Using anonymous scraping.');
      // Fallback to anonymous scraping (higher ban risk)
    } else {
      console.log(`Using Instagram account: @${account.username}`);
      
      // Login if needed
      if (account.password) {
        const loginSuccess = await loginInstagram(account.username, account.password);
        
        if (!loginSuccess) {
          console.log(`❌ Failed to login with @${account.username}`);
          await markAccountBanned(account.id, 'Login failed');
          return null;
        }
      }
      
      await markAccountUsed(account.id);
    }
    
    // Scrape profile
    const profile = await scrapeInstagramReal(username);
    
    if (!profile) {
      if (account) {
        await recordFailedAction(account.id);
      }
      return null;
    }
    
    if (account) {
      await recordSuccessfulAction(account.id);
    }
    
    // Convert to ProfileData format
    const profileData: ProfileData = {
      instagram: {
        username: profile.username,
        fullName: profile.fullName || '',
        bio: profile.biography || '',
        profileImageUrl: profile.profilePicUrl || '',
        followers: profile.followers,
        postsCount: profile.postsCount,
        avgLikes: calculateAvgLikes(profile.recentPosts),
        avgComments: calculateAvgComments(profile.recentPosts),
        engagementRate: calculateEngagementRate(profile.recentPosts, profile.followers),
        postsPerWeek: 0, // Would need historical data
        recentPosts: profile.recentPosts
      },
      fullName: profile.fullName || profile.username,
      primaryGenre: '', // Would need to be determined
      secondaryGenres: [],
      bio: profile.biography || '',
      profileImageUrl: profile.profilePicUrl || '',
      instagramUrl: `https://instagram.com/${profile.username}`
    };
    
    return profileData;
    
  } catch (error: any) {
    console.error(`❌ Error scraping Instagram @${username}:`, error.message);
    return null;
  }
}

/**
 * Scrape SoundCloud profile
 */
export async function scrapeSoundCloudProfile(username: string): Promise<ProfileData | null> {
  try {
    const profile = await scrapeSoundCloudReal(username);
    
    if (!profile) {
      return null;
    }
    
    // Convert to ProfileData format
    const profileData: ProfileData = {
      soundcloud: {
        username: profile.username,
        fullName: profile.displayName || '',
        bio: profile.bio || '',
        profileImageUrl: profile.avatarUrl || '',
        followers: profile.followers,
        tracksCount: profile.tracksCount,
        totalPlays: profile.recentTracks.reduce((sum, t) => sum + t.plays, 0),
        avgLikes: calculateAvgLikes(profile.recentTracks),
        avgReposts: profile.recentTracks.reduce((sum, t) => sum + (t.reposts || 0), 0) / (profile.recentTracks.length || 1),
        engagementRate: calculateSoundCloudEngagement(profile.recentTracks, profile.followers),
        uploadsPerMonth: 0, // Would need historical data
        recentTracks: profile.recentTracks,
        genres: [] // Would need to be determined
      },
      fullName: profile.displayName || profile.username,
      primaryGenre: '', // Would need to be determined
      secondaryGenres: [],
      bio: profile.bio || '',
      profileImageUrl: profile.avatarUrl || '',
      soundcloudUrl: `https://soundcloud.com/${profile.username}`
    };
    
    return profileData;
    
  } catch (error: any) {
    console.error(`❌ Error scraping SoundCloud ${username}:`, error.message);
    return null;
  }
}

/**
 * Search SoundCloud by genre
 */
export async function searchSoundCloudByGenre(genre: string, limit: number = 20): Promise<string[]> {
  try {
    const usernames = await searchSoundCloudReal(genre, limit);
    return usernames;
  } catch (error: any) {
    console.error(`❌ Error searching SoundCloud for ${genre}:`, error.message);
    return [];
  }
}

/**
 * Search Instagram by genre (simplified - returns empty for now)
 * Instagram doesn't have a public search API, would need manual curation
 */
export async function searchInstagramByGenre(genre: string, limit: number = 20): Promise<string[]> {
  console.log(`⚠️ Instagram search not available via scraping. Use manual curation or hashtag monitoring.`);
  return [];
}

/**
 * Calculate engagement rate from posts
 */
function calculateEngagementRate(posts: any[], followers: number): number {
  if (posts.length === 0 || followers === 0) return 0;
  
  const totalEngagement = posts.reduce((sum, post) => {
    return sum + (post.likes || 0) + (post.comments || 0);
  }, 0);
  
  const avgEngagement = totalEngagement / posts.length;
  const engagementRate = (avgEngagement / followers) * 100;
  
  return Math.round(engagementRate * 100) / 100; // Round to 2 decimals
}

/**
 * Calculate SoundCloud engagement
 */
function calculateSoundCloudEngagement(tracks: any[], followers: number): number {
  if (tracks.length === 0 || followers === 0) return 0;
  
  const totalEngagement = tracks.reduce((sum, track) => {
    return sum + (track.likes || 0) + (track.reposts || 0);
  }, 0);
  
  const avgEngagement = totalEngagement / tracks.length;
  const engagementRate = (avgEngagement / followers) * 100;
  
  return Math.round(engagementRate * 100) / 100;
}

/**
 * Calculate average likes
 */
function calculateAvgLikes(items: any[]): number {
  if (items.length === 0) return 0;
  
  const totalLikes = items.reduce((sum, item) => sum + (item.likes || 0), 0);
  return Math.round(totalLikes / items.length);
}

/**
 * Calculate average comments
 */
function calculateAvgComments(posts: any[]): number {
  if (posts.length === 0) return 0;
  
  const totalComments = posts.reduce((sum, post) => sum + (post.comments || 0), 0);
  return Math.round(totalComments / posts.length);
}

/**
 * Calculate average plays
 */
function calculateAvgPlays(tracks: any[]): number {
  if (tracks.length === 0) return 0;
  
  const totalPlays = tracks.reduce((sum, track) => sum + (track.plays || 0), 0);
  return Math.round(totalPlays / tracks.length);
}

/**
 * Close all browser sessions
 */
export async function closeAllBrowsers(): Promise<void> {
  await closeInstagramBrowser();
  await closeSoundCloudBrowser();
}

/**
 * Get scraper stats
 */
export function getScraperStats() {
  return {
    instagram: getInstagramStats(),
    soundcloud: getSoundCloudStats()
  };
}

/**
 * Check if profile is DJ-related (heuristic)
 */
export function isDJProfile(profile: ProfileData): boolean {
  const djKeywords = [
    'dj', 'producer', 'music', 'techno', 'house', 'edm',
    'beats', 'mixing', 'turntables', 'decks', 'soundcloud',
    'spotify', 'beatport', 'resident advisor'
  ];
  
  const bio = (profile.bio || '').toLowerCase();
  const name = (profile.fullName || '').toLowerCase();
  const username = (profile.instagram?.username || profile.soundcloud?.username || '').toLowerCase();
  
  const text = `${bio} ${name} ${username}`;
  
  return djKeywords.some(keyword => text.includes(keyword));
}
