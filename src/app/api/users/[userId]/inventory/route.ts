import { NextRequest, NextResponse } from 'next/server';
import { getInventory } from '@/lib/inventoryService';

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

    const inventory = await getInventory(parsedUserId);
    return NextResponse.json(inventory);
  } catch (error: any) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
