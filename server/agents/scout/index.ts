/**
 * Agent Scout - Main Module
 * Discovers and evaluates DJ talent from Instagram and SoundCloud
 */

import { db } from '../db-helper';
import { ProfileData, TalentScore, ScoutResult } from '../types';
import { AGENT_CONFIG } from '../config';
import { 
  calculateTalentScore, 
  meetsQualificationThresholds,
  generateAINotes 
} from './scoring';
import { 
  searchInstagramByGenre, 
  scrapeInstagramProfile,
  isDJProfile,
  closeBrowser 
} from './instagram-scraper';
import {
  searchSoundCloudByGenre,
  scrapeSoundCloudProfile
} from './soundcloud-scraper';

/**
 * Main Scout function - discovers DJs for a specific genre
 */
export async function discoverDJsByGenre(
  genre: string,
  platform: 'instagram' | 'soundcloud' | 'both' = 'both',
  limit: number = 50
): Promise<ScoutResult> {
  const startTime = Date.now();
  const result: ScoutResult = {
    profilesScraped: 0,
    profilesQualified: 0,
    profilesSaved: 0,
    errors: 0,
    duration: 0
  };
  
  console.log(`🔍 Agent Scout: Starting discovery for genre "${genre}" on ${platform}`);
  
  try {
    let profiles: ProfileData[] = [];
    
    // Instagram discovery
    if (platform === 'instagram' || platform === 'both') {
      try {
        console.log(`Searching Instagram for ${genre}...`);
        const igUrls = await searchInstagramByGenre(genre, limit);
        
        for (const url of igUrls.slice(0, Math.min(igUrls.length, limit))) {
          try {
            const igData = await scrapeInstagramProfile(url);
            
            if (igData && isDJProfile(igData)) {
              profiles.push({
                instagram: igData,
                fullName: igData.fullName,
                primaryGenre: genre,
                secondaryGenres: [],
                bio: igData.bio,
                profileImageUrl: igData.profileImageUrl,
                instagramUrl: url
              });
              result.profilesScraped++;
            }
          } catch (error) {
            console.error(`Error scraping Instagram profile:`, error);
            result.errors++;
          }
        }
      } catch (error) {
        console.error(`Error in Instagram discovery:`, error);
        result.errors++;
      }
    }
    
    // SoundCloud discovery
    if (platform === 'soundcloud' || platform === 'both') {
      try {
        console.log(`Searching SoundCloud for ${genre}...`);
        const scUrls = await searchSoundCloudByGenre(genre, limit);
        
        for (const url of scUrls.slice(0, Math.min(scUrls.length, limit))) {
          try {
            const scData = await scrapeSoundCloudProfile(url);
            
            if (scData) {
              // Check if we already have this DJ from Instagram
              const existing = profiles.find(p => 
                p.fullName.toLowerCase() === scData.fullName.toLowerCase()
              );
              
              if (existing) {
                // Merge SoundCloud data with existing profile
                existing.soundcloud = scData;
                existing.soundcloudUrl = url;
                existing.secondaryGenres = scData.genres;
              } else {
                // New profile from SoundCloud only
                profiles.push({
                  soundcloud: scData,
                  fullName: scData.fullName,
                  primaryGenre: scData.genres[0] || genre,
                  secondaryGenres: scData.genres.slice(1),
                  bio: scData.bio,
                  profileImageUrl: scData.profileImageUrl,
                  soundcloudUrl: url
                });
              }
              result.profilesScraped++;
            }
          } catch (error) {
            console.error(`Error scraping SoundCloud profile:`, error);
            result.errors++;
          }
        }
      } catch (error) {
        console.error(`Error in SoundCloud discovery:`, error);
        result.errors++;
      }
    }
    
    // Score and save qualified profiles
    console.log(`Evaluating ${profiles.length} discovered profiles...`);
    
    for (const profile of profiles) {
      try {
        // Calculate talent score
        const scores = calculateTalentScore(profile);
        
        // Check if meets qualification thresholds
        const qualified = meetsQualificationThresholds(
          profile,
          scores,
          AGENT_CONFIG.scout.minTalentScore,
          AGENT_CONFIG.scout.minFollowers
        );
        
        if (qualified) {
          result.profilesQualified++;
          
          // Generate AI notes
          const aiNotes = generateAINotes(profile, scores);
          
          // Save to database
          await saveDJToDatabase(profile, scores, aiNotes);
          result.profilesSaved++;
          
          console.log(`✅ Qualified: ${profile.fullName} (Score: ${scores.talentScore.toFixed(1)})`);
        } else {
          console.log(`❌ Not qualified: ${profile.fullName} (Score: ${scores.talentScore.toFixed(1)})`);
        }
      } catch (error) {
        console.error(`Error processing profile ${profile.fullName}:`, error);
        result.errors++;
      }
    }
    
  } catch (error) {
    console.error(`Fatal error in Agent Scout:`, error);
    result.errors++;
  } finally {
    // Cleanup
    await closeBrowser();
  }
  
  result.duration = Date.now() - startTime;
  
  console.log(`
🎯 Agent Scout Results:
   Profiles Scraped: ${result.profilesScraped}
   Profiles Qualified: ${result.profilesQualified}
   Profiles Saved: ${result.profilesSaved}
   Errors: ${result.errors}
   Duration: ${(result.duration / 1000).toFixed(1)}s
  `);
  
  return result;
}

/**
 * Save discovered DJ to database
 */
async function saveDJToDatabase(
  profile: ProfileData,
  scores: TalentScore,
  aiNotes: string
): Promise<void> {
  // Check if DJ already exists
  const existing = await db.query(`
    SELECT id FROM discovered_djs 
    WHERE instagramUsername = ? OR soundcloudUsername = ?
  `, [
    profile.instagram?.username || null,
    profile.soundcloud?.username || null
  ]);
  
  if (existing.length > 0) {
    // Update existing record
    await db.query(`
      UPDATE discovered_djs SET
        talentScore = ?,
        engagementScore = ?,
        growthScore = ?,
        consistencyScore = ?,
        reachScore = ?,
        genreMatchScore = ?,
        lastScraped = NOW(),
        lastUpdated = NOW()
      WHERE id = ?
    `, [
      scores.talentScore,
      scores.engagementScore,
      scores.growthScore,
      scores.consistencyScore,
      scores.reachScore,
      scores.genreMatchScore,
      existing[0].id
    ]);
    
    console.log(`Updated existing DJ: ${profile.fullName}`);
  } else {
    // Insert new record
    await db.query(`
      INSERT INTO discovered_djs (
        instagramUsername, soundcloudUsername, fullName,
        instagramFollowers, instagramPostsCount, instagramAvgLikes, instagramAvgComments,
        instagramEngagementRate, instagramPostsPerWeek,
        soundcloudFollowers, soundcloudTracksCount, soundcloudTotalPlays,
        soundcloudAvgLikes, soundcloudAvgReposts, soundcloudEngagementRate, soundcloudUploadsPerMonth,
        talentScore, engagementScore, growthScore, consistencyScore, reachScore, genreMatchScore,
        primaryGenre, secondaryGenres,
        bio, profileImageUrl, instagramUrl, soundcloudUrl, aiNotes,
        discoveryStatus, lastScraped
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      profile.instagram?.username || null,
      profile.soundcloud?.username || null,
      profile.fullName,
      profile.instagram?.followers || null,
      profile.instagram?.postsCount || null,
      profile.instagram?.avgLikes || null,
      profile.instagram?.avgComments || null,
      profile.instagram?.engagementRate || null,
      profile.instagram?.postsPerWeek || null,
      profile.soundcloud?.followers || null,
      profile.soundcloud?.tracksCount || null,
      profile.soundcloud?.totalPlays || null,
      profile.soundcloud?.avgLikes || null,
      profile.soundcloud?.avgReposts || null,
      profile.soundcloud?.engagementRate || null,
      profile.soundcloud?.uploadsPerMonth || null,
      scores.talentScore,
      scores.engagementScore,
      scores.growthScore,
      scores.consistencyScore,
      scores.reachScore,
      scores.genreMatchScore,
      profile.primaryGenre,
      JSON.stringify(profile.secondaryGenres),
      profile.bio,
      profile.profileImageUrl,
      profile.instagramUrl || null,
      profile.soundcloudUrl || null,
      aiNotes,
      'discovered'
    ]);
    
    console.log(`Saved new DJ: ${profile.fullName}`);
  }
  
  // Save metrics snapshot
  const djId = existing.length > 0 ? existing[0].id : await getLastInsertId();
  
  await db.query(`
    INSERT INTO scout_metrics (
      djId, instagramFollowers, soundcloudFollowers,
      instagramEngagementRate, soundcloudEngagementRate
    ) VALUES (?, ?, ?, ?, ?)
  `, [
    djId,
    profile.instagram?.followers || null,
    profile.soundcloud?.followers || null,
    profile.instagram?.engagementRate || null,
    profile.soundcloud?.engagementRate || null
  ]);
}

/**
 * Get last inserted ID
 */
async function getLastInsertId(): Promise<number> {
  const result = await db.query('SELECT LAST_INSERT_ID() as id');
  return result[0].id;
}

/**
 * Run Agent Scout for all configured genres
 */
export async function runFullDiscovery(): Promise<void> {
  console.log('🚀 Agent Scout: Starting full discovery across all genres');
  
  const genres = AGENT_CONFIG.scout.genres;
  const totalResults: ScoutResult = {
    profilesScraped: 0,
    profilesQualified: 0,
    profilesSaved: 0,
    errors: 0,
    duration: 0
  };
  
  for (const genre of genres) {
    const result = await discoverDJsByGenre(
      genre,
      'both',
      AGENT_CONFIG.scout.maxProfilesPerRun
    );
    
    totalResults.profilesScraped += result.profilesScraped;
    totalResults.profilesQualified += result.profilesQualified;
    totalResults.profilesSaved += result.profilesSaved;
    totalResults.errors += result.errors;
    totalResults.duration += result.duration;
  }
  
  console.log(`
🎉 Full Discovery Complete:
   Total Profiles Scraped: ${totalResults.profilesScraped}
   Total Qualified: ${totalResults.profilesQualified}
   Total Saved: ${totalResults.profilesSaved}
   Total Errors: ${totalResults.errors}
   Total Duration: ${(totalResults.duration / 1000 / 60).toFixed(1)} minutes
  `);
}
