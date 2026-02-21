import { sendEmail, generateDJOutreachEmail } from "./server/email/resend";

async function testEmailSend() {
  console.log("🧪 Testing email send to DJ...\n");
  
  const djName = "Test DJ";
  const testEmail = "odjscompany@gmail.com"; // Your email for testing
  
  const message = `Hemos descubierto tu increíble trabajo y nos encantaría invitarte a unirte a ONLYDJS.

ONLYDJS es la plataforma definitiva para DJs profesionales donde puedes:
• Subir y monetizar tus extended mixes, remixes y mashups
• Conectar con otros DJs y productores de todo el mundo
• Acceder a herramientas de IA para crear sets perfectos
• Ganar dinero con cada descarga de tus tracks

Únete a nuestra comunidad de DJs profesionales y lleva tu carrera al siguiente nivel.`;
  
  const { html, text } = generateDJOutreachEmail({
    djName,
    message,
    platform: "email",
  });
  
  console.log("📧 Sending email to:", testEmail);
  console.log("📝 Subject: Invitación exclusiva a ONLYDJS - Plataforma para DJs\n");
  
  const result = await sendEmail({
    to: testEmail,
    subject: "Invitación exclusiva a ONLYDJS - Plataforma para DJs",
    html,
    text,
  });
  
  if (result.success) {
    console.log("✅ Email sent successfully!");
    console.log("📬 Email ID:", result.id);
  } else {
    console.log("❌ Email failed to send");
    console.log("Error:", result.error);
  }
}

testEmailSend().catch(console.error);
