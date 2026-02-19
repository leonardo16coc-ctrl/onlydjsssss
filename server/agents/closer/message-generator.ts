/**
 * Message Generator for Agent Closer
 * Generates personalized outreach messages using AI
 */

import { invokeLLM } from '../../_core/llm';
import { MessageGenerationContext, GeneratedMessage, MessageType } from './types';

/**
 * Generate a personalized outreach message using AI
 */
export async function generatePersonalizedMessage(
  context: MessageGenerationContext
): Promise<GeneratedMessage> {
  const prompt = buildPrompt(context);
  
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: getSystemPrompt(context.messageType)
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'outreach_message',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              content: {
                type: 'string',
                description: 'The personalized message content'
              },
              tone: {
                type: 'string',
                enum: ['professional', 'friendly', 'casual'],
                description: 'The tone of the message'
              },
              confidence: {
                type: 'number',
                description: 'Confidence score from 0-1'
              }
            },
            required: ['content', 'tone', 'confidence'],
            additionalProperties: false
          }
        }
      }
    });
    
    const content = response.choices[0].message.content;
    const messageData = JSON.parse(typeof content === 'string' ? content : '{}');
    
    return {
      content: messageData.content,
      tone: messageData.tone,
      confidence: messageData.confidence
    };
    
  } catch (error) {
    console.error('Error generating message:', error);
    // Fallback to template
    return generateFallbackMessage(context);
  }
}

/**
 * Get system prompt based on message type
 */
function getSystemPrompt(messageType: MessageType): string {
  const basePrompt = `You are an expert outreach specialist for ONLYDJS, a premium music platform for DJs. 
Your goal is to write personalized, engaging messages that convert talented DJs into platform users.

Key principles:
- Be authentic and personal, not salesy
- Acknowledge their specific talent and achievements
- Highlight relevant benefits of ONLYDJS
- Keep messages concise (2-3 short paragraphs max)
- Use their name naturally
- Match the platform's tone (Instagram: casual/friendly, SoundCloud: professional/music-focused)
- Never use generic templates
- Focus on value, not features`;

  switch (messageType) {
    case 'initial':
      return `${basePrompt}

This is the FIRST message. Your objectives:
1. Grab attention with a specific compliment about their work
2. Briefly introduce ONLYDJS and its unique value
3. Include a clear, low-pressure call-to-action
4. Keep it under 150 words`;

    case 'follow_up_1':
      return `${basePrompt}

This is the FIRST FOLLOW-UP (3 days after initial message). Your objectives:
1. Reference the previous message naturally
2. Add NEW value or insight they might find interesting
3. Address potential objections (time, skepticism)
4. Include a different angle or benefit
5. Keep it under 100 words`;

    case 'follow_up_2':
      return `${basePrompt}

This is the FINAL FOLLOW-UP (7 days after initial message). Your objectives:
1. Be respectful of their time
2. Make a final, compelling case
3. Create urgency without pressure
4. Leave door open for future contact
5. Keep it under 80 words`;

    default:
      return basePrompt;
  }
}

/**
 * Build the prompt with DJ context
 */
function buildPrompt(context: MessageGenerationContext): string {
  let prompt = `Generate a personalized ${context.messageType} message for:

DJ Name: ${context.djName}
Username: @${context.djUsername}
Platform: ${context.platform}
Genre: ${context.primaryGenre}
Talent Score: ${context.talentScore}/100`;

  if (context.instagramFollowers) {
    prompt += `\nInstagram Followers: ${context.instagramFollowers.toLocaleString()}`;
  }
  
  if (context.soundcloudFollowers) {
    prompt += `\nSoundCloud Followers: ${context.soundcloudFollowers.toLocaleString()}`;
  }
  
  if (context.instagramEngagementRate) {
    prompt += `\nInstagram Engagement: ${(context.instagramEngagementRate * 100).toFixed(1)}%`;
  }
  
  if (context.bio) {
    prompt += `\nBio: ${context.bio.substring(0, 200)}`;
  }
  
  if (context.previousMessages && context.previousMessages.length > 0) {
    prompt += `\n\nPrevious messages sent:\n${context.previousMessages.join('\n---\n')}`;
  }
  
  prompt += `\n\nGenerate a message that:
1. Feels personal and authentic
2. References specific details about their profile
3. Highlights why ONLYDJS is perfect for them
4. Includes a clear next step
5. Matches ${context.platform === 'instagram' ? 'Instagram\'s casual vibe' : 'SoundCloud\'s professional music community'}`;

  return prompt;
}

/**
 * Generate fallback message if AI fails
 */
function generateFallbackMessage(context: MessageGenerationContext): GeneratedMessage {
  const templates = {
    initial: {
      instagram: `Hey ${context.djName}! 👋

Came across your ${context.primaryGenre} sets and loved the energy! Your engagement rate is impressive.

We're building ONLYDJS - a platform where DJs like you can share premium edits, get discovered, and actually earn from downloads. Think Beatport meets SoundCloud, but built for the new generation.

Would love to have you as an early member. Interested in checking it out?`,
      
      soundcloud: `Hi ${context.djName},

I've been following your ${context.primaryGenre} productions on SoundCloud - really impressive work, especially considering your ${context.soundcloudFollowers || 0} followers and growing engagement.

I'm reaching out from ONLYDJS, a new platform designed specifically for DJs to monetize their edits and remixes while building their fanbase. We're selectively onboarding talented producers like yourself.

Would you be interested in learning more about how ONLYDJS could help you grow your career?`
    },
    
    follow_up_1: {
      instagram: `Hey ${context.djName},

Just wanted to follow up on my last message about ONLYDJS. We've had some amazing ${context.primaryGenre} DJs join recently and the community is growing fast.

Quick question - what's your biggest challenge right now with sharing your music online?`,
      
      soundcloud: `Hi ${context.djName},

Following up on my previous message. I noticed you're consistently putting out quality ${context.primaryGenre} tracks - that's exactly the kind of content that performs well on ONLYDJS.

Would love to answer any questions you might have about the platform.`
    },
    
    follow_up_2: {
      instagram: `${context.djName} - last message, I promise! 😊

Just didn't want you to miss out on ONLYDJS. We're closing early access soon.

If you're ever interested, you know where to find us. Keep killing it with those ${context.primaryGenre} sets! 🔥`,
      
      soundcloud: `Hi ${context.djName},

This will be my last message - I respect your time. Just wanted to make sure you saw our previous messages about ONLYDJS.

If you're ever interested in monetizing your ${context.primaryGenre} productions, we'd love to have you. Best of luck with your music!`
    }
  };
  
  const platformTemplates = templates[context.messageType as keyof typeof templates];
  if (!platformTemplates) {
    return {
      content: `Hi ${context.djName}, I wanted to reach out about ONLYDJS...`,
      tone: 'professional' as const,
      confidence: 0.5
    };
  }
  const content = platformTemplates[context.platform];
  
  return {
    content,
    tone: context.platform === 'instagram' ? 'friendly' : 'professional',
    confidence: 0.7
  };
}

/**
 * Generate batch messages for multiple DJs
 */
export async function generateBatchMessages(
  contexts: MessageGenerationContext[]
): Promise<GeneratedMessage[]> {
  const messages: GeneratedMessage[] = [];
  
  for (const context of contexts) {
    try {
      const message = await generatePersonalizedMessage(context);
      messages.push(message);
      
      // Small delay between generations to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to generate message for ${context.djUsername}:`, error);
      messages.push(generateFallbackMessage(context));
    }
  }
  
  return messages;
}

/**
 * Validate message quality before sending
 */
export function validateMessage(message: GeneratedMessage): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check length
  if (message.content.length < 50) {
    issues.push('Message too short');
  }
  
  if (message.content.length > 1000) {
    issues.push('Message too long');
  }
  
  // Check for spam indicators
  const spamWords = ['click here', 'limited time', 'act now', 'free money', '$$$'];
  const lowerContent = message.content.toLowerCase();
  
  for (const word of spamWords) {
    if (lowerContent.includes(word)) {
      issues.push(`Contains spam indicator: "${word}"`);
    }
  }
  
  // Check confidence
  if (message.confidence < 0.5) {
    issues.push('Low confidence score');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}
