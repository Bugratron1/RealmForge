import { createPool } from '@vercel/postgres';

async function setup() {
  console.log('Envanter tabloları oluşturuluyor...');
  
  const pool = createPool({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_money (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        amount INTEGER NOT NULL DEFAULT 0 CHECK (amount >= 0)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_equipment (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL DEFAULT ''
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_bag (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL DEFAULT ''
      );
    `);

    console.log('Envanter tabloları başarıyla oluşturuldu.');
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await pool.end();
  }
}

setup();
