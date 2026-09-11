import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { users } from './src/db/schema.js';

const pool = new Pool({
  connectionString: 'postgresql://postgres:283495a%40A2002@db.orfgvzonhvazsthqmqoy.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const db = drizzle(pool);

async function main() {
  const allUsers = await db.select().from(users);
  console.log(allUsers);
  process.exit(0);
}

main().catch(console.error);
