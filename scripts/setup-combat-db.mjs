import { createPool } from '@vercel/postgres';

async function setup() {
  console.log('Combat tabloları oluşturuluyor...');
  
  const pool = createPool({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_combat_status (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        max_hp INTEGER NOT NULL DEFAULT 20 CHECK (max_hp >= 1),
        current_hp INTEGER NOT NULL DEFAULT 20 CHECK (current_hp >= 0),
        dr INTEGER NOT NULL DEFAULT 0 CHECK (dr >= 0)
      );
    `);

    // Add constraint to ensure current_hp <= max_hp if it doesn't exist
    // (This might throw if constraint exists, so we ignore errors gracefully if needed, 
    // or just run it via alter table if not exists - PG doesn't have IF NOT EXISTS for constraints easily,
    // so we can drop and recreate)
    await pool.query(`
      ALTER TABLE user_combat_status DROP CONSTRAINT IF EXISTS check_hp_max;
      ALTER TABLE user_combat_status ADD CONSTRAINT check_hp_max CHECK (current_hp <= max_hp);
    `);

    console.log('user_combat_status tablosu başarıyla oluşturuldu.');
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await pool.end();
  }
}

setup();
