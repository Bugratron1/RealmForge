const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  await sql`
    CREATE TABLE IF NOT EXISTS dm_rooms (
      room_id VARCHAR PRIMARY KEY,
      combatants JSONB,
      active_turn_index INT,
      scene_image_url TEXT,
      scene_title TEXT,
      notes JSONB,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log('Done creating dm_rooms table');
}

main().catch(console.error);
