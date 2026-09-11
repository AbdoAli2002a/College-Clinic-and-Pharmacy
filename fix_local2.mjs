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
  await db.insert(users).values([
    { id: 'u1', name: 'د. أحمد خليل', username: 'dr_ahmed', password: '123', role: 'doctor', email: 'doc@c.com' },
    { id: 'u2', name: 'د. علي فارماسي', username: 'pharm_ali', password: '123', role: 'pharmacist', email: 'p@c.com' }
  ]).onConflictDoNothing();
  console.log("Local users added");
  process.exit(0);
}
main();
