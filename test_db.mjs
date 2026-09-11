import pg from 'pg';
const { Pool } = pg;

async function test(pw) {
  console.log('Testing pw:', pw);
  const pool = new Pool({
    connectionString: `postgresql://postgres:${pw}@db.orfgvzonhvazsthqmqoy.supabase.co:5432/postgres`,
    ssl: { rejectUnauthorized: false }
  });
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Success:', res.rows);
    return true;
  } catch (e) {
    console.error('Error:', e.message);
    return false;
  } finally {
    await pool.end();
  }
}

async function main() {
  const pw1 = encodeURIComponent('283495a@A2002');
  const pw2 = encodeURIComponent('[283495a@A2002]');
  
  if (await test(pw1)) return;
  if (await test(pw2)) return;
}
main();
