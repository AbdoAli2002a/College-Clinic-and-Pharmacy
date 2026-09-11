import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
try {
  const pool = new Pool({
    user: undefined,
    password: undefined,
    host: undefined,
    database: undefined
  });
  const db = drizzle(pool, { schema: {} });
  console.log("Drizzle created without crashing");
} catch (e) {
  console.error("Drizzle crashed:", e);
}
