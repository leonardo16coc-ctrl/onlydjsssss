import { z } from "zod";
import { publicProcedure, protectedProcedure, router, adminProcedure } from "../_core/trpc";
import { 
  addDjLead, 
  getDjLeads, 
  updateDjLeadStatus,
  createOutreachCampaign,
  getOutreachCampaigns 
} from "../db";
import { invokeLLM } from "../_core/llm";

/**
 * Recruitment Router
 * Manages DJ lead discovery, outreach, and conversion tracking
 */
export const recruitmentRouter = router({
  /**
   * Add a new DJ lead manually
   */
  addLead: adminProcedure
    .input(z.object({
      name: z.string().optional(),
      instagramUsername: z.string().optional(),
      soundcloudUsername: z.string().optional(),
      email: z.string().email().optional(),
      primaryGenre: z.string().optional(),
      instagramUrl: z.string().url().optional(),
      soundcloudUrl: z.string().url().optional(),
      instagramFollowers: z.number().optional(),
      soundcloudFollowers: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Calculate initial scores
      const totalFollowers = (input.instagramFollowers || 0) + (input.soundcloudFollowers || 0);
      const reachScore = Math.min(100, (totalFollowers / 1000) * 10).toFixed(2);
      const talentScore = "50.00"; // Default, will be updated later

      await addDjLead({
        fullName: input.name,
        instagramUsername: input.instagramUsername,
        soundcloudUsername: input.soundcloudUsername,
        email: input.email,
        primaryGenre: input.primaryGenre,
        instagramUrl: input.instagramUrl,
        soundcloudUrl: input.soundcloudUrl,
        instagramFollowers: input.instagramFollowers,
        soundcloudFollowers: input.soundcloudFollowers,
        reachScore,
        talentScore,
        discoveryStatus: "discovered",
        aiNotes: input.notes,
      });

      return { success: true };
    }),

  /**
   * Get all DJ leads
   */
  getLeads: adminProcedure
    .input(z.object({
      status: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const leads = await getDjLeads(input.status);
      return leads;
    }),

  /**
   * Update lead status
   */
  updateStatus: adminProcedure
    .input(z.object({
      djId: z.number(),
      status: z.enum(["discovered", "qualified", "contacted", "responded", "converted", "rejected", "dormant"]),
    }))
    .mutation(async ({ input }) => {
      await updateDjLeadStatus(input.djId, input.status);
      return { success: true };
    }),

  /**
   * Generate personalized outreach message using AI
   */
  generateMessage: adminProcedure
    .input(z.object({
      djId: z.number(),
      djName: z.string(),
      genre: z.string().optional(),
      platform: z.enum(["instagram", "email"]),
      tone: z.enum(["casual", "professional", "enthusiastic"]).default("professional"),
    }))
    .mutation(async ({ input }) => {
      const prompt = `You are a recruitment specialist for ONLYDJS, a premium music platform for DJs.

Generate a ${input.tone} ${input.platform} message to invite ${input.djName} (${input.genre || "DJ"}) to join our platform.

Key points to include:
- ONLYDJS is a curated platform for professional DJs to share extended mixes, remixes, and mashups
- DJs earn revenue from downloads through our unique hybrid monetization model
- We have a growing community of top DJs and producers
- Invitation to upload their tracks and grow their audience
- Professional tone but warm and welcoming

${input.platform === "instagram" ? "Keep it under 500 characters for Instagram DM." : "Email format with subject line."}

Generate ONLY the message text, no explanations.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a professional recruitment copywriter." },
          { role: "user", content: prompt }
        ],
      });

      const messageContent = response.choices[0].message.content;
      const message = typeof messageContent === 'string' ? messageContent : JSON.stringify(messageContent);

      // Return message without saving to database
      // User will copy and send manually, then mark as sent
      return { message };
    }),

  /**
   * Mark message as sent
   */
  markMessageSent: adminProcedure
    .input(z.object({
      djId: z.number(),
      campaignId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      await updateDjLeadStatus(input.djId, "contacted");
      return { success: true };
    }),

  /**
   * Get outreach history for a DJ
   */
  getOutreachHistory: adminProcedure
    .input(z.object({
      djId: z.number(),
    }))
    .query(async ({ input }) => {
      const campaigns = await getOutreachCampaigns(input.djId);
      return campaigns;
    }),

  /**
   * Get recruitment stats
   */
  getStats: adminProcedure
    .query(async () => {
      const allLeads = await getDjLeads();
      
      const stats = {
        total: allLeads.length,
        discovered: allLeads.filter(l => l.discoveryStatus === "discovered").length,
        contacted: allLeads.filter(l => l.discoveryStatus === "contacted").length,
        responded: allLeads.filter(l => l.discoveryStatus === "responded").length,
        converted: allLeads.filter(l => l.discoveryStatus === "converted").length,
        rejected: allLeads.filter(l => l.discoveryStatus === "rejected").length,
      };

      return stats;
    }),
});
