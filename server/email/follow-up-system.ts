import { getDb } from "../db";
import { sql } from "drizzle-orm";
import { sendEmail, generateDJOutreachEmail } from "./resend";
import { getFollowUpTemplate } from "./follow-up-templates";

/**
 * Detect DJs that need follow-up emails
 * Criteria: Email sent 7+ days ago, no response, no follow-up sent yet
 */
export async function detectFollowUpNeeded() {
  const db = await getDb();
  if (!db) {
    console.error("[Follow-up] Database not available");
    return [];
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Find DJs with emails sent 7+ days ago that haven't responded
  // MySQL converts column names to lowercase, so we use lowercase in queries
  const result = await db.execute(sql`
    SELECT 
      ec.id as campaign_id,
      ec.dj_id,
      ec.email_to as email,
      ec.sent_at,
      dj.fullname as dj_name,
      dj.primarygenre as genre,
      ec.platform as platform
    FROM email_campaigns ec
    INNER JOIN discovered_djs dj ON ec.dj_id = dj.id
    WHERE ec.status = 'sent'
      AND ec.sent_at <= ${sevenDaysAgo.toISOString()}
      AND NOT EXISTS (
        SELECT 1 FROM email_campaigns ec2 
        WHERE ec2.dj_id = ec.dj_id 
        AND ec2.sent_at > ec.sent_at
      )
    ORDER BY ec.sent_at ASC
    LIMIT 50
  `);

  return (result as any) as Array<{
    campaign_id: number;
    dj_id: number;
    email: string;
    sent_at: string;
    dj_name: string;
    genre: string | null;
    platform: string;
  }>;
}

/**
 * Send follow-up emails to DJs that haven't responded
 */
export async function sendFollowUpEmails() {
  console.log("\n╔═══════════════════════════════════════╗");
  console.log("║  FOLLOW-UP EMAIL SYSTEM               ║");
  console.log("╚═══════════════════════════════════════╝\n");

  const djsNeedingFollowUp = await detectFollowUpNeeded();
  
  if (djsNeedingFollowUp.length === 0) {
    console.log("✅ No DJs need follow-up emails at this time");
    return { sent: 0, failed: 0 };
  }

  console.log(`📧 Found ${djsNeedingFollowUp.length} DJs needing follow-up\n`);

  let sent = 0;
  let failed = 0;
  const db = await getDb();

  for (const dj of djsNeedingFollowUp) {
    try {
      // Get personalized template based on genre
      const template = getFollowUpTemplate(dj.genre);
      
      // Generate HTML email
      const { html, text } = generateDJOutreachEmail({
        djName: dj.dj_name,
        message: template.message,
        platform: "email",
      });

      // Send email via Resend
      const result = await sendEmail({
        to: dj.email,
        subject: template.subject,
        html,
        text,
      });

      if (result.success && db) {
        // Record follow-up email in database
        // email_campaigns columns: dj_id, email_to, subject, message_text, platform, status, resend_id, sent_at, error_message
        await db.execute(sql`
          INSERT INTO email_campaigns (
            dj_id, email_to, subject, message_text, platform, status, 
            resend_id, sent_at
          ) VALUES (
            ${dj.dj_id},
            ${dj.email},
            ${template.subject},
            ${template.message},
            'email',
            'sent',
            ${result.id},
            ${new Date().toISOString()}
          )
        `);

        console.log(`✅ Follow-up sent to ${dj.dj_name} (${dj.email})`);
        sent++;
      } else {
        console.log(`❌ Failed to send follow-up to ${dj.dj_name}: ${result.error}`);
        failed++;
      }

      // Delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Error sending follow-up to ${dj.dj_name}:`, error);
      failed++;
    }
  }

  console.log(`\n📊 Follow-up Summary:`);
  console.log(`   ✅ Sent: ${sent}`);
  console.log(`   ❌ Failed: ${failed}\n`);

  return { sent, failed };
}

/**
 * Get follow-up statistics
 */
export async function getFollowUpStats() {
  const db = await getDb();
  if (!db) return null;

  // Note: email_campaigns doesn't have is_follow_up, opened_at, replied_at columns
  // We'll count follow-ups by checking if there are multiple emails to same DJ
  const result = await db.execute(sql`
    SELECT 
      COUNT(DISTINCT ec2.id) as total_follow_ups
    FROM email_campaigns ec1
    INNER JOIN email_campaigns ec2 ON ec1.dj_id = ec2.dj_id AND ec2.sent_at > ec1.sent_at
    WHERE ec1.status = 'sent' AND ec2.status = 'sent'
  `);

  const row = (result as any)[0];
  return row as {
    total_follow_ups: number;
  };
}
