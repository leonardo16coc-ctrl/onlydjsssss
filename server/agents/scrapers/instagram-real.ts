/**
 * Instagram Real Scraper with Puppeteer
 * WARNING: This violates Instagram Terms of Service
 * Use at your own risk - accounts may be banned
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
  humanType,
  randomScroll
} from './config';
import { db } from '../db-helper';
import { proxyManager } from './proxy-manager';
import * as fs from 'fs';
import * as path from 'path';

// Add stealth plugin
puppeteer.use(StealthPlugin());

interface InstagramProfile {
  username: string;
  fullName: string | null;
  biography: string | null;
  followers: number;
  following: number;
  postsCount: number;
  isVerified: boolean;
  isPrivate: boolean;
  profilePicUrl: string | null;
  externalUrl: string | null;
  recentPosts: Array<{
    likes: number;
    comments: number;
    timestamp: Date;
  }>;
}

interface ScraperSession {
  browser: Browser | null;
  page: Page | null;
  isLoggedIn: boolean;
  lastActionTime: number;
  actionsThisHour: number;
  actionsToday: number;
  sessionStartTime: number;
}

let session: ScraperSession = {
  browser: null,
  page: null,
  isLoggedIn: false,
  lastActionTime: 0,
  actionsThisHour: 0,
  actionsToday: 0,
  sessionStartTime: Date.now()
};

/**
 * Initialize browser with anti-detection measures
 */
async function initBrowser(): Promise<void> {
  if (session.browser) {
    return; // Already initialized
  }
  
  console.log('🌐 Initializing Instagram scraper browser...');
  
  const userAgent = getRandomItem(USER_AGENTS);
  const viewport = getRandomItem(VIEWPORTS);
  
  // Get proxy configuration
  const proxyUrl = proxyManager.getProxyUrlWithSession();
  const launchArgs = [...SCRAPER_CONFIG.browser.args];
  
  if (proxyUrl) {
    launchArgs.push(`--proxy-server=${proxyUrl}`);
    console.log(`🔒 Using proxy: ${proxyManager.getCurrentProvider()}`);
  } else {
    console.warn('⚠️  No proxy configured - HIGH RISK OF BAN');
  }
  
  session.browser = await puppeteer.launch({
    headless: SCRAPER_CONFIG.browser.headless,
    args: launchArgs,
    defaultViewport: viewport
  });
  
  session.page = await session.browser.newPage();
  
  // Set user agent
  await session.page.setUserAgent(userAgent);
  
  // Set extra headers
  await session.page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
  });
  
  // Load cookies if available
  await loadCookies();
  
  console.log('✅ Browser initialized');
}

/**
 * Check rate limits before action
 */
async function checkRateLimits(): Promise<void> {
  const now = Date.now();
  const hourAgo = now - 3600000;
  const dayAgo = now - 86400000;
  
  // Reset hourly counter
  if (session.lastActionTime < hourAgo) {
    session.actionsThisHour = 0;
  }
  
  // Reset daily counter
  if (session.sessionStartTime < dayAgo) {
    session.actionsToday = 0;
    session.sessionStartTime = now;
  }
  
  // Check limits
  if (session.actionsThisHour >= SCRAPER_CONFIG.rateLimit.actionsPerHour) {
    const waitTime = 3600000 - (now - session.lastActionTime);
    console.log(`⏳ Hourly rate limit reached. Waiting ${Math.ceil(waitTime / 60000)} minutes...`);
    await sleep(waitTime);
    session.actionsThisHour = 0;
  }
  
  if (session.actionsToday >= SCRAPER_CONFIG.rateLimit.actionsPerDay) {
    throw new Error('Daily rate limit reached. Please try again tomorrow.');
  }
  
  // Random delay between actions
  const timeSinceLastAction = now - session.lastActionTime;
  if (timeSinceLastAction < SCRAPER_CONFIG.rateLimit.minDelayBetweenActions) {
    const delay = SCRAPER_CONFIG.rateLimit.minDelayBetweenActions - timeSinceLastAction;
    console.log(`⏳ Waiting ${Math.ceil(delay / 1000)} seconds before next action...`);
    await sleep(delay);
  }
  
  // Additional random delay
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
 * Detect if banned or rate limited
 */
async function detectBan(): Promise<boolean> {
  if (!session.page) return false;
  
  const content = await session.page.content();
  
  // Check for common ban indicators
  const banIndicators = [
    'Try Again Later',
    'We restrict certain activity',
    'Action Blocked',
    'temporarily blocked',
    'unusual activity'
  ];
  
  for (const indicator of banIndicators) {
    if (content.includes(indicator)) {
      console.log(`🚫 BAN DETECTED: ${indicator}`);
      
      // Log ban to database
      await db.query(
        `INSERT INTO scraper_logs (platform, action, status, error, timestamp)
         VALUES ('instagram', 'ban_detected', 'error', ?, NOW())`,
        [indicator]
      );
      
      return true;
    }
  }
  
  return false;
}

/**
 * Load cookies from file
 */
async function loadCookies(): Promise<void> {
  if (!session.page) return;
  
  const cookiesPath = path.join(SCRAPER_CONFIG.session.cookiesPath, 'instagram-cookies.json');
  
  if (fs.existsSync(cookiesPath)) {
    const cookies = JSON.parse(fs.readFileSync(cookiesPath, 'utf-8'));
    await session.page.setCookie(...cookies);
    console.log('🍪 Cookies loaded');
  }
}

/**
 * Save cookies to file
 */
async function saveCookies(): Promise<void> {
  if (!session.page) return;
  
  const cookies = await session.page.cookies();
  const cookiesPath = path.join(SCRAPER_CONFIG.session.cookiesPath, 'instagram-cookies.json');
  
  // Create directory if not exists
  const dir = path.dirname(cookiesPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));
  console.log('🍪 Cookies saved');
}

/**
 * Login to Instagram (if credentials provided)
 */
export async function loginInstagram(username: string, password: string): Promise<boolean> {
  try {
    await initBrowser();
    if (!session.page) throw new Error('Browser not initialized');
    
    console.log(`🔐 Logging in to Instagram as @${username}...`);
    
    await session.page.goto('https://www.instagram.com/accounts/login/', {
      waitUntil: 'networkidle2'
    });
    
    await sleep(getRandomDelay(2000, 4000));
    
    // Type username
    await humanType(session.page, 'input[name="username"]', username);
    await sleep(getRandomDelay(500, 1500));
    
    // Type password
    await humanType(session.page, 'input[name="password"]', password);
    await sleep(getRandomDelay(500, 1500));
    
    // Click login button
    await session.page.click('button[type="submit"]');
    
    // Wait for navigation
    await session.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
    
    // Check if login successful
    const url = session.page.url();
    if (url.includes('/accounts/login/')) {
      console.log('❌ Login failed');
      return false;
    }
    
    // Save cookies
    await saveCookies();
    
    session.isLoggedIn = true;
    console.log('✅ Login successful');
    
    return true;
    
  } catch (error) {
    console.error('❌ Login error:', error);
    return false;
  }
}

/**
 * Scrape Instagram profile
 */
export async function scrapeInstagramProfile(username: string): Promise<InstagramProfile | null> {
  try {
    await initBrowser();
    if (!session.page) throw new Error('Browser not initialized');
    
    // Check rate limits
    await checkRateLimits();
    
    console.log(`🔍 Scraping Instagram profile: @${username}`);
    
    const url = `https://www.instagram.com/${username}/`;
    await session.page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Check for ban
    if (await detectBan()) {
      throw new Error('Account banned or rate limited');
    }
    
    // Random scroll to simulate human behavior
    await randomScroll(session.page);
    await sleep(getRandomDelay(1000, 3000));
    
    // Extract profile data from page
    const profileData = await session.page.evaluate(() => {
      // Try to find JSON data in script tags
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      for (const script of scripts) {
        try {
          const data = JSON.parse(script.textContent || '{}');
          if (data['@type'] === 'ProfilePage') {
            return data;
          }
        } catch (e) {
          // Continue
        }
      }
      
      // Fallback: parse from meta tags and visible elements
      const getMetaContent = (property: string) => {
        const meta = document.querySelector(`meta[property="${property}"]`);
        return meta ? meta.getAttribute('content') : null;
      };
      
      return {
        username: getMetaContent('og:title')?.split('(@')[1]?.split(')')[0] || null,
        fullName: getMetaContent('og:title')?.split('(')[0]?.trim() || null,
        biography: getMetaContent('og:description') || null,
        profilePicUrl: getMetaContent('og:image') || null
      };
    });
    
    // Update counters
    updateActionCounters();
    
    // Log action
    await db.query(
      `INSERT INTO scraper_logs (platform, action, targetUsername, status, timestamp)
       VALUES ('instagram', 'profile_scrape', ?, 'success', NOW())`,
      [username]
    );
    
    console.log(`✅ Profile scraped: @${username}`);
    
    // Note: This is a simplified version. Real implementation would need to:
    // 1. Parse follower/following counts from page
    // 2. Scrape recent posts
    // 3. Calculate engagement rate
    // 4. Handle private accounts
    // 5. Handle verification badge
    
    return {
      username: profileData.username || username,
      fullName: profileData.fullName,
      biography: profileData.biography,
      followers: 0, // Would need to parse from page
      following: 0,
      postsCount: 0,
      isVerified: false,
      isPrivate: false,
      profilePicUrl: profileData.profilePicUrl,
      externalUrl: null,
      recentPosts: []
    };
    
  } catch (error: any) {
    console.error(`❌ Error scraping @${username}:`, error.message);
    
    // Log error
    await db.query(
      `INSERT INTO scraper_logs (platform, action, targetUsername, status, error, timestamp)
       VALUES ('instagram', 'profile_scrape', ?, 'error', ?, NOW())`,
      [username, error.message]
    );
    
    return null;
  }
}

/**
 * Close browser session
 */
export async function closeBrowser(): Promise<void> {
  if (session.browser) {
    await session.browser.close();
    session.browser = null;
    session.page = null;
    session.isLoggedIn = false;
    console.log('🔒 Browser closed');
  }
}

/**
 * Get session stats
 */
export function getSessionStats() {
  return {
    isActive: session.browser !== null,
    isLoggedIn: session.isLoggedIn,
    actionsThisHour: session.actionsThisHour,
    actionsToday: session.actionsToday,
    lastActionTime: session.lastActionTime,
    sessionDuration: Date.now() - session.sessionStartTime
  };
}
