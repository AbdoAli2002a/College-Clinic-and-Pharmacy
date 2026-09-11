import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    user: process.env.SQL_USER!,
    password: process.env.SQL_PASSWORD!,
    host: process.env.SQL_HOST!,
    database: process.env.SQL_DB_NAME!,
  },
});
