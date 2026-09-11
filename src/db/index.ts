import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

let pool: Pool;

if (process.env.DATABASE_URL) {
  // Use connection string if provided (e.g., from Vercel, Supabase, Neon)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  // Use the connection variables from AI Studio environment
  pool = new Pool({
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    host: process.env.SQL_HOST,
    database: process.env.SQL_DB_NAME,
  });
}

export const db = drizzle(pool, { schema });
