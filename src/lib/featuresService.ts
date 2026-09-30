import { sql } from '@/lib/db';

export async function ensureFeaturesInitialized(userId: number) {
  // Try to insert default empty feature record, ignoring if already exists
  await sql`
    INSERT INTO user_features_traits (user_id, content)
    VALUES (${userId}, '')
    ON CONFLICT (user_id) DO NOTHING
  `;
}

export async function getFeaturesTraits(userId: number) {
  await ensureFeaturesInitialized(userId);

  const rows = await sql`SELECT content FROM user_features_traits WHERE user_id = ${userId}`;
  
  return {
    content: rows[0]?.content || ''
  };
}

export async function updateFeaturesTraits(userId: number, content: string) {
  await ensureFeaturesInitialized(userId);

  await sql`
    UPDATE user_features_traits
    SET content = ${content}
    WHERE user_id = ${userId}
  `;
}
