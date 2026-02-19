/**
 * SoundCloud Real Scraper with Puppeteer
 * WARNING: This violates SoundCloud Terms of Service
 * Use at your own risk
 */

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'puppeteer';
import { 
  SCRAPER_CONFIG, 
  USER_AGENTS, 
  VIEWPORTS, 
  getRandomItem, 
  getRandomDelay, 
  sleep,
  randomScroll
} from './config';
import { db } from '../db-helper';

puppeteer.use(StealthPlugin());

interface SoundCloudProfile {
  username: string;
  displayName: string | null;
  bio: string | null;
  followers: number;
  following: number;
  tracksCount: number;
  avatarUrl: string | null;
  city: string | null;
  country: string | null;
  recentTracks: Array<{
    title: string;
    plays: number;
    likes: number;
    reposts: number;
    duration: number;
    uploadedAt: Date;
  }>;
}

interface ScraperSession {
  browser: Browser | null;
  page: Page | null;
  lastActionTime: number;
  actionsThisHour: number;
  actionsToday: number;
  sessionStartTime: number;
}

let session: ScraperSession = {
  browser: null,
  page: null,
  lastActionTime: 0,
  actionsThisHour: 0,
  actionsToday: 0,
  sessionStartTime: Date.now()
};

/**
 * Initialize browser
 */
async function initBrowser(): Promise<void> {
  if (session.browser) {
    return;
  }
  
  console.log('🌐 Initializing SoundCloud scraper browser...');
  
  const userAgent = getRandomItem(USER_AGENTS);
  const viewport = getRandomItem(VIEWPORTS);
  
  session.browser = await puppeteer.launch({
    headless: SCRAPER_CONFIG.browser.headless,
    args: SCRAPER_CONFIG.browser.args,
    defaultViewport: viewport
  });
  
  session.page = await session.browser.newPage();
  await session.page.setUserAgent(userAgent);
  
  await session.page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
  });
  
  console.log('✅ Browser initialized');
}

/**
 * Check rate limits
 */
async function checkRateLimits(): Promise<void> {
  const now = Date.now();
  const hourAgo = now - 3600000;
  const dayAgo = now - 86400000;
  
  if (session.lastActionTime < hourAgo) {
    session.actionsThisHour = 0;
  }
  
  if (session.sessionStartTime < dayAgo) {
    session.actionsToday = 0;
    session.sessionStartTime = now;
  }
  
  if (session.actionsThisHour >= SCRAPER_CONFIG.soundcloud.maxProfileViewsPerSession) {
    const waitTime = 3600000 - (now - session.lastActionTime);
    console.log(`⏳ Hourly rate limit reached. Waiting ${Math.ceil(waitTime / 60000)} minutes...`);
    await sleep(waitTime);
    session.actionsThisHour = 0;
  }
  
  const timeSinceLastAction = now - session.lastActionTime;
  if (timeSinceLastAction < SCRAPER_CONFIG.rateLimit.minDelayBetweenActions) {
    const delay = SCRAPER_CONFIG.rateLimit.minDelayBetweenActions - timeSinceLastAction;
    await sleep(delay);
  }
  
  const randomDelay = getRandomDelay(
    SCRAPER_CONFIG.rateLimit.minDelayBetweenActions,
    SCRAPER_CONFIG.rateLimit.maxDelayBetweenActions
  );
  await sleep(randomDelay);
}

/**
 * Update action counters
 */
function updateActionCounters(): void {
  session.lastActionTime = Date.now();
  session.actionsThisHour++;
  session.actionsToday++;
}

/**
 * Scrape SoundCloud profile
 */
export async function scrapeSoundCloudProfile(username: string): Promise<SoundCloudProfile | null> {
  try {
    await initBrowser();
    if (!session.page) throw new Error('Browser not initialized');
    
    await checkRateLimits();
    
    console.log(`🔍 Scraping SoundCloud profile: ${username}`);
    
    const url = `https://soundcloud.com/${username}`;
    await session.page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for content to load
    await sleep(getRandomDelay(2000, 4000));
    
    // Random scroll
    await randomScroll(session.page);
    await sleep(getRandomDelay(1000, 2000));
    
    // Extract profile data
    const profileData = await session.page.evaluate(() => {
      // Helper to extract number from text
      const extractNumber = (text: string | null): number => {
        if (!text) return 0;
        const match = text.match(/[\d,]+/);
        if (!match) return 0;
        return parseInt(match[0].replace(/,/g, ''), 10);
      };
      
      // Try to find data in page
      const result: any = {
        username: '',
        displayName: null,
        bio: null,
        followers: 0,
        following: 0,
        tracksCount: 0,
        avatarUrl: null,
        city: null,
        country: null,
        recentTracks: []
      };
      
      // Get display name
      const nameElement = document.querySelector('h1[itemprop="name"]');
      if (nameElement) {
        result.displayName = nameElement.textContent?.trim() || null;
      }
      
      // Get bio
      const bioElement = document.querySelector('p[itemprop="description"]');
      if (bioElement) {
        result.bio = bioElement.textContent?.trim() || null;
      }
      
      // Get avatar
      const avatarElement = document.querySelector('span.sc-artwork') as HTMLElement;
      if (avatarElement) {
        const style = avatarElement.style.backgroundImage;
        const match = style.match(/url\("(.+?)"\)/);
        if (match) {
          result.avatarUrl = match[1];
        }
      }
      
      // Get stats (followers, following, tracks)
      const statsElements = document.querySelectorAll('a[href*="followers"], a[href*="following"], a[href*="tracks"]');
      statsElements.forEach((el) => {
        const href = el.getAttribute('href') || '';
        const text = el.textContent || '';
        
        if (href.includes('followers')) {
          result.followers = extractNumber(text);
        } else if (href.includes('following')) {
          result.following = extractNumber(text);
        } else if (href.includes('tracks')) {
          result.tracksCount = extractNumber(text);
        }
      });
      
      // Get location
      const locationElement = document.querySelector('a[href*="/search/places"]');
      if (locationElement) {
        const location = locationElement.textContent?.trim();
        if (location) {
          const parts = location.split(',').map(p => p.trim());
          if (parts.length === 2) {
            result.city = parts[0];
            result.country = parts[1];
          } else if (parts.length === 1) {
            result.country = parts[0];
          }
        }
      }
      
      // Get recent tracks
      const trackElements = document.querySelectorAll('article[itemprop="track"]');
      trackElements.forEach((track, index) => {
        if (index >= 5) return; // Limit to 5 recent tracks
        
        const titleElement = track.querySelector('a[itemprop="url"]');
        const playsElement = track.querySelector('.sc-ministats-plays');
        const likesElement = track.querySelector('.sc-button-like');
        const repostsElement = track.querySelector('.sc-button-repost');
        
        result.recentTracks.push({
          title: titleElement?.textContent?.trim() || 'Unknown',
          plays: extractNumber(playsElement?.textContent || '0'),
          likes: extractNumber(likesElement?.getAttribute('title') || '0'),
          reposts: extractNumber(repostsElement?.getAttribute('title') || '0'),
          duration: 0, // Would need additional parsing
          uploadedAt: new Date()
        });
      });
      
      return result;
    });
    
    updateActionCounters();
    
    // Log action
    await db.query(
      `INSERT INTO scraper_logs (platform, action, targetUsername, status, timestamp)
       VALUES ('soundcloud', 'profile_scrape', ?, 'success', NOW())`,
      [username]
    );
    
    console.log(`✅ Profile scraped: ${username}`);
    console.log(`   Followers: ${profileData.followers}`);
    console.log(`   Tracks: ${profileData.tracksCount}`);
    console.log(`   Recent tracks: ${profileData.recentTracks.length}`);
    
    return {
      username,
      displayName: profileData.displayName,
      bio: profileData.bio,
      followers: profileData.followers,
      following: profileData.following,
      tracksCount: profileData.tracksCount,
      avatarUrl: profileData.avatarUrl,
      city: profileData.city,
      country: profileData.country,
      recentTracks: profileData.recentTracks
    };
    
  } catch (error: any) {
    console.error(`❌ Error scraping ${username}:`, error.message);
    
    await db.query(
      `INSERT INTO scraper_logs (platform, action, targetUsername, status, error, timestamp)
       VALUES ('soundcloud', 'profile_scrape', ?, 'error', ?, NOW())`,
      [username, error.message]
    );
    
    return null;
  }
}

/**
 * Search SoundCloud for DJs by genre
 */
export async function searchSoundCloudByGenre(genre: string, limit: number = 20): Promise<string[]> {
  try {
    await initBrowser();
    if (!session.page) throw new Error('Browser not initialized');
    
    await checkRateLimits();
    
    console.log(`🔍 Searching SoundCloud for genre: ${genre}`);
    
    const searchUrl = `https://soundcloud.com/search/people?q=${encodeURIComponent(genre + ' DJ')}`;
    await session.page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    await sleep(getRandomDelay(2000, 4000));
    await randomScroll(session.page);
    
    // Extract usernames from search results
    const usernames = await session.page.evaluate((maxResults) => {
      const results: string[] = [];
      const userLinks = document.querySelectorAll('a[href^="/"][href*="/"]');
      
      userLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Extract username from href (e.g., "/username")
        const match = href.match(/^\/([^\/]+)$/);
        if (match && match[1]) {
          const username = match[1];
          // Filter out non-user pages
          if (!['search', 'discover', 'you', 'stream', 'library', 'feed'].includes(username)) {
            if (!results.includes(username)) {
              results.push(username);
            }
          }
        }
      });
      
      return results.slice(0, maxResults);
    }, limit);
    
    updateActionCounters();
    
    console.log(`✅ Found ${usernames.length} profiles for genre: ${genre}`);
    
    return usernames;
    
  } catch (error: any) {
    console.error(`❌ Error searching genre ${genre}:`, error.message);
    return [];
  }
}

/**
 * Close browser
 */
export async function closeBrowser(): Promise<void> {
  if (session.browser) {
    await session.browser.close();
    session.browser = null;
    session.page = null;
    console.log('🔒 Browser closed');
  }
}

/**
 * Get session stats
 */
export function getSessionStats() {
  return {
    isActive: session.browser !== null,
    actionsThisHour: session.actionsThisHour,
    actionsToday: session.actionsToday,
    lastActionTime: session.lastActionTime,
    sessionDuration: Date.now() - session.sessionStartTime
  };
}
