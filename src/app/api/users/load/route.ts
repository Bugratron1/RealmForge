import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
    }

    const rows = await sql`SELECT * FROM users WHERE uID = ${uid}`;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = rows[0];
    const internalUserId = user.id;

    // Construct response matching what the frontend expects
    const payload = {
      internalUserId: internalUserId,
      name: user.ad || "",
      className: user.sinif || "",
      level: user.seviye || 1,
      avatarUrl: user.resim || null,
      maxHp: user.max_hp !== null ? user.max_hp : 20,
      currentHp: user.current_hp !== null ? user.current_hp : 20,
      armorClass: user.armor_class !== null ? user.armor_class : 0,
      stats: user.stats || null,
      skills: user.skills || null,
      equipment: user.equipment || "",
      bag: user.bag || "",
      notes: user.notes || "",
      features: user.features || "",
      moneyAmount: user.money_amount || 0
    };

    return NextResponse.json({ success: true, data: payload });
  } catch (error: any) {
    console.error('Error loading user:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
