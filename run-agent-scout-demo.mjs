/**
 * Agent Scout Demo Operation
 * Populates database with discovered DJs for demonstration
 */

import { createConnection } from 'mysql2/promise';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create database connection
const db = await createConnection(process.env.DATABASE_URL);

// Sample DJ data with realistic metrics
const sampleDJs = [
  {
    username: 'djmarlboro_official',
    platform: 'instagram',
    fullName: 'DJ Marlboro',
    followers: 125000,
    following: 450,
    postsCount: 1200,
    avgLikes: 8500,
    avgComments: 320,
    recentPostsCount: 15,
    engagementRate: 0.0704, // 7.04%
    growthRate: 0.15, // 15% monthly
    postingFrequency: 4.5, // posts per week
    genre: 'Tech House',
    isVerified: false,
    isPrivate: false,
    biography: '🎧 Tech House DJ & Producer | Resident @ClubSpace Miami | Bookings: djmarlboro@agency.com',
    talentScore: 85
  },
  {
    username: 'luna_beats',
    platform: 'instagram',
    fullName: 'Luna Martinez',
    followers: 89000,
    following: 320,
    postsCount: 890,
    avgLikes: 6200,
    avgComments: 180,
    recentPostsCount: 12,
    engagementRate: 0.0717, // 7.17%
    growthRate: 0.22, // 22% monthly
    postingFrequency: 5.2,
    genre: 'Techno',
    isVerified: false,
    isPrivate: false,
    biography: '🔊 Techno DJ | Berlin based | Releases on @afterlife @drumcode',
    talentScore: 82
  },
  {
    username: 'carlos_underground',
    platform: 'soundcloud',
    fullName: 'Carlos Rivera',
    followers: 45000,
    following: 180,
    postsCount: 156,
    avgLikes: 1200,
    avgComments: 45,
    recentPostsCount: 8,
    engagementRate: 0.0277, // 2.77%
    growthRate: 0.18,
    postingFrequency: 2.1,
    genre: 'House',
    isVerified: false,
    isPrivate: false,
    biography: 'Deep House producer | SoundCloud exclusive mixes',
    talentScore: 72
  },
  {
    username: 'elektra_sounds',
    platform: 'instagram',
    fullName: 'Elektra',
    followers: 156000,
    following: 890,
    postsCount: 2100,
    avgLikes: 11000,
    avgComments: 450,
    recentPostsCount: 20,
    engagementRate: 0.0734, // 7.34%
    growthRate: 0.12,
    postingFrequency: 6.8,
    genre: 'EDM',
    isVerified: true,
    isPrivate: false,
    biography: '⚡ EDM DJ | Festival headliner | Management: @elektraofficial',
    talentScore: 91
  },
  {
    username: 'minimal_mike',
    platform: 'soundcloud',
    fullName: 'Mike Thompson',
    followers: 32000,
    following: 120,
    postsCount: 98,
    avgLikes: 890,
    avgComments: 32,
    recentPostsCount: 6,
    engagementRate: 0.0288, // 2.88%
    growthRate: 0.25,
    postingFrequency: 1.8,
    genre: 'Minimal',
    isVerified: false,
    isPrivate: false,
    biography: 'Minimal techno | Underground vibes',
    talentScore: 68
  },
  {
    username: 'sofia_melodic',
    platform: 'instagram',
    fullName: 'Sofia Andersson',
    followers: 198000,
    following: 560,
    postsCount: 1850,
    avgLikes: 14500,
    avgComments: 620,
    recentPostsCount: 18,
    engagementRate: 0.0763, // 7.63%
    growthRate: 0.19,
    postingFrequency: 5.5,
    genre: 'Melodic Techno',
    isVerified: true,
    isPrivate: false,
    biography: '🌙 Melodic Techno | Afterlife resident | Tour dates in bio',
    talentScore: 94
  },
  {
    username: 'bass_hunter_dj',
    platform: 'instagram',
    fullName: 'Alex Bass',
    followers: 67000,
    following: 290,
    postsCount: 780,
    avgLikes: 4800,
    avgComments: 150,
    recentPostsCount: 10,
    engagementRate: 0.0739, // 7.39%
    growthRate: 0.16,
    postingFrequency: 3.9,
    genre: 'Bass House',
    isVerified: false,
    isPrivate: false,
    biography: '🔥 Bass House | Festival DJ | Bookings open',
    talentScore: 76
  },
  {
    username: 'progressive_paul',
    platform: 'soundcloud',
    fullName: 'Paul Anderson',
    followers: 52000,
    following: 210,
    postsCount: 134,
    avgLikes: 1450,
    avgComments: 58,
    recentPostsCount: 9,
    engagementRate: 0.029, // 2.9%
    growthRate: 0.14,
    postingFrequency: 2.5,
    genre: 'Progressive House',
    isVerified: false,
    isPrivate: false,
    biography: 'Progressive House DJ & Producer',
    talentScore: 71
  },
  {
    username: 'trance_queen',
    platform: 'instagram',
    fullName: 'Emma Wilson',
    followers: 142000,
    following: 420,
    postsCount: 1560,
    avgLikes: 10200,
    avgComments: 380,
    recentPostsCount: 16,
    engagementRate: 0.0745, // 7.45%
    growthRate: 0.21,
    postingFrequency: 5.8,
    genre: 'Trance',
    isVerified: true,
    isPrivate: false,
    biography: '✨ Trance DJ | ASOT featured | Worldwide bookings',
    talentScore: 88
  },
  {
    username: 'dubstep_destroyer',
    platform: 'soundcloud',
    fullName: 'Jake Miller',
    followers: 38000,
    following: 150,
    postsCount: 112,
    avgLikes: 1050,
    avgComments: 42,
    recentPostsCount: 7,
    engagementRate: 0.0287, // 2.87%
    growthRate: 0.17,
    postingFrequency: 2.2,
    genre: 'Dubstep',
    isVerified: false,
    isPrivate: false,
    biography: 'Heavy dubstep producer | Bass music',
    talentScore: 69
  },
  {
    username: 'afro_house_vibes',
    platform: 'instagram',
    fullName: 'David Okoye',
    followers: 95000,
    following: 340,
    postsCount: 1020,
    avgLikes: 7100,
    avgComments: 240,
    recentPostsCount: 13,
    engagementRate: 0.0773, // 7.73%
    growthRate: 0.28,
    postingFrequency: 4.7,
    genre: 'Afro House',
    isVerified: false,
    isPrivate: false,
    biography: '🌍 Afro House DJ | Bringing African rhythms to the world',
    talentScore: 83
  },
  {
    username: 'deep_tech_sarah',
    platform: 'instagram',
    fullName: 'Sarah Chen',
    followers: 78000,
    following: 280,
    postsCount: 890,
    avgLikes: 5600,
    avgComments: 190,
    recentPostsCount: 11,
    engagementRate: 0.0742, // 7.42%
    growthRate: 0.19,
    postingFrequency: 4.2,
    genre: 'Deep Tech',
    isVerified: false,
    isPrivate: false,
    biography: '🎵 Deep Tech | Underground sounds | Asia tour 2026',
    talentScore: 79
  },
  {
    username: 'hardstyle_hero',
    platform: 'soundcloud',
    fullName: 'Marco van Berg',
    followers: 61000,
    following: 190,
    postsCount: 145,
    avgLikes: 1680,
    avgComments: 67,
    recentPostsCount: 8,
    engagementRate: 0.0286, // 2.86%
    growthRate: 0.13,
    postingFrequency: 2.3,
    genre: 'Hardstyle',
    isVerified: false,
    isPrivate: false,
    biography: 'Hardstyle DJ | Defqon.1 veteran',
    talentScore: 74
  },
  {
    username: 'future_house_felix',
    platform: 'instagram',
    fullName: 'Felix Rodriguez',
    followers: 112000,
    following: 380,
    postsCount: 1340,
    avgLikes: 8300,
    avgComments: 290,
    recentPostsCount: 14,
    engagementRate: 0.0767, // 7.67%
    growthRate: 0.20,
    postingFrequency: 5.1,
    genre: 'Future House',
    isVerified: false,
    isPrivate: false,
    biography: '🚀 Future House | Spinnin Records artist',
    talentScore: 84
  },
  {
    username: 'ambient_aurora',
    platform: 'soundcloud',
    fullName: 'Aurora Lights',
    followers: 28000,
    following: 95,
    postsCount: 76,
    avgLikes: 780,
    avgComments: 28,
    recentPostsCount: 5,
    engagementRate: 0.0288, // 2.88%
    growthRate: 0.11,
    postingFrequency: 1.5,
    genre: 'Ambient',
    isVerified: false,
    isPrivate: false,
    biography: 'Ambient & downtempo producer',
    talentScore: 64
  }
];

async function populateDatabase() {
  console.log('🤖 Agent Scout - Demo Operation');
  console.log('='.repeat(60));
  console.log('');
  
  try {
    console.log('📊 Inserting discovered DJs into database...');
    
    for (const dj of sampleDJs) {
      const now = new Date();
      
      await db.execute(`
        INSERT INTO discovered_djs (
          username, platform, full_name, followers, following, posts_count,
          avg_likes, avg_comments, recent_posts_count, engagement_rate,
          growth_rate, posting_frequency, genre, is_verified, is_private,
          biography, talent_score, discovered_at, last_updated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          followers = VALUES(followers),
          following = VALUES(following),
          posts_count = VALUES(posts_count),
          avg_likes = VALUES(avg_likes),
          avg_comments = VALUES(avg_comments),
          engagement_rate = VALUES(engagement_rate),
          talent_score = VALUES(talent_score),
          last_updated = VALUES(last_updated)
      `, [
        dj.username,
        dj.platform,
        dj.fullName,
        dj.followers,
        dj.following,
        dj.postsCount,
        dj.avgLikes,
        dj.avgComments,
        dj.recentPostsCount,
        dj.engagementRate,
        dj.growthRate,
        dj.postingFrequency,
        dj.genre,
        dj.isVerified ? 1 : 0,
        dj.isPrivate ? 1 : 0,
        dj.biography,
        dj.talentScore,
        now,
        now
      ]);
      
      console.log(`   ✅ ${dj.username} (${dj.platform}) - Talent Score: ${dj.talentScore}`);
    }
    
    console.log('');
    console.log('='.repeat(60));
    console.log('✅ Agent Scout operation completed successfully!');
    console.log('');
    console.log(`📊 Summary:`);
    console.log(`   Total DJs discovered: ${sampleDJs.length}`);
    console.log(`   Instagram profiles: ${sampleDJs.filter(d => d.platform === 'instagram').length}`);
    console.log(`   SoundCloud profiles: ${sampleDJs.filter(d => d.platform === 'soundcloud').length}`);
    console.log(`   Average Talent Score: ${(sampleDJs.reduce((sum, d) => sum + d.talentScore, 0) / sampleDJs.length).toFixed(1)}`);
    console.log(`   High Priority (Score ≥ 80): ${sampleDJs.filter(d => d.talentScore >= 80).length}`);
    console.log('');
    console.log('🎯 View results at: /agents');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error during operation:', error);
    throw error;
  }
}

// Run operation
populateDatabase()
  .then(() => {
    console.log('✅ Operation completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Operation failed:', error);
    process.exit(1);
  });
