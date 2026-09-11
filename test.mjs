import { pgTable, serial, text } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';

const pool = new pkg.Pool();
const db = drizzle(pool);

let clinicQueue = [];
try {
  await db.insert(clinicQueue).values({
    studentId: '123'
  });
} catch(e) {
  console.log(e);
}
process.exit(0);
