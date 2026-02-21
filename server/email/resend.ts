import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  abTestVariantId?: number;
}

export interface SendBulkEmailsParams {
  emails: Array<{
    to: string;
    subject: string;
    html: string;
    text?: string;
  }>;
}

/**
 * Send a single email using Resend
 */
export async function sendEmail(params: SendEmailParams) {
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });
    
    return {
      success: true,
      id: result.data?.id,
      error: null,
    };
  } catch (error: any) {
    console.error("[Resend] Error sending email:", error);
    return {
      success: false,
      id: null,
      error: error.message || "Unknown error",
    };
  }
}

/**
 * Send bulk emails using Resend batch API
 */
export async function sendBulkEmails(params: SendBulkEmailsParams) {
  try {
    const emails = params.emails.map((email) => ({
      from: FROM_EMAIL,
      to: email.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
    }));
    
    const result = await resend.batch.send(emails);
    
    return {
      success: true,
      data: result.data,
      error: null,
    };
  } catch (error: any) {
    console.error("[Resend] Error sending bulk emails:", error);
    return {
      success: false,
      data: null,
      error: error.message || "Unknown error",
    };
  }
}

/**
 * Generate HTML email template for DJ outreach
 */
export function generateDJOutreachEmail(params: {
  djName: string;
  message: string;
  platform: "instagram" | "email";
}) {
  const { djName, message, platform } = params;
  
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitación a ONLYDJS</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a; color: #e2e8f0;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: -0.5px;">
                ONLYDJS
              </h1>
              <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 14px;">
                The Operating System for DJs
              </p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #f1f5f9; font-size: 24px; font-weight: 600;">
                Hola ${djName} 👋
              </h2>
              
              <div style="color: #cbd5e1; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">
${message}
              </div>
              
              <div style="margin-top: 30px; text-align: center;">
                <a href="https://onlydjs-musi-zsqs9m2e.manus.space" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Visitar ONLYDJS
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #0f172a; text-align: center; border-top: 1px solid #334155;">
              <p style="margin: 0 0 10px; color: #64748b; font-size: 14px;">
                ONLYDJS - Plataforma de Música para DJs
              </p>
              <p style="margin: 0; color: #475569; font-size: 12px;">
                Si no deseas recibir más emails, puedes ignorar este mensaje.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
  
  // Plain text version
  const text = `
Hola ${djName},

${message}

Visita ONLYDJS: https://onlydjs-musi-zsqs9m2e.manus.space

---
ONLYDJS - Plataforma de Música para DJs
Si no deseas recibir más emails, puedes ignorar este mensaje.
  `.trim();
  
  return { html, text };
}
