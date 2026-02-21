import { getDb } from "./server/db";

async function show() {
  const db = await getDb();
  const [dj] = await db.query<any>('SELECT * FROM discovered_djs LIMIT 1');
  if (dj) {
    console.log("Columns:");
    Object.keys(dj).forEach(col => console.log(`  ${col}`));
  } else {
    console.log("No DJs found");
  }
}

show();
