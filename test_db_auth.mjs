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
  const username = 'admin';
  const password = '123';
  
  const userList = await db.select().from(users).where(eq(users.username, username));
  console.log("DB returned:", userList);
  
  if (userList.length > 0) {
    console.log("Match?", userList[0].password === password, `'${userList[0].password}'`, `'${password}'`);
  }
  
  process.exit(0);
}
main();
