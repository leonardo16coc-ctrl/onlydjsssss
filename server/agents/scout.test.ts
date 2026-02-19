/**
 * Tests for Agent Scout
 */

import { describe, it, expect } from 'vitest';
import { calculateTalentScore, meetsQualificationThresholds, generateAINotes } from './scout/scoring';
import { ProfileData, TalentScore } from './types';

describe('Agent Scout - Talent Scoring', () => {
  describe('calculateTalentScore', () => {
    it('should calculate talent score for Instagram-only profile', () => {
      const profile: ProfileData = {
        instagram: {
          username: 'testdj',
          fullName: 'Test DJ',
          bio: 'Tech House DJ',
          profileImageUrl: 'https://example.com/image.jpg',
          followers: 10000,
          postsCount: 100,
          avgLikes: 500,
          avgComments: 50,
          engagementRate: 0.055, // 5.5% engagement
          postsPerWeek: 3,
          recentPosts: []
        },
        fullName: 'Test DJ',
        primaryGenre: 'Tech House',
        secondaryGenres: [],
        bio: 'Tech House DJ',
        profileImageUrl: 'https://example.com/image.jpg',
        instagramUrl: 'https://instagram.com/testdj'
      };
      
      const scores = calculateTalentScore(profile);
      
      expect(scores.talentScore).toBeGreaterThan(0);
      expect(scores.talentScore).toBeLessThanOrEqual(100);
      expect(scores.engagementScore).toBeGreaterThan(0);
      expect(scores.reachScore).toBeGreaterThan(0);
      expect(scores.genreMatchScore).toBe(100); // Tech House is priority genre
    });
    
    it('should calculate talent score for SoundCloud-only profile', () => {
      const profile: ProfileData = {
        soundcloud: {
          username: 'testdj',
          fullName: 'Test DJ',
          bio: 'Techno Producer',
          profileImageUrl: 'https://example.com/image.jpg',
          followers: 5000,
          tracksCount: 50,
          totalPlays: 100000,
          avgLikes: 100,
          avgReposts: 20,
          engagementRate: 0.024, // 2.4% engagement
          uploadsPerMonth: 2,
          recentTracks: [],
          genres: ['Techno', 'Melodic Techno']
        },
        fullName: 'Test DJ',
        primaryGenre: 'Techno',
        secondaryGenres: ['Melodic Techno'],
        bio: 'Techno Producer',
        profileImageUrl: 'https://example.com/image.jpg',
        soundcloudUrl: 'https://soundcloud.com/testdj'
      };
      
      const scores = calculateTalentScore(profile);
      
      expect(scores.talentScore).toBeGreaterThan(0);
      expect(scores.talentScore).toBeLessThanOrEqual(100);
      expect(scores.engagementScore).toBeGreaterThan(0);
      expect(scores.reachScore).toBeGreaterThan(0);
      expect(scores.genreMatchScore).toBe(100); // Techno is priority genre
    });
    
    it('should calculate higher score for multi-platform profile', () => {
      const profile: ProfileData = {
        instagram: {
          username: 'testdj',
          fullName: 'Test DJ',
          bio: 'Tech House DJ',
          profileImageUrl: 'https://example.com/image.jpg',
          followers: 50000,
          postsCount: 200,
          avgLikes: 2500,
          avgComments: 250,
          engagementRate: 0.055,
          postsPerWeek: 4,
          recentPosts: []
        },
        soundcloud: {
          username: 'testdj',
          fullName: 'Test DJ',
          bio: 'Tech House Producer',
          profileImageUrl: 'https://example.com/image.jpg',
          followers: 10000,
          tracksCount: 100,
          totalPlays: 500000,
          avgLikes: 200,
          avgReposts: 50,
          engagementRate: 0.025,
          uploadsPerMonth: 3,
          recentTracks: [],
          genres: ['Tech House', 'Bass House']
        },
        fullName: 'Test DJ',
        primaryGenre: 'Tech House',
        secondaryGenres: ['Bass House'],
        bio: 'Tech House DJ & Producer',
        profileImageUrl: 'https://example.com/image.jpg',
        instagramUrl: 'https://instagram.com/testdj',
        soundcloudUrl: 'https://soundcloud.com/testdj'
      };
      
      const scores = calculateTalentScore(profile);
      
      expect(scores.talentScore).toBeGreaterThan(60); // Should qualify
      expect(scores.engagementScore).toBeGreaterThan(50);
      expect(scores.reachScore).toBeGreaterThan(50);
    });
    
    it('should give lower score for non-priority genre', () => {
      const profile: ProfileData = {
        instagram: {
          username: 'testdj',
          fullName: 'Test DJ',
          bio: 'Hip Hop DJ',
          profileImageUrl: 'https://example.com/image.jpg',
          followers: 10000,
          postsCount: 100,
          avgLikes: 500,
          avgComments: 50,
          engagementRate: 0.055,
          postsPerWeek: 3,
          recentPosts: []
        },
        fullName: 'Test DJ',
        primaryGenre: 'Hip Hop', // Not in priority genres
        secondaryGenres: [],
        bio: 'Hip Hop DJ',
        profileImageUrl: 'https://example.com/image.jpg',
        instagramUrl: 'https://instagram.com/testdj'
      };
      
      const scores = calculateTalentScore(profile);
      
      expect(scores.genreMatchScore).toBe(50); // Non-priority genre
    });
  });
  
  describe('meetsQualificationThresholds', () => {
    it('should qualify profile with high talent score and sufficient followers', () => {
      const profile: ProfileData = {
        instagram: {
          username: 'testdj',
          fullName: 'Test DJ',
          bio: 'Tech House DJ',
          profileImageUrl: 'https://example.com/image.jpg',
          followers: 10000, // Above min threshold (5000)
          postsCount: 100,
          avgLikes: 500,
          avgComments: 50,
          engagementRate: 0.055,
          postsPerWeek: 3,
          recentPosts: []
        },
        fullName: 'Test DJ',
        primaryGenre: 'Tech House',
        secondaryGenres: [],
        bio: 'Tech House DJ',
        profileImageUrl: 'https://example.com/image.jpg',
        instagramUrl: 'https://instagram.com/testdj'
      };
      
      const scores: TalentScore = {
        talentScore: 75,
        engagementScore: 80,
        growthScore: 70,
        consistencyScore: 75,
        reachScore: 70,
        genreMatchScore: 100
      };
      
      const qualified = meetsQualificationThresholds(profile, scores);
      
      expect(qualified).toBe(true);
    });
    
    it('should not qualify profile with low talent score', () => {
      const profile: ProfileData = {
        instagram: {
          username: 'testdj',
          fullName: 'Test DJ',
          bio: 'DJ',
          profileImageUrl: 'https://example.com/image.jpg',
          followers: 10000,
          postsCount: 50,
          avgLikes: 100,
          avgComments: 10,
          engagementRate: 0.011,
          postsPerWeek: 1,
          recentPosts: []
        },
        fullName: 'Test DJ',
        primaryGenre: 'Tech House',
        secondaryGenres: [],
        bio: 'DJ',
        profileImageUrl: 'https://example.com/image.jpg',
        instagramUrl: 'https://instagram.com/testdj'
      };
      
      const scores: TalentScore = {
        talentScore: 45, // Below threshold (60)
        engagementScore: 40,
        growthScore: 50,
        consistencyScore: 45,
        reachScore: 50,
        genreMatchScore: 50
      };
      
      const qualified = meetsQualificationThresholds(profile, scores);
      
      expect(qualified).toBe(false);
    });
    
    it('should not qualify profile with insufficient followers', () => {
      const profile: ProfileData = {
        instagram: {
          username: 'testdj',
          fullName: 'Test DJ',
          bio: 'Tech House DJ',
          profileImageUrl: 'https://example.com/image.jpg',
          followers: 3000, // Below min threshold (5000)
          postsCount: 100,
          avgLikes: 150,
          avgComments: 15,
          engagementRate: 0.055,
          postsPerWeek: 3,
          recentPosts: []
        },
        fullName: 'Test DJ',
        primaryGenre: 'Tech House',
        secondaryGenres: [],
        bio: 'Tech House DJ',
        profileImageUrl: 'https://example.com/image.jpg',
        instagramUrl: 'https://instagram.com/testdj'
      };
      
      const scores: TalentScore = {
        talentScore: 75,
        engagementScore: 80,
        growthScore: 70,
        consistencyScore: 75,
        reachScore: 50,
        genreMatchScore: 100
      };
      
      const qualified = meetsQualificationThresholds(profile, scores);
      
      expect(qualified).toBe(false);
    });
  });
  
  describe('generateAINotes', () => {
    it('should generate notes for high-scoring profile', () => {
      const profile: ProfileData = {
        instagram: {
          username: 'testdj',
          fullName: 'Test DJ',
          bio: 'Tech House DJ',
          profileImageUrl: 'https://example.com/image.jpg',
          followers: 50000,
          postsCount: 200,
          avgLikes: 2500,
          avgComments: 250,
          engagementRate: 0.055,
          postsPerWeek: 4,
          recentPosts: []
        },
        fullName: 'Test DJ',
        primaryGenre: 'Tech House',
        secondaryGenres: [],
        bio: 'Tech House DJ',
        profileImageUrl: 'https://example.com/image.jpg',
        instagramUrl: 'https://instagram.com/testdj'
      };
      
      const scores: TalentScore = {
        talentScore: 85,
        engagementScore: 90,
        growthScore: 80,
        consistencyScore: 85,
        reachScore: 80,
        genreMatchScore: 100
      };
      
      const notes = generateAINotes(profile, scores);
      
      expect(notes).toContain('HIGH PRIORITY');
      expect(notes).toContain('High engagement rate');
      expect(notes).toContain('Highly consistent');
      expect(notes).toContain('Perfect genre match');
    });
    
    it('should generate notes for low-scoring profile', () => {
      const profile: ProfileData = {
        instagram: {
          username: 'testdj',
          fullName: 'Test DJ',
          bio: 'DJ',
          profileImageUrl: 'https://example.com/image.jpg',
          followers: 5000,
          postsCount: 50,
          avgLikes: 100,
          avgComments: 10,
          engagementRate: 0.022,
          postsPerWeek: 1,
          recentPosts: []
        },
        fullName: 'Test DJ',
        primaryGenre: 'Tech House',
        secondaryGenres: [],
        bio: 'DJ',
        profileImageUrl: 'https://example.com/image.jpg',
        instagramUrl: 'https://instagram.com/testdj'
      };
      
      const scores: TalentScore = {
        talentScore: 50,
        engagementScore: 45,
        growthScore: 35,
        consistencyScore: 40,
        reachScore: 60,
        genreMatchScore: 100
      };
      
      const notes = generateAINotes(profile, scores);
      
      expect(notes).toContain('Low engagement rate');
      expect(notes).toContain('Stagnant growth');
      expect(notes).toContain('Irregular posting');
    });
  });
});
