/**
 * Wallet Router - DJ Earnings and Payouts
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as stripeConnect from "../stripe-connect";
import { getDb } from "../db";
import { users, wallets } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const walletRouter = router({
  /**
   * Create Stripe Connect account for DJ
   */
  createConnectAccount: protectedProcedure
    .input(
      z.object({
        country: z.string().default("US"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      if (!user[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // Check if already has Connect account
      if (user[0].stripeConnectAccountId) {
        return { accountId: user[0].stripeConnectAccountId, alreadyExists: true };
      }

      // Create Connect account
      const account = await stripeConnect.createConnectAccount(
        user[0].email || `user${ctx.user.id}@onlydjs.com`,
        input.country
      );

      // Save to database
      await db
        .update(users)
        .set({ stripeConnectAccountId: account.id })
        .where(eq(users.id, ctx.user.id));

      return { accountId: account.id, alreadyExists: false };
    }),

  /**
   * Get onboarding link for Stripe Connect
   */
  getOnboardingLink: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

    const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
    if (!user[0] || !user[0].stripeConnectAccountId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No Connect account found. Create one first.",
      });
    }

    const origin = ctx.req.headers.origin || "http://localhost:3000";
    const accountLink = await stripeConnect.createAccountLink(
      user[0].stripeConnectAccountId,
      `${origin}/wallet/onboarding`,
      `${origin}/wallet`
    );

    return { url: accountLink.url };
  }),

  /**
   * Get Connect account status
   */
  getAccountStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

    const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
    if (!user[0] || !user[0].stripeConnectAccountId) {
      return { hasAccount: false };
    }

    const status = await stripeConnect.getAccountStatus(user[0].stripeConnectAccountId);

    return {
      hasAccount: true,
      ...status,
    };
  }),

  /**
   * Get wallet balance
   */
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

    const wallet = await db.select().from(wallets).where(eq(wallets.userId, ctx.user.id)).limit(1);
    
    if (!wallet[0]) {
      // Create wallet if doesn't exist
      await db.insert(wallets).values({
        userId: ctx.user.id,
        availableBalance: "0.00",
        pendingBalance: "0.00",
        totalEarnings: "0.00",
      });

      return {
        available: 0,
        pending: 0,
        total: 0,
        currency: "usd",
      };
    }

    return {
      available: parseFloat(wallet[0].availableBalance),
      pending: parseFloat(wallet[0].pendingBalance),
      total: parseFloat(wallet[0].totalEarnings),
      currency: "usd",
    };
  }),

  /**
   * Get Stripe Connect balance (real-time from Stripe)
   */
  getStripeBalance: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

    const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
    if (!user[0] || !user[0].stripeConnectAccountId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No Connect account found",
      });
    }

    const balance = await stripeConnect.getConnectBalance(user[0].stripeConnectAccountId);
    return balance;
  }),

  /**
   * Request payout
   */
  requestPayout: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(10).max(10000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      if (!user[0] || !user[0].stripeConnectAccountId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No Connect account found",
        });
      }

      // Check wallet balance
      const wallet = await db.select().from(wallets).where(eq(wallets.userId, ctx.user.id)).limit(1);
      if (!wallet[0] || parseFloat(wallet[0].availableBalance) < input.amount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient balance",
        });
      }

      // Create payout via Stripe Connect
      const transfer = await stripeConnect.createPayout(
        user[0].stripeConnectAccountId,
        input.amount,
        "usd",
        `ONLYDJS Payout - ${new Date().toLocaleDateString()}`
      );

      // Update wallet balance
      const newBalance = parseFloat(wallet[0].availableBalance) - input.amount;
      await db
        .update(wallets)
        .set({ availableBalance: newBalance.toFixed(2) })
        .where(eq(wallets.userId, ctx.user.id));

      return {
        success: true,
        transferId: transfer.id,
        amount: input.amount,
      };
    }),

  /**
   * Get payout history
   */
  getPayoutHistory: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

    const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
    if (!user[0] || !user[0].stripeConnectAccountId) {
      return [];
    }

    const history = await stripeConnect.getPayoutHistory(user[0].stripeConnectAccountId, 20);
    return history;
  }),

  /**
   * Get transaction history
   */
  getTransactions: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

    const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
    if (!user[0] || !user[0].stripeConnectAccountId) {
      return [];
    }

    const transactions = await stripeConnect.getTransactionHistory(user[0].stripeConnectAccountId, 50);
    return transactions;
  }),

  /**
   * Get Stripe Connect Dashboard link
   */
  getDashboardLink: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

    const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
    if (!user[0] || !user[0].stripeConnectAccountId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No Connect account found",
      });
    }

    const url = await stripeConnect.createDashboardLink(user[0].stripeConnectAccountId);
    return { url };
  }),
});
