import { NextRequest, NextResponse } from 'next/server';
import { getCombatStatus, updateCombatStatus } from '@/lib/combatService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const parsedUserId = parseInt(userId);
    
    if (isNaN(parsedUserId)) {
      return NextResponse.json({ error: 'Invalid User ID' }, { status: 400 });
    }

    const status = await getCombatStatus(parsedUserId);
    return NextResponse.json(status);
  } catch (error: any) {
    console.error('Error fetching combat status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
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
    const { maxHp, dr } = body;

    const newStatus = await updateCombatStatus(parsedUserId, maxHp, dr);
    return NextResponse.json(newStatus);
  } catch (error: any) {
    console.error('Error updating combat status:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
