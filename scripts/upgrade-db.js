const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function upgradeDB() {
  try {
    console.log("Upgrading DB...");
    await sql`ALTER TABLE users ADD COLUMN max_hp INTEGER DEFAULT 20`;
    await sql`ALTER TABLE users ADD COLUMN current_hp INTEGER DEFAULT 20`;
    await sql`ALTER TABLE users ADD COLUMN armor_class INTEGER DEFAULT 0`;
    await sql`ALTER TABLE users ADD COLUMN stats JSONB`;
    await sql`ALTER TABLE users ADD COLUMN skills JSONB`;
    await sql`ALTER TABLE users ADD COLUMN equipment TEXT`;
    await sql`ALTER TABLE users ADD COLUMN bag TEXT`;
    await sql`ALTER TABLE users ADD COLUMN notes TEXT`;
    await sql`ALTER TABLE users ADD COLUMN features TEXT`;
    await sql`ALTER TABLE users ADD COLUMN money_amount INTEGER DEFAULT 0`;
    console.log("Upgraded successfully");
  } catch (e) {
    console.log("Error:", e.message);
  }
}
upgradeDB();
