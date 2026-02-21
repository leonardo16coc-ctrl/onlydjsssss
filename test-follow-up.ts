import { sendFollowUpEmails, detectFollowUpNeeded } from "./server/email/follow-up-system";

async function testFollowUp() {
  console.log("🧪 Testing Follow-Up System\n");
  
  // Step 1: Detect DJs needing follow-up
  console.log("📋 Step 1: Detecting DJs needing follow-up...");
  const djsNeedingFollowUp = await detectFollowUpNeeded();
  console.log(`Found ${djsNeedingFollowUp.length} DJs needing follow-up\n`);
  
  if (djsNeedingFollowUp.length > 0) {
    console.log("DJs needing follow-up:");
    djsNeedingFollowUp.forEach((dj, i) => {
      console.log(`${i + 1}. ${dj.name} (${dj.primaryGenre}) - Last contacted: ${dj.lastContactedAt}`);
    });
    console.log();
  }
  
  // Step 2: Send follow-up emails
  console.log("📧 Step 2: Sending follow-up emails...");
  const result = await sendFollowUpEmails();
  
  console.log("\n✅ Follow-up test completed!");
  console.log(`📧 Sent: ${result.sent}`);
  console.log(`❌ Failed: ${result.failed}`);
  console.log(`📊 Details:`, result.details);
}

testFollowUp().catch(console.error);
