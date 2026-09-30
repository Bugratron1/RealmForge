import { createPool } from '@vercel/postgres';

async function upgradeDB() {
  const pool = createPool({
    connectionString: process.env.POSTGRES_URL,
  });
  try {
    console.log("Upgrading DB...");
    await pool.query(`ALTER TABLE users ADD COLUMN max_hp INTEGER DEFAULT 20`);
    await pool.query(`ALTER TABLE users ADD COLUMN current_hp INTEGER DEFAULT 20`);
    await pool.query(`ALTER TABLE users ADD COLUMN armor_class INTEGER DEFAULT 0`);
    await pool.query(`ALTER TABLE users ADD COLUMN stats JSONB`);
    await pool.query(`ALTER TABLE users ADD COLUMN skills JSONB`);
    await pool.query(`ALTER TABLE users ADD COLUMN equipment TEXT`);
    await pool.query(`ALTER TABLE users ADD COLUMN bag TEXT`);
    await pool.query(`ALTER TABLE users ADD COLUMN notes TEXT`);
    await pool.query(`ALTER TABLE users ADD COLUMN features TEXT`);
    await pool.query(`ALTER TABLE users ADD COLUMN money_amount INTEGER DEFAULT 0`);
    console.log("Upgraded successfully");
  } catch (e) {
    console.log("Error:", e.message);
  } finally {
    await pool.end();
  }
}
upgradeDB();
