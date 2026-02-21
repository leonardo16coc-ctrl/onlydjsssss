import { getDb } from "./server/db";
import { sql } from "drizzle-orm";

async function check() {
  const db = await getDb();
  if (!db) {
    console.log("❌ Database not available");
    return;
  }

  try {
    const result = await db.execute(sql`SHOW CREATE TABLE email_campaigns`);
    console.log("✅ Table email_campaigns exists");
    console.log(result);
  } catch (error: any) {
    console.log("❌ Table does not exist:", error.message);
  }
}

check();
