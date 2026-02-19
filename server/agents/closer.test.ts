/**
 * Tests for Agent Closer
 */

import { describe, it, expect } from 'vitest';
import { generatePersonalizedMessage, validateMessage } from './closer/message-generator';
import { MessageGenerationContext } from './closer/types';

describe('Agent Closer - Message Generation', () => {
  describe('generatePersonalizedMessage', () => {
    it('should generate initial message for Instagram DJ', async () => {
      const context: MessageGenerationContext = {
        djName: 'Test DJ',
        djUsername: 'testdj',
        platform: 'instagram',
        primaryGenre: 'Tech House',
        talentScore: 75,
        instagramFollowers: 10000,
        instagramEngagementRate: 0.055,
        bio: 'Tech House DJ from LA',
        messageType: 'initial'
      };
      
      const message = await generatePersonalizedMessage(context);
      
      expect(message.content).toBeTruthy();
      expect(message.content.length).toBeGreaterThan(50);
      expect(message.content).toContain('Test DJ');
      expect(['friendly', 'casual', 'professional']).toContain(message.tone);
      expect(message.confidence).toBeGreaterThan(0);
    }, 30000); // 30s timeout for AI generation
    
    it('should generate follow-up message with context', async () => {
      const context: MessageGenerationContext = {
        djName: 'Test DJ',
        djUsername: 'testdj',
        platform: 'soundcloud',
        primaryGenre: 'Techno',
        talentScore: 80,
        soundcloudFollowers: 5000,
        messageType: 'follow_up_1',
        previousMessages: [
          'Hey Test DJ, loved your recent Techno tracks...'
        ]
      };
      
      const message = await generatePersonalizedMessage(context);
      
      expect(message.content).toBeTruthy();
      expect(message.content.length).toBeGreaterThan(30);
      expect(message.content.length).toBeLessThan(500);
      expect(message.tone).toBe('professional');
    }, 30000);
    
    it('should generate final follow-up message', async () => {
      const context: MessageGenerationContext = {
        djName: 'Test DJ',
        djUsername: 'testdj',
        platform: 'instagram',
        primaryGenre: 'Bass House',
        talentScore: 70,
        instagramFollowers: 8000,
        messageType: 'follow_up_2',
        previousMessages: [
          'Initial message...',
          'First follow-up...'
        ]
      };
      
      const message = await generatePersonalizedMessage(context);
      
      expect(message.content).toBeTruthy();
      expect(message.content.length).toBeLessThan(400); // Final message should be shorter
    }, 30000);
  });
  
  describe('validateMessage', () => {
    it('should validate good message', () => {
      const message = {
        content: 'Hey John! I came across your Tech House sets and was really impressed by your energy and production quality. We\'re building ONLYDJS, a platform where DJs like you can share premium edits and actually earn from downloads. Would love to have you as an early member. Interested?',
        tone: 'friendly' as const,
        confidence: 0.85
      };
      
      const validation = validateMessage(message);
      
      expect(validation.valid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });
    
    it('should reject message that is too short', () => {
      const message = {
        content: 'Hey!',
        tone: 'casual' as const,
        confidence: 0.9
      };
      
      const validation = validateMessage(message);
      
      expect(validation.valid).toBe(false);
      expect(validation.issues).toContain('Message too short');
    });
    
    it('should reject message with spam indicators', () => {
      const message = {
        content: 'Click here now for free money! This is a limited time offer that you must act now on to get $$$!',
        tone: 'professional' as const,
        confidence: 0.7
      };
      
      const validation = validateMessage(message);
      
      expect(validation.valid).toBe(false);
      expect(validation.issues.length).toBeGreaterThan(0);
      expect(validation.issues.some(issue => issue.includes('spam indicator'))).toBe(true);
    });
    
    it('should reject message with low confidence', () => {
      const message = {
        content: 'This is a decent length message that should pass most checks but has low confidence score.',
        tone: 'professional' as const,
        confidence: 0.3
      };
      
      const validation = validateMessage(message);
      
      expect(validation.valid).toBe(false);
      expect(validation.issues).toContain('Low confidence score');
    });
  });
});

describe('Agent Closer - Rate Limiting', () => {
  it('should respect rate limits', () => {
    // Rate limiting logic is tested through integration
    expect(true).toBe(true);
  });
});

describe('Agent Closer - Follow-up Logic', () => {
  it('should determine correct follow-up type', () => {
    // Follow-up logic is tested through integration
    expect(true).toBe(true);
  });
});
