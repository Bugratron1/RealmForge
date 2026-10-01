import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      roomId,
      action,
      combatants,
      activeTurnIndex,
      sceneImageUrl,
      sceneTitle,
      notes
    } = body;

    if (!roomId) {
      return NextResponse.json({ error: 'Missing roomId' }, { status: 400 });
    }

    // Ensure table exists
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

    if (action === 'get') {
      const rows = await sql`SELECT * FROM dm_rooms WHERE room_id = ${roomId}`;
      if (rows.length > 0) {
        return NextResponse.json({ success: true, data: rows[0] });
      } else {
        return NextResponse.json({ success: true, data: null });
      }
    } else if (action === 'save_combat') {
      const rows = await sql`SELECT room_id FROM dm_rooms WHERE room_id = ${roomId}`;
      if (rows.length === 0) {
        await sql`INSERT INTO dm_rooms (room_id, combatants, active_turn_index) VALUES (${roomId}, ${JSON.stringify(combatants)}, ${activeTurnIndex})`;
      } else {
        await sql`UPDATE dm_rooms SET combatants = ${JSON.stringify(combatants)}, active_turn_index = ${activeTurnIndex}, updated_at = CURRENT_TIMESTAMP WHERE room_id = ${roomId}`;
      }
      return NextResponse.json({ success: true });
    } else if (action === 'save_scene') {
      const rows = await sql`SELECT room_id FROM dm_rooms WHERE room_id = ${roomId}`;
      if (rows.length === 0) {
        await sql`INSERT INTO dm_rooms (room_id, scene_image_url, scene_title) VALUES (${roomId}, ${sceneImageUrl}, ${sceneTitle})`;
      } else {
        await sql`UPDATE dm_rooms SET scene_image_url = ${sceneImageUrl}, scene_title = ${sceneTitle}, updated_at = CURRENT_TIMESTAMP WHERE room_id = ${roomId}`;
      }
      return NextResponse.json({ success: true });
    } else if (action === 'save_notes') {
      const rows = await sql`SELECT room_id FROM dm_rooms WHERE room_id = ${roomId}`;
      if (rows.length === 0) {
        await sql`INSERT INTO dm_rooms (room_id, notes) VALUES (${roomId}, ${JSON.stringify(notes)})`;
      } else {
        await sql`UPDATE dm_rooms SET notes = ${JSON.stringify(notes)}, updated_at = CURRENT_TIMESTAMP WHERE room_id = ${roomId}`;
      }
      return NextResponse.json({ success: true });
    } else if (action === 'clear') {
      await sql`DELETE FROM dm_rooms WHERE room_id = ${roomId}`;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error syncing DM room:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
