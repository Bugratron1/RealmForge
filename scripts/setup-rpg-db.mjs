import { createPool } from '@vercel/postgres';

async function setup() {
  console.log('RPG tabloları oluşturuluyor...');
  
  const pool = createPool({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    // 1. attributes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS attributes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(10) UNIQUE NOT NULL,
        name VARCHAR(50) NOT NULL
      );
    `);
    
    // 2. skills table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS skills (
        id SERIAL PRIMARY KEY,
        attribute_id INTEGER REFERENCES attributes(id) ON DELETE CASCADE,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL
      );
    `);

    // 3. user_attributes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_attributes (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        attribute_id INTEGER REFERENCES attributes(id) ON DELETE CASCADE,
        base_value INTEGER NOT NULL DEFAULT 10,
        bonus_value INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (user_id, attribute_id)
      );
    `);

    // 4. user_skills table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_skills (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
        value INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (user_id, skill_id)
      );
    `);

    console.log('Tablolar başarıyla oluşturuldu.');

    // Seed Data
    console.log('Seed verileri ekleniyor...');
    
    const attributes = [
      { code: 'STR', name: 'Güç' },
      { code: 'DEX', name: 'Çeviklik' },
      { code: 'CON', name: 'Dayanıklılık' },
      { code: 'INT', name: 'Zeka' },
      { code: 'CHA', name: 'Karizma' },
      { code: 'WIS', name: 'Bilgelik' }
    ];

    for (const attr of attributes) {
      await pool.query(
        'INSERT INTO attributes (code, name) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING',
        [attr.code, attr.name]
      );
    }

    const skills = [
      // STR
      { attr: 'STR', code: 'MELEE', name: 'Yakın Dövüş' },
      { attr: 'STR', code: 'ATHLETICS', name: 'Atletizm' },
      { attr: 'STR', code: 'BRUTE_FORCE', name: 'Kaba Kuvvet' },
      // DEX
      { attr: 'DEX', code: 'RANGED', name: 'Menzilli Dövüş / İsabet' },
      { attr: 'DEX', code: 'STEALTH', name: 'Gizlilik' },
      { attr: 'DEX', code: 'SLEIGHT', name: 'El Çabukluğu' },
      { attr: 'DEX', code: 'ACROBATICS', name: 'Akrobasi / Refleks' },
      // CON
      { attr: 'CON', code: 'RESISTANCE', name: 'Fiziksel Direnç' },
      { attr: 'CON', code: 'POISON_RES', name: 'Zırh / Hastalık' },
      { attr: 'CON', code: 'RECOVERY', name: 'İyileşme / Metanet' },
      // INT
      { attr: 'INT', code: 'INVESTIGATION', name: 'Araştırma / Mantık' },
      { attr: 'INT', code: 'MEDICINE', name: 'Tıp & Simya' },
      { attr: 'INT', code: 'HISTORY', name: 'Tarih & Bilgi' },
      { attr: 'INT', code: 'TACTICS', name: 'Taktik / Strateji' },
      // CHA
      { attr: 'CHA', code: 'PERSUASION', name: 'İkna' },
      { attr: 'CHA', code: 'INTIMIDATION', name: 'Gözdağı / Tehdit' },
      { attr: 'CHA', code: 'DECEPTION', name: 'Aldatıcılık' },
      { attr: 'CHA', code: 'PERFORMANCE', name: 'Gösteri & Karizma' },
      // WIS
      { attr: 'WIS', code: 'PERCEPTION', name: 'Farkındalık / Algı' },
      { attr: 'WIS', code: 'SURVIVAL', name: 'İz Sürme / Doğa' },
      { attr: 'WIS', code: 'WILLPOWER', name: 'İrade Direnci' },
      { attr: 'WIS', code: 'INSIGHT', name: 'Sezgi / Niyet Okuma' }
    ];

    for (const skill of skills) {
      const { rows } = await pool.query('SELECT id FROM attributes WHERE code = $1', [skill.attr]);
      if (rows.length > 0) {
        const attrId = rows[0].id;
        await pool.query(
          'INSERT INTO skills (attribute_id, code, name) VALUES ($1, $2, $3) ON CONFLICT (code) DO NOTHING',
          [attrId, skill.code, skill.name]
        );
      }
    }

    console.log('Seed verileri başarıyla eklendi!');
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await pool.end();
  }
}

setup();
