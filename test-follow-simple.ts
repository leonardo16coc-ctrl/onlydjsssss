import { detectFollowUpNeeded } from "./server/email/follow-up-system";

async function test() {
  console.log("Testing follow-up detection...");
  try {
    const djs = await detectFollowUpNeeded();
    console.log(`Found ${djs.length} DJs needing follow-up`);
    console.log("SUCCESS!");
  } catch (error) {
    console.error("ERROR:", error);
  }
}

test();
