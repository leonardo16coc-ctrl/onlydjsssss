import axios from "axios";
import * as cheerio from "cheerio";
import { getDb } from "../db";
import { discoveredDjs } from "../../drizzle/schema-agents";
import { eq } from "drizzle-orm";

/**
 * Geonode Proxy Configuration
 * Uses residential proxies to avoid detection
 */
const GEONODE_USERNAME = process.env.GEONODE_USERNAME;
const GEONODE_PASSWORD = process.env.GEONODE_PASSWORD;
const GEONODE_PROXY = `http://${GEONODE_USERNAME}:${GEONODE_PASSWORD}@premium-residential.geonode.com:9000`;

/**
 * SoundCloud Scout Agent
 * Searches for DJs by genre and saves them as discovered leads
 */
export class SoundCloudScout {
  private proxy: string;

  constructor() {
    if (!GEONODE_USERNAME || !GEONODE_PASSWORD) {
      throw new Error("Geonode credentials not configured");
    }
    this.proxy = GEONODE_PROXY;
    console.log("[SoundCloud Scout] ✅ Initialized with Geonode proxies");
  }

  /**
   * Search for DJs by genre
   */
  async searchByGenre(genre: string, limit: number = 20): Promise<void> {
    console.log(`[SoundCloud Scout] 🔍 Searching for ${genre} DJs (limit: ${limit})`);

    try {
      // SoundCloud search URL
      const searchUrl = `https://soundcloud.com/search/people?q=${encodeURIComponent(genre + " DJ")}`;

      // Fetch with proxy
      const response = await axios.get(searchUrl, {
        proxy: this.parseProxy(),
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
        timeout: 30000,
      });

      // Parse HTML
      const $ = cheerio.load(response.data);

      // Extract DJ profiles
      const profiles: any[] = [];
      $('li[class*="searchList__item"]').each((i: number, elem: any) => {
        if (profiles.length >= limit) return false;

        const $elem = $(elem);
        const name = $elem.find('a[class*="soundTitle__username"]').text().trim();
        const profileUrl = $elem.find('a[class*="soundTitle__username"]').attr('href');
        const followersText = $elem.find('span[class*="sc-ministats-followers"]').text().trim();
        const tracksText = $elem.find('span[class*="sc-ministats-sounds"]').text().trim();

        if (name && profileUrl) {
          profiles.push({
            soundcloudUsername: name,
            soundcloudUrl: `https://soundcloud.com${profileUrl}`,
            soundcloudFollowers: this.parseNumber(followersText),
            soundcloudTracksCount: this.parseNumber(tracksText),
            primaryGenre: genre,
          });
        }
      });

      console.log(`[SoundCloud Scout] ✅ Found ${profiles.length} profiles`);

      // Save to database
      await this.saveDiscoveredDJs(profiles);

    } catch (error: any) {
      console.error(`[SoundCloud Scout] ❌ Error searching ${genre}:`, error.message);
      throw error;
    }
  }

  /**
   * Parse number from text like "1.2K" or "500"
   */
  private parseNumber(text: string): number {
    if (!text) return 0;

    const match = text.match(/([\d.]+)([KM])?/i);
    if (!match) return 0;

    const num = parseFloat(match[1]);
    const multiplier = match[2]?.toUpperCase();

    if (multiplier === 'K') return Math.floor(num * 1000);
    if (multiplier === 'M') return Math.floor(num * 1000000);
    return Math.floor(num);
  }

  /**
   * Parse proxy URL into axios format
   */
  private parseProxy() {
    const url = new URL(this.proxy);
    return {
      protocol: url.protocol.replace(':', ''),
      host: url.hostname,
      port: parseInt(url.port),
      auth: {
        username: url.username,
        password: url.password,
      },
    };
  }

  /**
   * Save discovered DJs to database
   */
  private async saveDiscoveredDJs(profiles: any[]): Promise<void> {
    const db = await getDb();
    if (!db) {
      console.error("[SoundCloud Scout] ❌ Database not available");
      return;
    }

    for (const profile of profiles) {
      try {
        // Check if DJ already exists by SoundCloud URL
        const existing = await db
          .select()
          .from(discoveredDjs)
          .where(eq(discoveredDjs.soundcloudUrl, profile.soundcloudUrl))
          .limit(1);

        if (existing.length > 0) {
          console.log(`[SoundCloud Scout] ⏭️  DJ already exists: ${profile.soundcloudUsername}`);
          continue;
        }

        // Calculate initial scores
        const talentScore = this.calculateTalentScore(profile);
        const reachScore = this.calculateReachScore(profile);

        // Insert new discovered DJ
        await db.insert(discoveredDjs).values({
          soundcloudUsername: profile.soundcloudUsername,
          soundcloudUrl: profile.soundcloudUrl,
          soundcloudFollowers: profile.soundcloudFollowers,
          soundcloudTracksCount: profile.soundcloudTracksCount,
          primaryGenre: profile.primaryGenre,
          talentScore,
          reachScore,
          discoveryStatus: "discovered",
          lastScraped: new Date(),
        });

        console.log(`[SoundCloud Scout] ✅ Saved: ${profile.soundcloudUsername} (${profile.soundcloudFollowers} followers, score: ${talentScore})`);
      } catch (error: any) {
        console.error(`[SoundCloud Scout] ❌ Error saving ${profile.soundcloudUsername}:`, error.message);
      }
    }
  }

  /**
   * Calculate talent score based on metrics
   */
  private calculateTalentScore(profile: any): string {
    let score = 0;

    // Followers weight (max 40 points)
    if (profile.soundcloudFollowers > 50000) score += 40;
    else if (profile.soundcloudFollowers > 10000) score += 30;
    else if (profile.soundcloudFollowers > 1000) score += 20;
    else score += 10;

    // Tracks count weight (max 30 points)
    if (profile.soundcloudTracksCount > 50) score += 30;
    else if (profile.soundcloudTracksCount > 20) score += 20;
    else if (profile.soundcloudTracksCount > 5) score += 10;

    // Engagement rate estimation (max 30 points) - placeholder for now
    score += 15;

    return score.toFixed(2);
  }

  /**
   * Calculate reach score based on followers
   */
  private calculateReachScore(profile: any): string {
    let score = 0;

    if (profile.soundcloudFollowers > 100000) score = 100;
    else if (profile.soundcloudFollowers > 50000) score = 80;
    else if (profile.soundcloudFollowers > 10000) score = 60;
    else if (profile.soundcloudFollowers > 1000) score = 40;
    else score = 20;

    return score.toFixed(2);
  }

  /**
   * Run scout for multiple genres
   */
  async runMultiGenre(genres: string[], limitPerGenre: number = 10): Promise<void> {
    console.log(`[SoundCloud Scout] 🚀 Running multi-genre search for: ${genres.join(", ")}`);

    for (const genre of genres) {
      try {
        await this.searchByGenre(genre, limitPerGenre);
        // Wait 2-5 seconds between searches to avoid rate limiting
        await this.sleep(2000 + Math.random() * 3000);
      } catch (error: any) {
        console.error(`[SoundCloud Scout] ❌ Failed for genre ${genre}:`, error.message);
        continue;
      }
    }

    console.log("[SoundCloud Scout] ✅ Multi-genre search completed");
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * CLI usage example:
 * 
 * import { SoundCloudScout } from "./server/scouts/soundcloud-scout";
 * 
 * const scout = new SoundCloudScout();
 * await scout.runMultiGenre(["Tech House", "Techno", "Bass House"], 20);
 */
