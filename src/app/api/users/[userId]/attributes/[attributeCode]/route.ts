import { NextRequest, NextResponse } from 'next/server';
import { updateUserAttribute } from '@/lib/statService';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; attributeCode: string }> }
) {
  try {
    const { userId, attributeCode } = await params;
    const parsedUserId = parseInt(userId);
    
    if (isNaN(parsedUserId)) {
      return NextResponse.json({ error: 'Invalid User ID' }, { status: 400 });
    }

    const body = await request.json();
    const { baseValue, bonusValue } = body;

    if (baseValue === undefined && bonusValue === undefined) {
      return NextResponse.json({ error: 'Missing baseValue or bonusValue' }, { status: 400 });
    }

    await updateUserAttribute(parsedUserId, attributeCode.toUpperCase(), baseValue, bonusValue);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating user attribute:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
