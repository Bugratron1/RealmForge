import { sql } from '@/lib/db';

export async function ensureUserStatsInitialized(userId: number) {
  // Check if user already has attributes
  const rows = await sql`
    SELECT COUNT(*) as count FROM user_attributes WHERE user_id = ${userId}
  `;
  
  if (parseInt(rows[0].count) > 0) {
    return; // Already initialized
  }

  // Get all attributes and skills
  const attributesReq = await sql`SELECT id FROM attributes`;
  const skillsReq = await sql`SELECT id FROM skills`;

  // Insert default attributes
  for (const attr of attributesReq) {
    await sql`
      INSERT INTO user_attributes (user_id, attribute_id, base_value, bonus_value)
      VALUES (${userId}, ${attr.id}, 10, 0)
      ON CONFLICT (user_id, attribute_id) DO NOTHING
    `;
  }

  // Insert default skills
  for (const skill of skillsReq) {
    await sql`
      INSERT INTO user_skills (user_id, skill_id, value)
      VALUES (${userId}, ${skill.id}, 0)
      ON CONFLICT (user_id, skill_id) DO NOTHING
    `;
  }
}

export async function getUserStats(userId: number) {
  await ensureUserStatsInitialized(userId);

  // Fetch all user attributes with their master data
  const attributesData = await sql`
    SELECT 
      a.id as attr_id, a.code as attr_code, a.name as attr_name,
      ua.base_value, ua.bonus_value
    FROM user_attributes ua
    JOIN attributes a ON ua.attribute_id = a.id
    WHERE ua.user_id = ${userId}
  `;

  // Fetch all user skills with their master data
  const skillsData = await sql`
    SELECT 
      s.id as skill_id, s.code as skill_code, s.name as skill_name, s.attribute_id,
      us.value
    FROM user_skills us
    JOIN skills s ON us.skill_id = s.id
    WHERE us.user_id = ${userId}
  `;

  const attributes = attributesData.map(attr => {
    const attrSkills = skillsData
      .filter(skill => skill.attribute_id === attr.attr_id)
      .map(skill => ({
        id: skill.skill_id,
        code: skill.skill_code,
        name: skill.skill_name,
        value: skill.value
      }));

    return {
      code: attr.attr_code,
      name: attr.attr_name,
      baseValue: attr.base_value,
      bonusValue: attr.bonus_value,
      totalValue: attr.base_value + attr.bonus_value,
      skills: attrSkills
    };
  });

  return { attributes };
}

export async function updateUserAttribute(userId: number, attributeCode: string, baseValue?: number, bonusValue?: number) {
  // Get attribute id
  const attrRows = await sql`SELECT id FROM attributes WHERE code = ${attributeCode}`;
  if (attrRows.length === 0) throw new Error('Attribute not found');
  const attributeId = attrRows[0].id;

  // Build query dynamically based on provided fields
  if (baseValue !== undefined && bonusValue !== undefined) {
    await sql`
      UPDATE user_attributes 
      SET base_value = ${baseValue}, bonus_value = ${bonusValue}
      WHERE user_id = ${userId} AND attribute_id = ${attributeId}
    `;
  } else if (baseValue !== undefined) {
    await sql`
      UPDATE user_attributes 
      SET base_value = ${baseValue}
      WHERE user_id = ${userId} AND attribute_id = ${attributeId}
    `;
  } else if (bonusValue !== undefined) {
    await sql`
      UPDATE user_attributes 
      SET bonus_value = ${bonusValue}
      WHERE user_id = ${userId} AND attribute_id = ${attributeId}
    `;
  }
}

export async function updateUserSkill(userId: number, skillId: number, value: number) {
  await sql`
    UPDATE user_skills 
    SET value = ${value}
    WHERE user_id = ${userId} AND skill_id = ${skillId}
  `;
}

