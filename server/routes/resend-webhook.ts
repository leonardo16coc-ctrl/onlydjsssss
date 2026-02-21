import type { Request, Response } from "express";
import { getDb } from "../db";
import { sql } from "drizzle-orm";
import { updateVariantOpened } from "../ab-testing/variant-assigner";

/**
 * Resend Webhook Handler
 * Handles email events: opened, clicked, delivered, bounced, complained
 * Docs: https://resend.com/docs/dashboard/webhooks/event-types
 */
export async function handleResendWebhook(req: Request, res: Response) {
  try {
    const event = req.body;
    
    console.log("[Resend Webhook] Received event:", event.type);
    console.log("[Resend Webhook] Event data:", JSON.stringify(event, null, 2));

    const db = await getDb();
    if (!db) {
      console.error("[Resend Webhook] Database not available");
      return res.status(200).json({ received: true }); // Return 200 to avoid retries
    }

    // Extract email ID from event
    const emailId = event.data?.email_id || event.data?.id;
    
    if (!emailId) {
      console.error("[Resend Webhook] No email ID found in event");
      return res.status(200).json({ received: true });
    }

    // Handle different event types
    switch (event.type) {
      case "email.opened":
        // Get campaign info to update A/B test metrics
        const campaign = await db.execute(sql`
          SELECT ab_test_variant_id 
          FROM email_campaigns 
          WHERE resend_id = ${emailId}
            AND opened_at IS NULL
        `);
        
        await db.execute(sql`
          UPDATE email_campaigns 
          SET opened_at = ${new Date().toISOString()},
              status = 'opened'
          WHERE resend_id = ${emailId}
            AND opened_at IS NULL
        `);
        
        // Update A/B test variant metrics if applicable
        if (campaign && (campaign as any[]).length > 0) {
          const variantId = (campaign as any[])[0].ab_test_variant_id;
          if (variantId) {
            await updateVariantOpened(variantId);
            console.log(`[Resend Webhook] ✅ Updated A/B test variant ${variantId}`);
          }
        }
        
        console.log(`[Resend Webhook] ✅ Email opened: ${emailId}`);
        break;

      case "email.clicked":
        await db.execute(sql`
          UPDATE email_campaigns 
          SET clicked_at = ${new Date().toISOString()},
              status = 'clicked'
          WHERE resend_id = ${emailId}
            AND clicked_at IS NULL
        `);
        console.log(`[Resend Webhook] ✅ Email clicked: ${emailId}`);
        break;

      case "email.delivered":
        await db.execute(sql`
          UPDATE email_campaigns 
          SET status = 'delivered'
          WHERE resend_id = ${emailId}
            AND status = 'sent'
        `);
        console.log(`[Resend Webhook] ✅ Email delivered: ${emailId}`);
        break;

      case "email.bounced":
        await db.execute(sql`
          UPDATE email_campaigns 
          SET status = 'bounced',
              error_message = ${event.data?.reason || 'Email bounced'}
          WHERE resend_id = ${emailId}
        `);
        console.log(`[Resend Webhook] ⚠️ Email bounced: ${emailId}`);
        break;

      case "email.complained":
        await db.execute(sql`
          UPDATE email_campaigns 
          SET status = 'complained'
          WHERE resend_id = ${emailId}
        `);
        console.log(`[Resend Webhook] ⚠️ Email complained: ${emailId}`);
        break;

      default:
        console.log(`[Resend Webhook] Unhandled event type: ${event.type}`);
    }

    // Always return 200 to acknowledge receipt
    return res.status(200).json({ received: true });

  } catch (error) {
    console.error("[Resend Webhook] Error processing webhook:", error);
    // Return 200 even on error to avoid retries
    return res.status(200).json({ received: true, error: "Processing error" });
  }
}
