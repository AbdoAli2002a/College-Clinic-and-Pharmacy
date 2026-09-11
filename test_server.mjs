import 'dotenv/config';
import { db } from './src/db/index.js';
import { users } from './src/db/schema.js';
import { eq } from 'drizzle-orm';
async function run() {
  const userList = await db.select().from(users).where(eq(users.username, 'admin'));
  console.log("DB config:", process.env.DATABASE_URL);
  console.log("User:", userList);
  process.exit(0);
}
run();
