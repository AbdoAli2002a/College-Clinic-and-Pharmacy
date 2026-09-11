import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'wrong',
  password: 'wrong',
});

const db = drizzle(pool);

async function run() {
  try {
    await db.execute('SELECT 1');
  } catch (e) {
    console.error("Caught error in query:", e.message);
  }
}
run();

setTimeout(() => {
  console.log("Process still alive?");
}, 2000);
