import { sql } from '@/lib/db';

export async function ensureInventoryInitialized(userId: number) {
  // Try to insert defaults, ignoring if already exists
  await sql`
    INSERT INTO user_money (user_id, amount)
    VALUES (${userId}, 0)
    ON CONFLICT (user_id) DO NOTHING
  `;

  await sql`
    INSERT INTO user_equipment (user_id, content)
    VALUES (${userId}, '')
    ON CONFLICT (user_id) DO NOTHING
  `;

  await sql`
    INSERT INTO user_bag (user_id, content)
    VALUES (${userId}, '')
    ON CONFLICT (user_id) DO NOTHING
  `;
}

export async function getInventory(userId: number) {
  await ensureInventoryInitialized(userId);

  const moneyRows = await sql`SELECT amount FROM user_money WHERE user_id = ${userId}`;
  const equipmentRows = await sql`SELECT content FROM user_equipment WHERE user_id = ${userId}`;
  const bagRows = await sql`SELECT content FROM user_bag WHERE user_id = ${userId}`;

  return {
    money: moneyRows[0]?.amount || 0,
    equipment: equipmentRows[0]?.content || '',
    bag: bagRows[0]?.content || ''
  };
}

export async function updateMoney(userId: number, amount: number) {
  if (amount < 0) {
    throw new Error('Para negatif olamaz.');
  }

  await ensureInventoryInitialized(userId);

  await sql`
    UPDATE user_money
    SET amount = ${amount}
    WHERE user_id = ${userId}
  `;
}

export async function updateEquipment(userId: number, content: string) {
  await ensureInventoryInitialized(userId);

  await sql`
    UPDATE user_equipment
    SET content = ${content}
    WHERE user_id = ${userId}
  `;
}

export async function updateBag(userId: number, content: string) {
  await ensureInventoryInitialized(userId);

  await sql`
    UPDATE user_bag
    SET content = ${content}
    WHERE user_id = ${userId}
  `;
}
