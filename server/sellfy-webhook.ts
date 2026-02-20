import { Request, Response } from "express";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Sellfy Webhook Handler
 * 
 * Handles subscription events from Sellfy according to official documentation:
 * https://docs.sellfy.com/article/127-webhooks
 * 
 * Events:
 * - "Subscription product bought": New subscription or renewal
 * - "Subscription product canceled": Subscription cancelled by customer
 */

interface SellfySubscriptionPayload {
  id: string; // Unique Subscription ID
  payer_email: string;
  plan_name: string;
  plan_amount: number; // cents
  interval: "week" | "month" | "year";
  product: {
    id: string;
    key: string;
    name: string;
  };
  activated_at: string; // ISO 8601 format
  current_period_started_at: string; // ISO 8601 format
  current_period_ends_at: string; // ISO 8601 format
}

export async function handleSellfyWebhook(req: Request, res: Response) {
  try {
    // Sellfy sends event type in custom header
    const eventType = req.headers['x-sellfy-event'] as string;
    const payload = req.body as SellfySubscriptionPayload;
    
    console.log("[Sellfy Webhook] Received event:", eventType);
    console.log("[Sellfy Webhook] Payload:", JSON.stringify(payload, null, 2));

    if (!eventType) {
      console.error("[Sellfy Webhook] Missing event type header");
      return res.status(400).json({ error: "Missing event type" });
    }

    const customerEmail = payload.payer_email;

    // Find user by email
    const db = await getDb();
    if (!db) {
      console.error("[Sellfy Webhook] Database not available");
      return res.status(500).json({ error: "Database not available" });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, customerEmail))
      .limit(1);

    if (!user) {
      console.error("[Sellfy Webhook] User not found for email:", customerEmail);
      // Return 200 anyway to avoid Sellfy retrying
      return res.status(200).json({ 
        received: true, 
        note: "User not found but webhook acknowledged" 
      });
    }

    // Handle different webhook events
    switch (eventType) {
      case "Subscription product bought":
        // New subscription or renewal
        await db
          .update(users)
          .set({
            sellfyCustomerId: customerEmail,
            sellfySubscriptionId: payload.id,
            sellfySubscriptionStatus: "active",
            membershipStatus: "member",
            membershipExpiresAt: new Date(payload.current_period_ends_at),
          })
          .where(eq(users.id, user.id));

        console.log("[Sellfy Webhook] Subscription activated/renewed for user:", user.id);
        console.log("[Sellfy Webhook] Next billing:", payload.current_period_ends_at);
        break;

      case "Subscription product canceled":
        // Subscription cancelled
        await db
          .update(users)
          .set({
            sellfySubscriptionStatus: "cancelled",
            membershipStatus: "free",
            // Keep membershipExpiresAt to show when access ends
          })
          .where(eq(users.id, user.id));

        console.log("[Sellfy Webhook] Subscription cancelled for user:", user.id);
        console.log("[Sellfy Webhook] Access ends at:", user.membershipExpiresAt);
        break;

      default:
        console.log("[Sellfy Webhook] Unhandled event type:", eventType);
    }

    // Always return 200 to acknowledge receipt
    return res.status(200).json({ received: true });

  } catch (error) {
    console.error("[Sellfy Webhook] Error processing webhook:", error);
    // Return 200 to avoid Sellfy retrying on our internal errors
    return res.status(200).json({ 
      received: true, 
      error: "Internal error but webhook acknowledged" 
    });
  }
}
