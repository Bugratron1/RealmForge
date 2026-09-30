import { createPool } from '@vercel/postgres';

async function setup() {
  console.log('Notlar (Notes) tablosu oluşturuluyor...');
  
  const pool = createPool({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_notes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log('user_notes tablosu başarıyla oluşturuldu.');
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await pool.end();
  }
}

setup();
