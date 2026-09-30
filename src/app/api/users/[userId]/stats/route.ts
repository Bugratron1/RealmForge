import { NextRequest, NextResponse } from 'next/server';
import { getUserStats } from '@/lib/statService';

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

    const stats = await getUserStats(parsedUserId);
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
