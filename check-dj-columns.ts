import { getDb } from "./server/db";
import { sql } from "drizzle-orm";

async function check() {
  const db = await getDb();
  const result = await db.execute(sql`SELECT * FROM discovered_djs LIMIT 1`);
  if (result && result.length > 0) {
    console.log("Columns in discovered_djs:");
    Object.keys(result[0]).forEach(col => console.log(`  - ${col}`));
  } else {
    console.log("No rows in discovered_djs");
  }
}

check();
