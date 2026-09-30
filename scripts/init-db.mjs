import { createPool } from '@vercel/postgres';

async function init() {
  console.log('Tablo oluşturuluyor...');
  
  // Create a database connection pool
  const pool = createPool({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        uID VARCHAR(255) NOT NULL UNIQUE,
        ad VARCHAR(255) NOT NULL,
        sinif VARCHAR(255) NOT NULL,
        seviye INTEGER DEFAULT 1 NOT NULL,
        resim TEXT
      );
    `);
    console.log('Kullanıcı tablosu (users) başarıyla oluşturuldu!');
  } catch (error) {
    console.error('Tablo oluşturulurken bir hata oluştu:', error);
  } finally {
    // End the pool connection to exit the process smoothly
    await pool.end();
  }
}

init();
