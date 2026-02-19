/**
 * Scraper Configuration
 * Settings for controlled scraping with anti-detection measures
 */

export const SCRAPER_CONFIG = {
  // Rate Limiting (EXTREMELY CONSERVATIVE)
  rateLimit: {
    actionsPerHour: 10, // Maximum 10 actions per hour
    actionsPerDay: 50, // Maximum 50 actions per day
    minDelayBetweenActions: 30000, // 30 seconds minimum
    maxDelayBetweenActions: 120000, // 120 seconds maximum
    cooldownAfterError: 300000, // 5 minutes cooldown after error
    cooldownAfterBan: 86400000 // 24 hours cooldown after ban detection
  },
  
  // Proxy Configuration
  proxy: {
    enabled: false, // Set to true when proxies are configured
    type: 'residential' as 'residential' | 'datacenter',
    rotationInterval: 3600000, // Rotate proxy every hour
    // Proxy list should be provided via environment variables
    // Format: PROXY_LIST=http://user:pass@host1:port,http://user:pass@host2:port
  },
  
  // Browser Configuration
  browser: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--window-size=1920,1080'
    ],
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1
    }
  },
  
  // Anti-Detection Measures
  antiDetection: {
    randomizeUserAgent: true,
    randomizeViewport: true,
    randomizeTimezone: true,
    randomizeLocale: true,
    simulateHumanBehavior: true,
    randomMouseMovements: true,
    randomScrolling: true,
    randomTypingSpeed: true
  },
  
  // Session Management
  session: {
    persistCookies: true,
    cookiesPath: '/home/ubuntu/onlydjs-scraper-sessions',
    sessionTimeout: 3600000, // 1 hour
    maxSessionAge: 86400000 // 24 hours
  },
  
  // Error Handling
  errorHandling: {
    maxRetries: 3,
    retryDelay: 60000, // 1 minute
    captchaDetection: true,
    banDetection: true,
    autoRecovery: true
  },
  
  // Instagram Specific
  instagram: {
    loginRequired: true, // Some actions require login
    maxFollowsPerSession: 5,
    maxLikesPerSession: 10,
    maxCommentsPerSession: 3,
    maxDMsPerSession: 5,
    maxProfileViewsPerSession: 20
  },
  
  // SoundCloud Specific
  soundcloud: {
    loginRequired: false, // Most data accessible without login
    maxProfileViewsPerSession: 30,
    maxTrackPlaysPerSession: 20
  }
};

/**
 * User Agent Pool
 * Realistic user agents for different platforms
 */
export const USER_AGENTS = [
  // Chrome on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  // Chrome on Mac
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  // Firefox on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0',
  // Safari on Mac
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15'
];

/**
 * Viewport Variations
 * Common screen resolutions
 */
export const VIEWPORTS = [
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
  { width: 1536, height: 864 },
  { width: 1440, height: 900 },
  { width: 2560, height: 1440 }
];

/**
 * Timezones
 */
export const TIMEZONES = [
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'Europe/London',
  'Europe/Paris',
  'America/Toronto'
];

/**
 * Locales
 */
export const LOCALES = [
  'en-US',
  'en-GB',
  'en-CA'
];

/**
 * Get random item from array
 */
export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get random delay within range
 */
export function getRandomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Simulate human-like typing
 */
export async function humanType(page: any, selector: string, text: string): Promise<void> {
  await page.click(selector);
  for (const char of text) {
    await page.keyboard.type(char);
    await sleep(getRandomDelay(50, 150)); // Random delay between keystrokes
  }
}

/**
 * Simulate human-like mouse movement
 */
export async function humanMouseMove(page: any, x: number, y: number): Promise<void> {
  const steps = getRandomDelay(10, 20);
  await page.mouse.move(x, y, { steps });
}

/**
 * Simulate random scrolling
 */
export async function randomScroll(page: any): Promise<void> {
  const scrollAmount = getRandomDelay(100, 500);
  await page.evaluate((amount: number) => {
    window.scrollBy(0, amount);
  }, scrollAmount);
  await sleep(getRandomDelay(500, 1500));
}
