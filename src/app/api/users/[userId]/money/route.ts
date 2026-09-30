import { NextRequest, NextResponse } from 'next/server';
import { updateMoney } from '@/lib/inventoryService';

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
    const { amount } = body;

    if (amount === undefined || typeof amount !== 'number') {
      return NextResponse.json({ error: 'Missing or invalid amount' }, { status: 400 });
    }

    await updateMoney(parsedUserId, amount);
    
    return NextResponse.json({ success: true, money: amount });
  } catch (error: any) {
    console.error('Error updating money:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
