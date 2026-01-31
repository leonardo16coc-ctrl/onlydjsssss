import { Request, Response } from "express";
import Stripe from "stripe";
import { stripe } from "../stripe";
import { ENV } from "../_core/env";
import { updateUserMembership, getUserById, createSubscription } from "../db";
import { notifyOwner } from "../_core/notification";
import {
  getPaymentSuccessEmail,
  getPaymentFailedEmail,
  getSubscriptionCanceledEmail,
  getSubscriptionReactivatedEmail,
} from "../email-templates";

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

  // Get customer email and send cancellation email
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

  console.log(`[Stripe Webhook] User ${userId} membership cancelled`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log("[Stripe Webhook] Invoice paid:", invoice.id);
  
  if (!invoice.customer_email) {
    console.log("[Stripe Webhook] No customer email, skipping notification");
    return;
  }

  // Get customer details
  const customer = await stripe.customers.retrieve(invoice.customer as string);
  const customerName = (customer as any).name || invoice.customer_email.split("@")[0];

  // Update subscription in database if exists
  if ((invoice as any).subscription) {
    const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string);
    const priceId = (subscription.items.data[0]?.price.id) || "";
    
    await createSubscription({
      userId: parseInt((subscription.metadata.user_id || "0")),
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      stripePriceId: priceId,
      status: subscription.status as "active" | "canceled" | "past_due" | "unpaid" | "trialing",
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
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
  console.log("[Stripe Webhook] Invoice payment failed:", invoice.id);
  
  if (!invoice.customer_email) {
    console.log("[Stripe Webhook] No customer email, skipping notification");
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
