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
  const userList = await db.select().from(users).where(eq(users.username, 'ahmed'));
  console.log("Found:", userList);
  process.exit(0);
}

main().catch(console.error);
