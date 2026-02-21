import { getDb } from "./server/db";
import { sql } from "drizzle-orm";

async function checkColumns() {
  const db = await getDb();
  if (!db) {
    console.log("❌ Database not available");
    return;
  }

  console.log("📋 Checking email_campaigns columns...\n");
  
  const result = await db.execute(
    sql`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'email_campaigns' ORDER BY ORDINAL_POSITION`
  );
  
  console.log("Columns in email_campaigns:");
  result.forEach((row: any) => {
    console.log(`  - ${row.COLUMN_NAME}`);
  });
}

checkColumns().catch(console.error);
