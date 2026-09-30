import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      uid, name, className, level, avatarUrl,
      maxHp, currentHp, armorClass,
      stats, skills, equipment, bag, notes, features, moneyAmount
    } = body;

    if (!uid) {
      return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
    }

    // Try to find the user
    let rows = await sql`SELECT id FROM users WHERE uID = ${uid}`;
    let userId;

    if (rows.length === 0) {
      // Create user
      const insertRows = await sql`
        INSERT INTO users (
          uID, ad, sinif, seviye, resim,
          max_hp, current_hp, armor_class, stats, skills, equipment, bag, notes, features, money_amount
        )
        VALUES (
          ${uid}, ${name || 'Yeni Kahraman'}, ${className || 'Bilinmiyor'}, ${level || 1}, ${avatarUrl || ''},
          ${maxHp !== undefined ? maxHp : 20}, ${currentHp !== undefined ? currentHp : 20}, ${armorClass !== undefined ? armorClass : 0},
          ${stats ? JSON.stringify(stats) : null}, ${skills ? JSON.stringify(skills) : null},
          ${equipment || ''}, ${bag || ''}, ${notes || ''}, ${features || ''}, ${moneyAmount || 0}
        )
        RETURNING id
      `;
      userId = insertRows[0].id;
    } else {
      userId = rows[0].id;
      // Update info
      await sql`
        UPDATE users 
        SET ad = ${name || 'Yeni Kahraman'}, 
            sinif = ${className || 'Bilinmiyor'}, 
            seviye = ${level || 1}, 
            resim = ${avatarUrl || ''},
            max_hp = ${maxHp !== undefined ? maxHp : 20},
            current_hp = ${currentHp !== undefined ? currentHp : 20},
            armor_class = ${armorClass !== undefined ? armorClass : 0},
            stats = ${stats ? JSON.stringify(stats) : null},
            skills = ${skills ? JSON.stringify(skills) : null},
            equipment = ${equipment || ''},
            bag = ${bag || ''},
            notes = ${notes || ''},
            features = ${features || ''},
            money_amount = ${moneyAmount || 0}
        WHERE id = ${userId}
      `;
    }

    return NextResponse.json({ success: true, userId });
  } catch (error: any) {
    console.error('Error syncing user:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
