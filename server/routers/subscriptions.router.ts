import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import * as db from "../db";
import { STRIPE_PRODUCTS } from "../stripe-products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export const subscriptionsRouter = router({
  /**
   * Get current subscription status
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await db.getSubscriptionByUserId(ctx.user.id);
    
    if (!subscription) {
      return {
        status: "free",
        plan: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      };
    }
    
    return {
      status: subscription.status,
      plan: "PRO",
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    };
  }),

  /**
   * Get detailed subscription information
   */
  getDetails: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await db.getSubscriptionByUserId(ctx.user.id);
    
    if (!subscription) {
      return {
        hasSubscription: false,
        status: "free",
        plan: null,
        price: null,
        currency: null,
        interval: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        canceledAt: null,
        paymentMethod: null,
      };
    }

    // Get payment method from Stripe
    let paymentMethod = null;
    try {
      const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
      if (stripeSubscription.default_payment_method) {
        const pm = await stripe.paymentMethods.retrieve(stripeSubscription.default_payment_method as string);
        paymentMethod = {
          brand: pm.card?.brand || "unknown",
          last4: pm.card?.last4 || "****",
          expMonth: pm.card?.exp_month || 0,
          expYear: pm.card?.exp_year || 0,
        };
      }
    } catch (error) {
      console.error("[Subscriptions] Error fetching payment method:", error);
    }
    
    return {
      hasSubscription: true,
      status: subscription.status,
      plan: "ONLYDJS PRO",
      price: 4.99,
      currency: "USD",
      interval: "month",
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      canceledAt: subscription.canceledAt,
      paymentMethod,
    };
  }),

  /**
   * Get payment history
   */
  getPaymentHistory: protectedProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(100).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const subscription = await db.getSubscriptionByUserId(ctx.user.id);
      
      if (!subscription) {
        return {
          payments: [],
          hasMore: false,
        };
      }

      try {
        // Get invoices from Stripe
        const invoices = await stripe.invoices.list({
          customer: subscription.stripeCustomerId,
          limit: input.limit,
        });

        const payments = invoices.data.map(invoice => ({
          id: invoice.id,
          amount: invoice.amount_paid / 100, // Convert from cents
          currency: invoice.currency.toUpperCase(),
          status: invoice.status,
          date: new Date(invoice.created * 1000),
          invoiceUrl: invoice.hosted_invoice_url,
          invoicePdf: invoice.invoice_pdf,
          description: invoice.lines.data[0]?.description || "ONLYDJS PRO Subscription",
        }));

        return {
          payments,
          hasMore: invoices.has_more,
        };
      } catch (error) {
        console.error("[Subscriptions] Error fetching payment history:", error);
        return {
          payments: [],
          hasMore: false,
        };
      }
    }),

  /**
   * Create checkout session for PRO subscription
   */
  createCheckoutSession: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      // Check if user already has active subscription
      const existingSubscription = await db.getSubscriptionByUserId(ctx.user.id);
      if (existingSubscription && existingSubscription.status === "active") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ya tienes una suscripción activa",
        });
      }

      // Get or create Stripe customer
      let customerId = existingSubscription?.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: ctx.user.email || undefined,
          name: ctx.user.name || undefined,
          metadata: {
            userId: ctx.user.id.toString(),
          },
        });
        customerId = customer.id;
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: STRIPE_PRODUCTS.PRO.priceId,
            quantity: 1,
          },
        ],
        success_url: `${ctx.req.headers.origin}/dashboard?subscription=success`,
        cancel_url: `${ctx.req.headers.origin}/membership?subscription=canceled`,
        allow_promotion_codes: true,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          userId: ctx.user.id.toString(),
          userEmail: ctx.user.email || "",
          userName: ctx.user.name || "",
        },
      });

      return {
        url: session.url,
      };
    } catch (error) {
      console.error("[Subscriptions] Error creating checkout session:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al crear sesión de pago",
      });
    }
  }),

  /**
   * Create customer portal session for managing subscription
   */
  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const subscription = await db.getSubscriptionByUserId(ctx.user.id);
      
      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No tienes una suscripción activa",
        });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: `${ctx.req.headers.origin}/dashboard`,
      });

      return {
        url: session.url,
      };
    } catch (error) {
      console.error("[Subscriptions] Error creating portal session:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al crear sesión del portal",
      });
    }
  }),

  /**
   * Cancel subscription at period end
   */
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const subscription = await db.getSubscriptionByUserId(ctx.user.id);
      
      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No tienes una suscripción activa",
        });
      }

      // Cancel at period end in Stripe
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      // Update in database
      await db.updateSubscription(ctx.user.id, {
        cancelAtPeriodEnd: true,
      });

      return {
        success: true,
        message: "Tu suscripción se cancelará al final del período actual",
      };
    } catch (error) {
      console.error("[Subscriptions] Error canceling subscription:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al cancelar suscripción",
      });
    }
  }),

  /**
   * Reactivate canceled subscription
   */
  reactivateSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const subscription = await db.getSubscriptionByUserId(ctx.user.id);
      
      if (!subscription || !subscription.cancelAtPeriodEnd) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No hay suscripción cancelada para reactivar",
        });
      }

      // Reactivate in Stripe
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: false,
      });

      // Update in database
      await db.updateSubscription(ctx.user.id, {
        cancelAtPeriodEnd: false,
        canceledAt: null,
      });

      return {
        success: true,
        message: "Tu suscripción ha sido reactivada",
      };
    } catch (error) {
      console.error("[Subscriptions] Error reactivating subscription:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al reactivar suscripción",
      });
    }
  }),
});
