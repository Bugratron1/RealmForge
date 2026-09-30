import { sql } from '@/lib/db';

export async function ensureNotesInitialized(userId: number) {
  // Try to insert default empty note record, ignoring if already exists
  await sql`
    INSERT INTO user_notes (user_id, content)
    VALUES (${userId}, '')
    ON CONFLICT (user_id) DO NOTHING
  `;
}

export async function getNotes(userId: number) {
  await ensureNotesInitialized(userId);

  const rows = await sql`
    SELECT content, created_at, updated_at 
    FROM user_notes 
    WHERE user_id = ${userId}
  `;
  
  return {
    content: rows[0]?.content || '',
    createdAt: rows[0]?.created_at,
    updatedAt: rows[0]?.updated_at
  };
}

export async function updateNotes(userId: number, content: string) {
  await ensureNotesInitialized(userId);

  await sql`
    UPDATE user_notes
    SET content = ${content}, updated_at = NOW()
    WHERE user_id = ${userId}
  `;
}
