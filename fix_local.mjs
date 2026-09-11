import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { users } from './src/db/schema.js';
const pool = new Pool({
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  host: process.env.SQL_HOST,
  database: process.env.SQL_DB_NAME,
});
const db = drizzle(pool);
async function main() {
  await db.update(users).set({ password: '123' }).where(eq(users.username, 'admin'));
  await db.update(users).set({ password: '123' }).where(eq(users.username, 'dr_ahmed'));
  await db.update(users).set({ password: '123' }).where(eq(users.username, 'pharm_ali'));
  console.log("Local passwords updated to 123");
  process.exit(0);
}
main();
