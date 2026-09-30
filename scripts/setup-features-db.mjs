import { createPool } from '@vercel/postgres';

async function setup() {
  console.log('Özellikler (Features & Traits) tablosu oluşturuluyor...');
  
  const pool = createPool({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_features_traits (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL DEFAULT ''
      );
    `);

    console.log('user_features_traits tablosu başarıyla oluşturuldu.');
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await pool.end();
  }
}

setup();
