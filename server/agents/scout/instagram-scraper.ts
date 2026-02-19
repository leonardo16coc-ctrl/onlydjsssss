/**
 * Instagram Scraper
 * Uses Puppeteer to scrape public Instagram profiles
 * 
 * IMPORTANT: This is for educational purposes only.
 * In production, always respect Instagram's Terms of Service and rate limits.
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { InstagramData } from '../types';
import { delay, randomDelay, parseNumber, randomItem, retryWithBackoff } from '../utils';
import { PUPPETEER_CONFIG, USER_AGENTS, GENRE_HASHTAGS } from '../config';

let browserInstance: Browser | null = null;

/**
 * Get or create a browser instance
 */
async function getBrowser(): Promise<Browser> {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch(PUPPETEER_CONFIG);
  }
  return browserInstance;
}

/**
 * Close the browser instance
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

/**
 * Search for DJ profiles by hashtag on Instagram
 */
export async function searchInstagramByHashtag(
  hashtag: string,
  limit: number = 50
): Promise<string[]> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  try {
    // Set random user agent
    await page.setUserAgent(randomItem(USER_AGENTS));
    
    // Navigate to hashtag page
    const url = `https://www.instagram.com/explore/tags/${hashtag}/`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for posts to load
    await delay(randomDelay(2000, 4000));
    
    // Extract profile URLs from posts
    const profileUrls = await page.evaluate((maxProfiles) => {
      const links = Array.from(document.querySelectorAll('a[href*="/p/"]'));
      const uniqueProfiles = new Set<string>();
      
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
          // Extract username from post URL
          const match = href.match(/\/p\/[^/]+/);
          if (match) {
            // Get the profile link by finding parent elements
            const profileLink = link.closest('article')?.querySelector('a[href^="/"][href*="/"]');
            if (profileLink) {
              const profileHref = profileLink.getAttribute('href');
              if (profileHref && !profileHref.includes('/p/') && !profileHref.includes('/explore/')) {
                uniqueProfiles.add(`https://www.instagram.com${profileHref}`);
              }
            }
          }
        }
      });
      
      return Array.from(uniqueProfiles).slice(0, maxProfiles);
    }, limit);
    
    console.log(`Found ${profileUrls.length} Instagram profiles for hashtag: #${hashtag}`);
    
    await page.close();
    return profileUrls;
    
  } catch (error) {
    console.error(`Error searching Instagram hashtag #${hashtag}:`, error);
    await page.close();
    return [];
  }
}

/**
 * Search for DJs by genre (uses multiple hashtags)
 */
export async function searchInstagramByGenre(
  genre: string,
  limit: number = 50
): Promise<string[]> {
  const hashtags = GENRE_HASHTAGS[genre] || [genre.toLowerCase().replace(/\s+/g, '')];
  const allProfiles: string[] = [];
  
  for (const hashtag of hashtags) {
    const profiles = await searchInstagramByHashtag(hashtag, Math.ceil(limit / hashtags.length));
    allProfiles.push(...profiles);
    
    // Delay between hashtag searches
    await delay(randomDelay(5000, 10000));
  }
  
  // Remove duplicates
  return Array.from(new Set(allProfiles)).slice(0, limit);
}

/**
 * Scrape an Instagram profile and extract metrics
 */
export async function scrapeInstagramProfile(
  profileUrl: string
): Promise<InstagramData | null> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  try {
    // Set random user agent
    await page.setUserAgent(randomItem(USER_AGENTS));
    
    // Navigate to profile
    await page.goto(profileUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for profile to load
    await delay(randomDelay(2000, 5000));
    
    // Extract profile data
    const profileData = await page.evaluate(() => {
      // Try to find the JSON data in script tags
      const scripts = Array.from(document.querySelectorAll('script'));
      let jsonData: any = null;
      
      for (const script of scripts) {
        const content = script.textContent || '';
        if (content.includes('window._sharedData')) {
          const match = content.match(/window\._sharedData\s*=\s*({.+?});/);
          if (match) {
            try {
              jsonData = JSON.parse(match[1]);
              break;
            } catch (e) {
              // Continue searching
            }
          }
        }
      }
      
      // Fallback: scrape from HTML
      const username = document.querySelector('meta[property="og:title"]')?.getAttribute('content')?.split('(')[0].trim() || '';
      const bio = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
      const profileImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
      
      // Try to extract stats from page
      const statsElements = Array.from(document.querySelectorAll('span[class*=""]'));
      const stats = statsElements
        .map(el => el.textContent?.trim())
        .filter(Boolean);
      
      return {
        username,
        fullName: username,
        bio,
        profileImageUrl: profileImage,
        followers: 0, // Will be parsed from stats
        postsCount: 0,
        jsonData,
        stats
      };
    });
    
    // Parse followers and posts from stats
    // This is a simplified version - in production, you'd need more robust parsing
    const followers = parseNumber(profileData.stats[1] || '0');
    const postsCount = parseNumber(profileData.stats[0] || '0');
    
    // Scroll to load recent posts
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await delay(randomDelay(2000, 3000));
    
    // Extract recent posts data
    const recentPosts = await page.evaluate(() => {
      const posts = Array.from(document.querySelectorAll('article a[href*="/p/"]')).slice(0, 12);
      return posts.map(post => {
        // Try to extract likes and comments from post
        // This is simplified - actual implementation would need to visit each post
        return {
          likes: 0,
          comments: 0,
          timestamp: new Date()
        };
      });
    });
    
    // Calculate average engagement
    const avgLikes = recentPosts.length > 0
      ? recentPosts.reduce((sum, post) => sum + post.likes, 0) / recentPosts.length
      : 0;
    
    const avgComments = recentPosts.length > 0
      ? recentPosts.reduce((sum, post) => sum + post.comments, 0) / recentPosts.length
      : 0;
    
    const engagementRate = followers > 0
      ? (avgLikes + avgComments) / followers
      : 0;
    
    // Estimate posts per week (simplified)
    const postsPerWeek = postsCount > 0 ? Math.min(postsCount / 52, 7) : 0;
    
    const data: InstagramData = {
      username: profileData.username,
      fullName: profileData.fullName,
      bio: profileData.bio,
      profileImageUrl: profileData.profileImageUrl,
      followers,
      postsCount,
      avgLikes,
      avgComments,
      engagementRate,
      postsPerWeek,
      recentPosts
    };
    
    console.log(`Scraped Instagram profile: ${data.username} (${data.followers} followers)`);
    
    await page.close();
    
    // Rate limiting - important to avoid bans
    await delay(randomDelay(5000, 10000));
    
    return data;
    
  } catch (error) {
    console.error(`Error scraping Instagram profile ${profileUrl}:`, error);
    await page.close();
    return null;
  }
}

/**
 * Batch scrape multiple Instagram profiles
 * Processes sequentially to avoid rate limiting
 */
export async function batchScrapeInstagramProfiles(
  profileUrls: string[]
): Promise<InstagramData[]> {
  const results: InstagramData[] = [];
  
  for (const url of profileUrls) {
    try {
      const data = await scrapeInstagramProfile(url);
      if (data) {
        results.push(data);
      }
    } catch (error) {
      console.error(`Failed to scrape ${url}:`, error);
    }
    
    // Longer delay between profiles to avoid detection
    await delay(randomDelay(10000, 15000));
  }
  
  return results;
}

/**
 * Check if Instagram profile is likely a DJ
 * Based on bio keywords and hashtags
 */
export function isDJProfile(data: InstagramData): boolean {
  const djKeywords = [
    'dj',
    'producer',
    'music',
    'techno',
    'house',
    'edm',
    'electronic',
    'beats',
    'mixing',
    'turntables',
    'decks',
    'resident',
    'booking'
  ];
  
  const bioLower = data.bio.toLowerCase();
  
  return djKeywords.some(keyword => bioLower.includes(keyword));
}
