import { eq } from 'drizzle-orm';
import { users } from './src/db/schema.js';
try {
  eq(users.username, undefined);
  console.log("Did not throw");
} catch (e) {
  console.error("Threw error:", e.message);
}
