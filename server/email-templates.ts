/**
 * Email Templates for Subscription Events
 * Uses Manus notification system to send emails
 */

export interface EmailTemplate {
  subject: string;
  html: string;
}

export function getPaymentSuccessEmail(data: {
  userName: string;
  amount: string;
  currency: string;
  invoiceUrl: string;
  periodEnd: string;
}): EmailTemplate {
  return {
    subject: "✅ Payment Confirmed - ONLYDJS PRO",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #06b6d4 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #a855f7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Payment Successful!</h1>
          </div>
          <div class="content">
            <p>Hi ${data.userName},</p>
            <p>Thank you for your payment! Your ONLYDJS PRO subscription is now active.</p>
            <p><strong>Payment Details:</strong></p>
            <ul>
              <li>Amount: ${data.amount} ${data.currency.toUpperCase()}</li>
              <li>Next billing date: ${data.periodEnd}</li>
            </ul>
            <p>You now have access to:</p>
            <ul>
              <li>✅ Unlimited streaming</li>
              <li>✅ 20 daily downloads</li>
              <li>✅ Full catalog access</li>
              <li>✅ DJ Mode & Mainstage features</li>
            </ul>
            <a href="${data.invoiceUrl}" class="button">Download Invoice</a>
            <p>If you have any questions, feel free to reach out to our support team.</p>
          </div>
          <div class="footer">
            <p>ONLYDJS - The #1 Platform for DJs</p>
            <p><a href="https://onlydjss.com">Visit Website</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

export function getPaymentFailedEmail(data: {
  userName: string;
  amount: string;
  currency: string;
  attemptCount: number;
  nextRetryDate?: string;
}): EmailTemplate {
  return {
    subject: "⚠️ Payment Failed - Action Required",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Payment Failed</h1>
          </div>
          <div class="content">
            <p>Hi ${data.userName},</p>
            <p>We were unable to process your payment for ONLYDJS PRO subscription.</p>
            <div class="warning">
              <strong>⚠️ Action Required:</strong> Please update your payment method to avoid service interruption.
            </div>
            <p><strong>Payment Details:</strong></p>
            <ul>
              <li>Amount: ${data.amount} ${data.currency.toUpperCase()}</li>
              <li>Attempt: ${data.attemptCount}</li>
              ${data.nextRetryDate ? `<li>Next retry: ${data.nextRetryDate}</li>` : ""}
            </ul>
            <p>To update your payment method and retry the payment:</p>
            <a href="https://onlydjss.com/subscription" class="button">Update Payment Method</a>
            <p>If you don't update your payment method, your subscription will be canceled and you'll lose access to PRO features.</p>
          </div>
          <div class="footer">
            <p>ONLYDJS - The #1 Platform for DJs</p>
            <p><a href="https://onlydjss.com">Visit Website</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

export function getSubscriptionCanceledEmail(data: {
  userName: string;
  canceledAt: string;
  accessUntil: string;
}): EmailTemplate {
  return {
    subject: "Subscription Canceled - ONLYDJS PRO",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6b7280; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .info { background: #f3f4f6; border-left: 4px solid #6b7280; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #a855f7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Subscription Canceled</h1>
          </div>
          <div class="content">
            <p>Hi ${data.userName},</p>
            <p>Your ONLYDJS PRO subscription has been canceled as requested.</p>
            <div class="info">
              <strong>📅 Access Until:</strong> ${data.accessUntil}<br>
              You'll continue to have PRO access until this date.
            </div>
            <p>After ${data.accessUntil}, you'll be downgraded to the FREE plan with limited features.</p>
            <p><strong>What you'll lose:</strong></p>
            <ul>
              <li>❌ Unlimited streaming</li>
              <li>❌ 20 daily downloads</li>
              <li>❌ Full catalog access</li>
            </ul>
            <p>Changed your mind? You can reactivate your subscription anytime before it expires:</p>
            <a href="https://onlydjss.com/subscription" class="button">Reactivate Subscription</a>
            <p>We're sad to see you go, but we hope to have you back soon! 💜</p>
          </div>
          <div class="footer">
            <p>ONLYDJS - The #1 Platform for DJs</p>
            <p><a href="https://onlydjss.com">Visit Website</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

export function getSubscriptionReactivatedEmail(data: {
  userName: string;
  nextBillingDate: string;
}): EmailTemplate {
  return {
    subject: "🎉 Welcome Back! Subscription Reactivated",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #06b6d4 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #a855f7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome Back!</h1>
          </div>
          <div class="content">
            <p>Hi ${data.userName},</p>
            <p>Great news! Your ONLYDJS PRO subscription has been reactivated.</p>
            <p><strong>Next billing date:</strong> ${data.nextBillingDate}</p>
            <p>You now have full access to all PRO features again:</p>
            <ul>
              <li>✅ Unlimited streaming</li>
              <li>✅ 20 daily downloads</li>
              <li>✅ Full catalog access</li>
              <li>✅ DJ Mode & Mainstage features</li>
            </ul>
            <a href="https://onlydjss.com/explore" class="button">Start Exploring</a>
            <p>We're thrilled to have you back! 🎵</p>
          </div>
          <div class="footer">
            <p>ONLYDJS - The #1 Platform for DJs</p>
            <p><a href="https://onlydjss.com">Visit Website</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

export function getRenewalReminderEmail(data: {
  userName: string;
  renewalDate: string;
  amount: string;
  currency: string;
}): EmailTemplate {
  return {
    subject: "🔔 Subscription Renewal Reminder - ONLYDJS PRO",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #06b6d4 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .info { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #a855f7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Renewal Reminder</h1>
          </div>
          <div class="content">
            <p>Hi ${data.userName},</p>
            <p>This is a friendly reminder that your ONLYDJS PRO subscription will renew soon.</p>
            <div class="info">
              <strong>📅 Renewal Date:</strong> ${data.renewalDate}<br>
              <strong>💳 Amount:</strong> ${data.amount} ${data.currency.toUpperCase()}
            </div>
            <p>Your payment method will be charged automatically. Make sure your payment information is up to date to avoid any interruptions.</p>
            <a href="https://onlydjss.com/subscription" class="button">Manage Subscription</a>
            <p>Thank you for being a valued PRO member! 💜</p>
          </div>
          <div class="footer">
            <p>ONLYDJS - The #1 Platform for DJs</p>
            <p><a href="https://onlydjss.com">Visit Website</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}
