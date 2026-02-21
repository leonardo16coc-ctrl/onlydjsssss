import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { sql } from "drizzle-orm";
import { sendEmail, sendBulkEmails, generateDJOutreachEmail } from "../email/resend";
import { getActiveABTest, getRandomVariant, incrementVariantSent } from "../ab-testing/variant-assigner";

export const emailCampaignsRouter = router({
  /**
   * Send email to a single DJ
   */
  sendToDJ: protectedProcedure
    .input(
      z.object({
        djId: z.number(),
        platform: z.enum(["instagram", "email"]),
        customMessage: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Get DJ info
      const [dj] = await db.execute(
        sql`SELECT * FROM discovered_djs WHERE id = ${input.djId}`
      );
      
      if (!dj) {
        throw new Error("DJ not found");
      }
      
      const djData = dj as any;
      const djName = djData.full_name || djData.soundcloud_username || djData.instagram_username || "DJ";
      const djEmail = djData.email;
      
      if (!djEmail) {
        throw new Error("DJ email not found");
      }
      
      // Generate message with AI if not provided
      let message = input.customMessage;
      if (!message) {
        message = `Hemos descubierto tu increíble trabajo en ${input.platform === "instagram" ? "Instagram" : "SoundCloud"} y nos encantaría invitarte a unirte a ONLYDJS.

ONLYDJS es la plataforma definitiva para DJs profesionales donde puedes:
• Subir y monetizar tus extended mixes, remixes y mashups
• Conectar con otros DJs y productores de todo el mundo
• Acceder a herramientas de IA para crear sets perfectos
• Ganar dinero con cada descarga de tus tracks

Únete a nuestra comunidad de DJs profesionales y lleva tu carrera al siguiente nivel.`;
      }
      
      // Generate email HTML
      const { html, text } = generateDJOutreachEmail({
        djName,
        message,
        platform: input.platform,
      });
      
      // Check for active A/B test and get variant
      let subject = "Invitación exclusiva a ONLYDJS - Plataforma para DJs";
      let abTestVariantId: number | null = null;
      
      const activeTest = await getActiveABTest();
      if (activeTest) {
        const variant = await getRandomVariant(activeTest.id);
        if (variant) {
          subject = variant.subject_line;
          abTestVariantId = variant.id;
          await incrementVariantSent(variant.id);
          console.log(`[Email Campaign] Using A/B test variant "${variant.variant_name}": ${subject}`);
        }
      }
      
      // Send email
      const result = await sendEmail({
        to: djEmail,
        subject,
        html,
        text,
        abTestVariantId: abTestVariantId || undefined,
      });
      
      // Save to database
      await db.execute(
        sql`INSERT INTO email_campaigns (dj_id, email_to, subject, message_text, platform, status, resend_id, sent_at, error_message, ab_test_variant_id)
            VALUES (${input.djId}, ${djEmail}, ${subject}, ${message}, ${input.platform}, ${result.success ? "sent" : "failed"}, ${result.id || null}, ${result.success ? new Date() : null}, ${result.error || null}, ${abTestVariantId})`
      );
      
      return {
        success: result.success,
        emailId: result.id,
        error: result.error,
      };
    }),
  
  /**
   * Send bulk emails to multiple DJs
   */
  sendBulk: protectedProcedure
    .input(
      z.object({
        djIds: z.array(z.number()),
        platform: z.enum(["instagram", "email"]),
        customMessage: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Get all DJs
      const djs = await db.execute(
        sql`SELECT * FROM discovered_djs WHERE id IN (${sql.join(input.djIds.map(id => sql`${id}`), sql`, `)})`
      );
      
      if (!djs || (djs as any[]).length === 0) {
        throw new Error("No DJs found");
      }
      
      // Prepare emails
      const emails = (djs as any[])
        .filter((dj) => dj.email) // Only DJs with email
        .map((dj) => {
          const djName = dj.full_name || dj.soundcloud_username || dj.instagram_username || "DJ";
          
          const message = input.customMessage || `Hemos descubierto tu increíble trabajo en ${input.platform === "instagram" ? "Instagram" : "SoundCloud"} y nos encantaría invitarte a unirte a ONLYDJS.

ONLYDJS es la plataforma definitiva para DJs profesionales donde puedes:
• Subir y monetizar tus extended mixes, remixes y mashups
• Conectar con otros DJs y productores de todo el mundo
• Acceder a herramientas de IA para crear sets perfectos
• Ganar dinero con cada descarga de tus tracks

Únete a nuestra comunidad de DJs profesionales y lleva tu carrera al siguiente nivel.`;
          
          const { html, text } = generateDJOutreachEmail({
            djName,
            message,
            platform: input.platform,
          });
          
          return {
            djId: dj.id,
            to: dj.email,
            subject: "Invitación exclusiva a ONLYDJS - Plataforma para DJs",
            html,
            text,
            message,
          };
        });
      
      if (emails.length < 1) {
        throw new Error("No DJs with valid emails found");
      }
      
      // Send bulk emails
      const result = await sendBulkEmails({ emails });
      
      // Save all to database
      for (let i = 0; i < emails.length; i++) {
        const email = emails[i];
        const emailResult = result.data?.data?.[i];
        
        await db.execute(
          sql`INSERT INTO email_campaigns (dj_id, email_to, subject, message_text, platform, status, resend_id, sent_at, error_message)
              VALUES (${email.djId}, ${email.to}, ${email.subject}, ${email.message}, ${input.platform}, ${result.success ? "sent" : "failed"}, ${emailResult?.id || null}, ${result.success ? new Date() : null}, ${result.error || null})`
        );
      }
      
      return {
        success: result.success,
        sentCount: emails.length,
        error: result.error,
      };
    }),
  
  /**
   * Get email campaign stats
   */
  getStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const [stats] = await db.execute(
      sql`SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
            SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
            SUM(CASE WHEN status = 'opened' THEN 1 ELSE 0 END) as opened,
            SUM(CASE WHEN status = 'clicked' THEN 1 ELSE 0 END) as clicked,
            SUM(CASE WHEN status = 'replied' THEN 1 ELSE 0 END) as replied
          FROM email_campaigns`
    );
    
    return stats || { total: 0, sent: 0, failed: 0, opened: 0, clicked: 0, replied: 0 };
  }),
  
  /**
   * Get recent email campaigns
   */
  getRecent: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const campaigns = await db.execute(
        sql`SELECT ec.*, dj.full_name, dj.soundcloud_username, dj.instagram_username
            FROM email_campaigns ec
            LEFT JOIN discovered_djs dj ON ec.dj_id = dj.id
            ORDER BY ec.created_at DESC
            LIMIT ${input.limit}`
      );
      
      return campaigns || [];
    }),
});
