import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { users } from './src/db/schema.js';

const pool = new Pool({
  connectionString: 'postgresql://postgres:283495a%40A2002@db.orfgvzonhvazsthqmqoy.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const db = drizzle(pool);

async function main() {
  await db.update(users).set({ password: '123' }).where(eq(users.username, 'admin'));
  await db.update(users).set({ password: '123' }).where(eq(users.username, 'pharm_ali'));
  await db.update(users).set({ password: '123' }).where(eq(users.username, 'dr_ahmed'));
  
  const all = await db.select().from(users);
  console.log("Users:", all);
  
  process.exit(0);
}

main().catch(console.error);
