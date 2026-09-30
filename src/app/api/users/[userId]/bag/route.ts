import { NextRequest, NextResponse } from 'next/server';
import { updateBag } from '@/lib/inventoryService';

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
    const { content } = body;

    if (content === undefined || typeof content !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid content' }, { status: 400 });
    }

    await updateBag(parsedUserId, content);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating bag:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
