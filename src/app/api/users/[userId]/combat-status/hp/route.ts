import { NextRequest, NextResponse } from 'next/server';
import { updateHp } from '@/lib/combatService';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const parsedUserId = parseInt(userId);
    
    if (isNaN(parsedUserId)) {
      return NextResponse.json({ error: 'Invalid User ID' }, { status: 400 });
    }

    const body = await request.json();
    const { change } = body;

    if (change === undefined || typeof change !== 'number') {
      return NextResponse.json({ error: 'Missing or invalid "change" delta value' }, { status: 400 });
    }

    const newStatus = await updateHp(parsedUserId, change);
    return NextResponse.json(newStatus);
  } catch (error: any) {
    console.error('Error updating HP:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
