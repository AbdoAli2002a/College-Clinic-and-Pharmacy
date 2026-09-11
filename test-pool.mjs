import { Pool } from 'pg';
try {
  const pool = new Pool({
    user: undefined,
    password: undefined,
    host: undefined,
    database: undefined
  });
  console.log("Pool created without crashing");
} catch (e) {
  console.error("Pool crashed:", e);
}
