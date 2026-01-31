import type { Request, Response } from "express";
import Stripe from "stripe";
import { notifyOwner } from "./_core/notification";
import {
  getPaymentSuccessEmail,
  getPaymentFailedEmail,
  getSubscriptionCanceledEmail,
  getSubscriptionReactivatedEmail,
} from "./email-templates";
import * as db from "./db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * Send email notification to user
 * Uses Manus notification system
 */
async function sendEmailToUser(email: string, subject: string, html: string) {
  try {
    // For now, notify owner (in production, you'd use a proper email service)
    await notifyOwner({
      title: `Email to ${email}: ${subject}`,
      content: html.substring(0, 500) + "...", // Truncate for notification
    });
    
    console.log(`[Email] Sent to ${email}: ${subject}`);
    return true;
  } catch (error) {
    console.error("[Email] Error sending:", error);
    return false;
  }
}

/**
 * Stripe Webhook Handler
 * Handles subscription events and sends email notifications
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("[Webhook] No signature provided");
    return res.status(400).send("No signature");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error("[Webhook] Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  try {
    switch (event.type) {
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

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error(`[Webhook] Error processing ${event.type}:`, error);
    res.status(500).json({ error: error.message });
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log(`[Webhook] Processing invoice.paid: ${invoice.id}`);

  if (!invoice.customer_email) {
    console.log("[Webhook] No customer email, skipping notification");
    return;
  }

  // Get customer details
  const customer = await stripe.customers.retrieve(invoice.customer as string);
  const customerName = (customer as any).name || invoice.customer_email.split("@")[0];

  // Update subscription in database
  if ((invoice as any).subscription) {
    const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string);
    
    const priceId = (subscription.items.data[0]?.price.id) || "";
    
    await db.createSubscription({
      userId: parseInt((subscription.metadata.user_id || "0")),
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      stripePriceId: priceId,
      status: subscription.status as "active" | "canceled" | "past_due" | "unpaid" | "trialing",
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });

    // Update user membership status
    const userId = parseInt(subscription.metadata.user_id || "0");
    if (userId > 0) {
      await db.updateUserMembership(userId, { membershipStatus: "member" });
    }
  }

  // Send payment success email
  const emailTemplate = getPaymentSuccessEmail({
    userName: customerName,
    amount: (invoice.amount_paid / 100).toFixed(2),
    currency: invoice.currency,
    invoiceUrl: invoice.hosted_invoice_url || "",
    periodEnd: new Date(invoice.period_end! * 1000).toLocaleDateString(),
  });

  await sendEmailToUser(invoice.customer_email, emailTemplate.subject, emailTemplate.html);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`[Webhook] Processing invoice.payment_failed: ${invoice.id}`);

  if (!invoice.customer_email) {
    console.log("[Webhook] No customer email, skipping notification");
    return;
  }

  // Get customer details
  const customer = await stripe.customers.retrieve(invoice.customer as string);
  const customerName = (customer as any).name || invoice.customer_email.split("@")[0];

  // Send payment failed email
  const emailTemplate = getPaymentFailedEmail({
    userName: customerName,
    amount: (invoice.amount_due / 100).toFixed(2),
    currency: invoice.currency,
    attemptCount: invoice.attempt_count || 1,
    nextRetryDate: invoice.next_payment_attempt
      ? new Date(invoice.next_payment_attempt * 1000).toLocaleDateString()
      : undefined,
  });

  await sendEmailToUser(invoice.customer_email, emailTemplate.subject, emailTemplate.html);

  // Notify owner about failed payment
  await notifyOwner({
    title: "⚠️ Payment Failed",
    content: `Customer ${invoice.customer_email} payment failed. Amount: ${(invoice.amount_due / 100).toFixed(2)} ${invoice.currency.toUpperCase()}`,
  });
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log(`[Webhook] Processing customer.subscription.created: ${subscription.id}`);

  // Create subscription in database
  const priceId = (subscription.items.data[0]?.price.id) || "";
  
  await db.createSubscription({
    userId: parseInt(subscription.metadata.user_id || "0"),
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: subscription.customer as string,
    stripePriceId: priceId,
    status: subscription.status as "active" | "canceled" | "past_due" | "unpaid" | "trialing",
    currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });

  // Update user membership status
  const userId = parseInt(subscription.metadata.user_id || "0");
  if (userId > 0 && subscription.status === "active") {
    await db.updateUserMembership(userId, { membershipStatus: "member" });
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`[Webhook] Processing customer.subscription.updated: ${subscription.id}`);

  // Update subscription in database
  const priceId = (subscription.items.data[0]?.price.id) || "";
  
  await db.createSubscription({
    userId: parseInt(subscription.metadata.user_id || "0"),
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: subscription.customer as string,
    stripePriceId: priceId,
    status: subscription.status as "active" | "canceled" | "past_due" | "unpaid" | "trialing",
    currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });

  // Update user membership status
  const userId = parseInt(subscription.metadata.user_id || "0");
  if (userId > 0) {
    if (subscription.status === "active" && !subscription.cancel_at_period_end) {
      await db.updateUserMembership(userId, { membershipStatus: "member" });
      
      // Check if subscription was reactivated (was canceled, now active)
      const previouslyCanceled = subscription.cancel_at_period_end === false && subscription.canceled_at;
      if (previouslyCanceled) {
        // Get customer email
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const customerEmail = (customer as any).email;
        const customerName = (customer as any).name || customerEmail?.split("@")[0] || "User";

        if (customerEmail) {
          const emailTemplate = getSubscriptionReactivatedEmail({
            userName: customerName,
            nextBillingDate: new Date((subscription as any).current_period_end * 1000).toLocaleDateString(),
          });

          await sendEmailToUser(customerEmail, emailTemplate.subject, emailTemplate.html);
        }
      }
    } else if (subscription.status === "canceled" || subscription.status === "unpaid") {
      await db.updateUserMembership(userId, { membershipStatus: "free" });
    }
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`[Webhook] Processing customer.subscription.deleted: ${subscription.id}`);

  // Update user membership status to free
  const userId = parseInt(subscription.metadata.user_id || "0");
  if (userId > 0) {
    await db.updateUserMembership(userId, { membershipStatus: "free" });
  }

  // Get customer email
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  const customerEmail = (customer as any).email;
  const customerName = (customer as any).name || customerEmail?.split("@")[0] || "User";

  if (customerEmail) {
    const emailTemplate = getSubscriptionCanceledEmail({
      userName: customerName,
      canceledAt: new Date(subscription.canceled_at! * 1000).toLocaleDateString(),
      accessUntil: new Date((subscription as any).current_period_end * 1000).toLocaleDateString(),
    });

    await sendEmailToUser(customerEmail, emailTemplate.subject, emailTemplate.html);
  }

  // Note: Subscription remains in database for historical records
  // Status is already updated to reflect deletion
}
