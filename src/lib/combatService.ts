import { sql } from '@/lib/db';

export async function ensureCombatStatusInitialized(userId: number) {
  await sql`
    INSERT INTO user_combat_status (user_id, max_hp, current_hp, dr)
    VALUES (${userId}, 20, 20, 0)
    ON CONFLICT (user_id) DO NOTHING
  `;
}

export async function getCombatStatus(userId: number) {
  await ensureCombatStatusInitialized(userId);

  const rows = await sql`
    SELECT max_hp as "maxHp", current_hp as "currentHp", dr
    FROM user_combat_status
    WHERE user_id = ${userId}
  `;

  return rows[0];
}

export async function updateCombatStatus(userId: number, maxHp?: number, dr?: number) {
  await ensureCombatStatusInitialized(userId);

  if (maxHp !== undefined && maxHp < 1) {
    throw new Error('maxHp minimum 1 olmalı.');
  }
  if (dr !== undefined && dr < 0) {
    throw new Error('dr minimum 0 olmalı.');
  }

  const current = await getCombatStatus(userId);
  let newMaxHp = maxHp !== undefined ? maxHp : current.maxHp;
  let newDr = dr !== undefined ? dr : current.dr;
  
  // if max_hp is lowered below current_hp, current_hp becomes max_hp
  let newCurrentHp = current.currentHp;
  if (newCurrentHp > newMaxHp) {
    newCurrentHp = newMaxHp;
  }

  await sql`
    UPDATE user_combat_status
    SET max_hp = ${newMaxHp},
        current_hp = ${newCurrentHp},
        dr = ${newDr}
    WHERE user_id = ${userId}
  `;

  return { maxHp: newMaxHp, currentHp: newCurrentHp, dr: newDr };
}

export async function updateHp(userId: number, change: number) {
  await ensureCombatStatusInitialized(userId);

  const current = await getCombatStatus(userId);
  let newCurrentHp = current.currentHp + change;

  // bounds check
  if (newCurrentHp < 0) {
    newCurrentHp = 0;
  } else if (newCurrentHp > current.maxHp) {
    newCurrentHp = current.maxHp;
  }

  await sql`
    UPDATE user_combat_status
    SET current_hp = ${newCurrentHp}
    WHERE user_id = ${userId}
  `;

  return { ...current, currentHp: newCurrentHp };
}
