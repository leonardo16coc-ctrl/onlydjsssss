/**
 * SoundCloud Scraper
 * Uses SoundCloud API v2 to discover and analyze DJ profiles
 */

import { SoundCloudData } from '../types';
import { delay, randomDelay, parseNumber, retryWithBackoff } from '../utils';

const SOUNDCLOUD_API_BASE = 'https://api-v2.soundcloud.com';

/**
 * Get SoundCloud client_id by analyzing the website
 * This is a public identifier used by the official SoundCloud website
 */
async function getSoundCloudClientId(): Promise<string> {
  // For now, return a placeholder
  // In production, this would extract the client_id from SoundCloud's website
  // by fetching the main page and parsing the script tags
  return 'YOUR_CLIENT_ID_HERE';
}

/**
 * Search for DJs by genre on SoundCloud
 */
export async function searchSoundCloudByGenre(
  genre: string,
  limit: number = 50
): Promise<string[]> {
  try {
    const clientId = await getSoundCloudClientId();
    const query = encodeURIComponent(genre);
    
    const url = `${SOUNDCLOUD_API_BASE}/search/users?q=${query}&client_id=${clientId}&limit=${limit}`;
    
    const response = await retryWithBackoff(async () => {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`SoundCloud API error: ${res.status}`);
      }
      return res.json();
    });
    
    // Extract profile URLs
    const profileUrls: string[] = response.collection
      .map((user: any) => user.permalink_url)
      .filter(Boolean);
    
    console.log(`Found ${profileUrls.length} SoundCloud profiles for genre: ${genre}`);
    
    return profileUrls;
    
  } catch (error) {
    console.error(`Error searching SoundCloud for genre ${genre}:`, error);
    return [];
  }
}

/**
 * Scrape a SoundCloud profile and extract metrics
 */
export async function scrapeSoundCloudProfile(
  profileUrl: string
): Promise<SoundCloudData | null> {
  try {
    const clientId = await getSoundCloudClientId();
    const username = extractUsername(profileUrl);
    
    if (!username) {
      console.error(`Invalid SoundCloud URL: ${profileUrl}`);
      return null;
    }
    
    // Get user data
    const userUrl = `${SOUNDCLOUD_API_BASE}/resolve?url=${encodeURIComponent(profileUrl)}&client_id=${clientId}`;
    
    const userData = await retryWithBackoff(async () => {
      const res = await fetch(userUrl);
      if (!res.ok) {
        throw new Error(`SoundCloud API error: ${res.status}`);
      }
      return res.json();
    });
    
    // Get user's tracks
    const tracksUrl = `${SOUNDCLOUD_API_BASE}/users/${userData.id}/tracks?client_id=${clientId}&limit=50`;
    
    const tracksData = await retryWithBackoff(async () => {
      const res = await fetch(tracksUrl);
      if (!res.ok) {
        throw new Error(`SoundCloud API error: ${res.status}`);
      }
      return res.json();
    });
    
    // Calculate metrics
    const tracks = tracksData.collection || [];
    const recentTracks = tracks.slice(0, 10); // Last 10 tracks
    
    const totalPlays = tracks.reduce((sum: number, track: any) => sum + (track.playback_count || 0), 0);
    const totalLikes = tracks.reduce((sum: number, track: any) => sum + (track.likes_count || 0), 0);
    const totalReposts = tracks.reduce((sum: number, track: any) => sum + (track.reposts_count || 0), 0);
    
    const avgLikes = tracks.length > 0 ? totalLikes / tracks.length : 0;
    const avgReposts = tracks.length > 0 ? totalReposts / tracks.length : 0;
    const avgPlays = tracks.length > 0 ? totalPlays / tracks.length : 0;
    
    // Engagement rate: (likes + reposts) / plays
    const engagementRate = avgPlays > 0 ? (avgLikes + avgReposts) / avgPlays : 0;
    
    // Calculate uploads per month
    const uploadsPerMonth = calculateUploadsPerMonth(tracks);
    
    // Extract genres
    const genres = extractGenres(tracks);
    
    const data: SoundCloudData = {
      username: userData.username,
      fullName: userData.full_name || userData.username,
      bio: userData.description || '',
      profileImageUrl: userData.avatar_url || '',
      followers: userData.followers_count || 0,
      tracksCount: userData.track_count || 0,
      totalPlays,
      avgLikes,
      avgReposts,
      engagementRate,
      uploadsPerMonth,
      recentTracks: recentTracks.map((track: any) => ({
        title: track.title,
        plays: track.playback_count || 0,
        likes: track.likes_count || 0,
        reposts: track.reposts_count || 0,
        uploadedAt: new Date(track.created_at)
      })),
      genres
    };
    
    console.log(`Scraped SoundCloud profile: ${username} (${data.followers} followers)`);
    
    // Rate limiting
    await delay(randomDelay(1000, 3000));
    
    return data;
    
  } catch (error) {
    console.error(`Error scraping SoundCloud profile ${profileUrl}:`, error);
    return null;
  }
}

/**
 * Extract username from SoundCloud URL
 */
function extractUsername(url: string): string | null {
  const match = url.match(/soundcloud\.com\/([^/?]+)/);
  return match ? match[1] : null;
}

/**
 * Calculate uploads per month based on track history
 */
function calculateUploadsPerMonth(tracks: any[]): number {
  if (tracks.length === 0) return 0;
  
  const sortedTracks = tracks
    .map(t => new Date(t.created_at))
    .sort((a, b) => b.getTime() - a.getTime());
  
  const newest = sortedTracks[0];
  const oldest = sortedTracks[sortedTracks.length - 1];
  
  const monthsDiff = (newest.getTime() - oldest.getTime()) / (1000 * 60 * 60 * 24 * 30);
  
  if (monthsDiff === 0) return tracks.length;
  
  return tracks.length / monthsDiff;
}

/**
 * Extract genres from tracks
 */
function extractGenres(tracks: any[]): string[] {
  const genreCounts: Record<string, number> = {};
  
  tracks.forEach(track => {
    const genre = track.genre;
    if (genre) {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    }
  });
  
  // Sort by frequency
  const sortedGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([genre]) => genre);
  
  return sortedGenres.slice(0, 3); // Top 3 genres
}

/**
 * Batch scrape multiple SoundCloud profiles
 */
export async function batchScrapeSoundCloudProfiles(
  profileUrls: string[],
  maxConcurrent: number = 3
): Promise<SoundCloudData[]> {
  const results: SoundCloudData[] = [];
  
  // Process in batches to avoid rate limiting
  for (let i = 0; i < profileUrls.length; i += maxConcurrent) {
    const batch = profileUrls.slice(i, i + maxConcurrent);
    
    const batchResults = await Promise.all(
      batch.map(url => scrapeSoundCloudProfile(url))
    );
    
    results.push(...batchResults.filter(Boolean) as SoundCloudData[]);
    
    // Delay between batches
    if (i + maxConcurrent < profileUrls.length) {
      await delay(randomDelay(3000, 5000));
    }
  }
  
  return results;
}
