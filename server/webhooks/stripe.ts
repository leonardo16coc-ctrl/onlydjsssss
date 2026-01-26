import { Request, Response } from "express";
import Stripe from "stripe";
import { stripe } from "../stripe";
import { ENV } from "../_core/env";
import { updateUserMembership } from "../db";

if (!ENV.stripeWebhookSecret) {
  throw new Error("STRIPE_WEBHOOK_SECRET is required");
}

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("[Stripe Webhook] Missing signature");
    return res.status(400).send("Missing signature");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      ENV.stripeWebhookSecret
    );
  } catch (err: any) {
    console.error("[Stripe Webhook] Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Stripe Webhook] Test event detected, returning verification response");
    return res.json({
      verified: true,
    });
  }

  console.log(`[Stripe Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error processing event:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("[Stripe Webhook] Checkout completed:", session.id);

  const userId = session.metadata?.user_id;
  if (!userId) {
    console.error("[Stripe Webhook] Missing user_id in metadata");
    return;
  }

  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  if (!subscriptionId) {
    console.error("[Stripe Webhook] Missing subscription ID");
    return;
  }

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const expiresAt = new Date((subscription as any).current_period_end * 1000);

  // Update user membership
  await updateUserMembership(parseInt(userId), {
    membershipStatus: "member",
    membershipExpiresAt: expiresAt,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
  });

  console.log(`[Stripe Webhook] User ${userId} membership activated until ${expiresAt}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log("[Stripe Webhook] Subscription updated:", subscription.id);

  const userId = subscription.metadata?.user_id;
  if (!userId) {
    console.error("[Stripe Webhook] Missing user_id in subscription metadata");
    return;
  }

  const expiresAt = new Date((subscription as any).current_period_end * 1000);
  const status = subscription.status;

  let membershipStatus: "free" | "member" | "verified" = "free";
  if (status === "active" || status === "trialing") {
    membershipStatus = "member";
  }

  await updateUserMembership(parseInt(userId), {
    membershipStatus,
    membershipExpiresAt: expiresAt,
    stripeSubscriptionId: subscription.id,
  });

  console.log(`[Stripe Webhook] User ${userId} membership updated: ${membershipStatus}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log("[Stripe Webhook] Subscription deleted:", subscription.id);

  const userId = subscription.metadata?.user_id;
  if (!userId) {
    console.error("[Stripe Webhook] Missing user_id in subscription metadata");
    return;
  }

  await updateUserMembership(parseInt(userId), {
    membershipStatus: "free",
    membershipExpiresAt: null,
  });

  console.log(`[Stripe Webhook] User ${userId} membership cancelled`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log("[Stripe Webhook] Invoice paid:", invoice.id);
  // Additional logic if needed (e.g., send receipt email)
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log("[Stripe Webhook] Invoice payment failed:", invoice.id);
  // Additional logic if needed (e.g., notify user)
}
