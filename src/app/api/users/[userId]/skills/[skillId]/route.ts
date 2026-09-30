import { NextRequest, NextResponse } from 'next/server';
import { updateUserSkill } from '@/lib/statService';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; skillId: string }> }
) {
  try {
    const { userId, skillId } = await params;
    const parsedUserId = parseInt(userId);
    const parsedSkillId = parseInt(skillId);
    
    if (isNaN(parsedUserId) || isNaN(parsedSkillId)) {
      return NextResponse.json({ error: 'Invalid User ID or Skill ID' }, { status: 400 });
    }

    const body = await request.json();
    const { value } = body;

    if (value === undefined) {
      return NextResponse.json({ error: 'Missing value' }, { status: 400 });
    }

    await updateUserSkill(parsedUserId, parsedSkillId, value);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating user skill:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
