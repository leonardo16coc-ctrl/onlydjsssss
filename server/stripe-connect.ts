/**
 * Stripe Connect Integration
 * Handles DJ onboarding, KYC verification, and payouts
 */

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

/**
 * Create a Stripe Connect Express account for a DJ
 */
export async function createConnectAccount(email: string, country: string = "US") {
  const account = await stripe.accounts.create({
    type: "express",
    country,
    email,
    capabilities: {
      transfers: { requested: true },
    },
    business_type: "individual",
  });

  return account;
}

/**
 * Create an onboarding link for a DJ to complete KYC
 */
export async function createAccountLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string
) {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });

  return accountLink;
}

/**
 * Get the status of a Connect account
 */
export async function getAccountStatus(accountId: string) {
  const account = await stripe.accounts.retrieve(accountId);

  return {
    id: account.id,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
    requirements: {
      currentlyDue: account.requirements?.currently_due || [],
      eventuallyDue: account.requirements?.eventually_due || [],
      pastDue: account.requirements?.past_due || [],
      pendingVerification: account.requirements?.pending_verification || [],
    },
  };
}

/**
 * Create a login link to Stripe Connect Dashboard
 */
export async function createDashboardLink(accountId: string) {
  const loginLink = await stripe.accounts.createLoginLink(accountId);
  return loginLink.url;
}

/**
 * Get balance of a Connect account
 */
export async function getConnectBalance(accountId: string) {
  const balance = await stripe.balance.retrieve({
    stripeAccount: accountId,
  });

  // Convert from cents to dollars
  const available = balance.available.reduce((sum, b) => sum + b.amount, 0) / 100;
  const pending = balance.pending.reduce((sum, b) => sum + b.amount, 0) / 100;

  return {
    available,
    pending,
    currency: balance.available[0]?.currency || "usd",
  };
}

/**
 * Create a payout (transfer) to a Connect account
 */
export async function createPayout(
  accountId: string,
  amount: number,
  currency: string = "usd",
  description: string
) {
  // Amount in cents
  const amountCents = Math.round(amount * 100);

  const transfer = await stripe.transfers.create({
    amount: amountCents,
    currency,
    destination: accountId,
    description,
  });

  return transfer;
}

/**
 * Get payout history for a Connect account
 */
export async function getPayoutHistory(accountId: string, limit: number = 10) {
  const transfers = await stripe.transfers.list({
    destination: accountId,
    limit,
  });

  return transfers.data.map((transfer) => ({
    id: transfer.id,
    amount: transfer.amount / 100,
    currency: transfer.currency,
    description: transfer.description,
    created: new Date(transfer.created * 1000),
    status: transfer.reversed ? "reversed" : "paid",
  }));
}

/**
 * Get transaction history (balance transactions) for a Connect account
 */
export async function getTransactionHistory(accountId: string, limit: number = 20) {
  const transactions = await stripe.balanceTransactions.list(
    { limit },
    { stripeAccount: accountId }
  );

  return transactions.data.map((txn) => ({
    id: txn.id,
    amount: txn.amount / 100,
    net: txn.net / 100,
    fee: txn.fee / 100,
    currency: txn.currency,
    type: txn.type,
    description: txn.description,
    created: new Date(txn.created * 1000),
    status: txn.status,
  }));
}
