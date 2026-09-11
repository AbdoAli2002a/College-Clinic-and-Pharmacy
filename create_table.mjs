import pg from 'pg';
const pool = new pg.Pool({
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  host: process.env.SQL_HOST,
  database: process.env.SQL_DB_NAME,
});

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      student_id VARCHAR(50) NOT NULL REFERENCES student_medical_records(university_id),
      appointment_date TIMESTAMP NOT NULL,
      reason TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  console.log("Table created.");
  process.exit(0);
}
main().catch(console.error);
