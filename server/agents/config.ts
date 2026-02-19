/**
 * Agent System Configuration
 * Central configuration for all autonomous agents
 */

export const AGENT_CONFIG = {
  scout: {
    enabled: true,
    schedule: '0 */6 * * *', // Every 6 hours
    platforms: ['instagram', 'soundcloud'] as const,
    
    // Priority genres to search for
    genres: [
      'Tech House',
      'Bass House', 
      'Afro House',
      'Techno',
      'Melodic Techno',
      'Big Room',
      'EDM',
      'Hard Techno'
    ],
    
    // Minimum thresholds for qualification
    minFollowers: {
      instagram: 5000,
      soundcloud: 1000
    },
    
    minTalentScore: 60,
    maxProfilesPerRun: 100,
    
    // Rate limiting
    rateLimits: {
      instagram: {
        requestsPerMinute: 10,
        delayBetweenRequests: [3000, 7000] // Random delay between 3-7 seconds
      },
      soundcloud: {
        requestsPerMinute: 20,
        delayBetweenRequests: [1000, 3000]
      }
    }
  },
  
  closer: {
    enabled: false, // Will be enabled in Phase 2
    platforms: ['instagram', 'soundcloud'] as const,
    accounts: {
      instagram: [],
      soundcloud: []
    },
    rateLimits: {
      instagram: { perHour: 10, perDay: 50 },
      soundcloud: { perHour: 20, perDay: 100 }
    },
    followUpSequence: [
      { delay: 3, type: 'follow_up_1' },
      { delay: 7, type: 'follow_up_2' }
    ]
  },
  
  monetizer: {
    enabled: false, // Will be enabled in Phase 3
    schedule: '0 6 * * *', // Daily at 6 AM
    thresholds: {
      upsell: {
        minDownloads: 100,
        minRevenue: 200,
        minTracks: 10
      },
      pricingAdjustment: {
        minDownloadsPerDay: 5,
        maxCurrentPrice: 2.99
      },
      churnRisk: {
        minScore: 70
      }
    }
  }
} as const;

// Genre hashtags mapping for Instagram discovery
export const GENRE_HASHTAGS: Record<string, string[]> = {
  'Tech House': ['techhouse', 'techhousemusic', 'techhousedj', 'djlife'],
  'Bass House': ['basshouse', 'basshousemusic', 'bassmusic'],
  'Afro House': ['afrohouse', 'afrohousemusic', 'africanhouse'],
  'Techno': ['techno', 'technomusic', 'technodj', 'undergroundtechno'],
  'Melodic Techno': ['melodictechno', 'melodichouse', 'progressivehouse'],
  'Big Room': ['bigroom', 'bigroomhouse', 'festivalmusic'],
  'EDM': ['edm', 'edmlife', 'edmfestival', 'electronicmusic'],
  'Hard Techno': ['hardtechno', 'hardtechnomusic', 'industrialtechno']
};

// Priority genres (get higher genre match score)
export const PRIORITY_GENRES = [
  'Tech House',
  'Bass House',
  'Afro House',
  'Techno',
  'Melodic Techno',
  'Big Room',
  'EDM',
  'Hard Techno'
];

// Redis configuration
export const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
};

// Puppeteer configuration for scraping
export const PUPPETEER_CONFIG = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu'
  ],
  defaultViewport: {
    width: 1920,
    height: 1080
  }
};

// User agents for rotation
export const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0'
];
