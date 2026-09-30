import { createPool } from '@vercel/postgres';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const match = env.match(/POSTGRES_URL=([^\n\r]+)/);
const postgresUrl = match[1];

async function upgradeDB() {
  const pool = createPool({
    connectionString: postgresUrl,
  });
  try {
    console.log("Upgrading DB...");
    try { await pool.query(`ALTER TABLE users ADD COLUMN max_hp INTEGER DEFAULT 20`); } catch (e) { console.log(e.message) }
    try { await pool.query(`ALTER TABLE users ADD COLUMN current_hp INTEGER DEFAULT 20`); } catch (e) { console.log(e.message) }
    try { await pool.query(`ALTER TABLE users ADD COLUMN armor_class INTEGER DEFAULT 0`); } catch (e) { console.log(e.message) }
    try { await pool.query(`ALTER TABLE users ADD COLUMN stats JSONB`); } catch (e) { console.log(e.message) }
    try { await pool.query(`ALTER TABLE users ADD COLUMN skills JSONB`); } catch (e) { console.log(e.message) }
    try { await pool.query(`ALTER TABLE users ADD COLUMN equipment TEXT`); } catch (e) { console.log(e.message) }
    try { await pool.query(`ALTER TABLE users ADD COLUMN bag TEXT`); } catch (e) { console.log(e.message) }
    try { await pool.query(`ALTER TABLE users ADD COLUMN notes TEXT`); } catch (e) { console.log(e.message) }
    try { await pool.query(`ALTER TABLE users ADD COLUMN features TEXT`); } catch (e) { console.log(e.message) }
    try { await pool.query(`ALTER TABLE users ADD COLUMN money_amount INTEGER DEFAULT 0`); } catch (e) { console.log(e.message) }
    console.log("Upgraded successfully");
  } catch (e) {
    console.log("Error:", e.message);
  } finally {
    await pool.end();
  }
}
upgradeDB();
