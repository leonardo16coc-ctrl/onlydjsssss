import { Request, Response } from "express";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Sellfy Webhook Handler
 * 
 * Handles subscription events from Sellfy:
 * - order.paid: New subscription created
 * - subscription.updated: Subscription status changed
 * - subscription.cancelled: Subscription cancelled
 * 
 * Sellfy webhook documentation: https://sellfy.com/developers/#webhooks
 */

interface SellfyWebhookPayload {
  event: string;
  data: {
    order_id: string;
    product_id: string;
    customer_email: string;
    customer_name?: string;
    subscription?: {
      id: string;
      status: "active" | "cancelled" | "expired" | "pending";
      next_billing_date?: string;
    };
    total: string;
    currency: string;
  };
}

export async function handleSellfyWebhook(req: Request, res: Response) {
  try {
    const payload = req.body as SellfyWebhookPayload;
    
    console.log("[Sellfy Webhook] Received event:", payload.event);
    console.log("[Sellfy Webhook] Payload:", JSON.stringify(payload, null, 2));

    const { event, data } = payload;
    const customerEmail = data.customer_email;

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
      return res.status(404).json({ error: "User not found" });
    }

    // Handle different webhook events
    switch (event) {
      case "order.paid":
        // New subscription created
        if (data.subscription) {
          await db
            .update(users)
            .set({
              sellfyCustomerId: customerEmail, // Sellfy uses email as customer ID
              sellfySubscriptionId: data.subscription.id,
              sellfySubscriptionStatus: data.subscription.status,
              membershipStatus: "member",
              membershipExpiresAt: data.subscription.next_billing_date 
                ? new Date(data.subscription.next_billing_date) 
                : null,
            })
            .where(eq(users.id, user.id));

          console.log("[Sellfy Webhook] Subscription activated for user:", user.id);
        }
        break;

      case "subscription.updated":
        // Subscription status changed
        if (data.subscription) {
          const membershipStatus = data.subscription.status === "active" ? "member" : "free";
          
          await db
            .update(users)
            .set({
              sellfySubscriptionStatus: data.subscription.status,
              membershipStatus,
              membershipExpiresAt: data.subscription.next_billing_date 
                ? new Date(data.subscription.next_billing_date) 
                : null,
            })
            .where(eq(users.id, user.id));

          console.log("[Sellfy Webhook] Subscription updated for user:", user.id, "Status:", data.subscription.status);
        }
        break;

      case "subscription.cancelled":
        // Subscription cancelled
        await db
          .update(users)
          .set({
            sellfySubscriptionStatus: "cancelled",
            membershipStatus: "free",
          })
          .where(eq(users.id, user.id));

        console.log("[Sellfy Webhook] Subscription cancelled for user:", user.id);
        break;

      default:
        console.log("[Sellfy Webhook] Unhandled event type:", event);
    }

    // Always return 200 to acknowledge receipt
    return res.status(200).json({ received: true });

  } catch (error) {
    console.error("[Sellfy Webhook] Error processing webhook:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
