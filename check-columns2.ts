import { getDb } from "./server/db";
import { sql } from "drizzle-orm";

async function checkColumns() {
  const db = await getDb();
  if (!db) {
    console.log("❌ Database not available");
    return;
  }

  console.log("📋 Checking email_campaigns structure...\n");
  
  const result = await db.execute(
    sql`SELECT * FROM email_campaigns LIMIT 1`
  );
  
  if (result && result.length > 0) {
    console.log("Columns found:");
    console.log(Object.keys(result[0]));
  } else {
    console.log("No rows in table, checking with DESCRIBE");
    const desc = await db.execute(sql`DESCRIBE email_campaigns`);
    console.log(desc);
  }
}

checkColumns().catch(console.error);
