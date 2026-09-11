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
  console.log('Updating users...');
  
  // Add admin
  await db.insert(users).values({
    id: 'u3',
    name: 'إدارة النظام',
    username: 'admin',
    password: '123',
    role: 'admin',
    email: 'admin@clinic.com'
  }).onConflictDoNothing();
  
  // Add pharm_ali
  await db.insert(users).values({
    id: 'u2',
    name: 'د. علي فارماسي',
    username: 'pharm_ali',
    password: '123',
    role: 'pharmacist',
    email: 'ali@clinic.com'
  }).onConflictDoNothing();
  
  // Update doc_123
  await db.update(users).set({
    username: 'dr_ahmed',
    password: '123'
  }).where(eq(users.id, 'doc_123'));
  
  console.log('Done!');
  process.exit(0);
}

main().catch(console.error);
