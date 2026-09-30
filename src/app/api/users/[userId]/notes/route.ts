import { NextRequest, NextResponse } from 'next/server';
import { getNotes, updateNotes } from '@/lib/notesService';

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

    const data = await getNotes(parsedUserId);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching notes:', error);
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
    const { content } = body;

    if (content === undefined || typeof content !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid content' }, { status: 400 });
    }

    await updateNotes(parsedUserId, content);
    
    return NextResponse.json({ success: true, content });
  } catch (error: any) {
    console.error('Error updating notes:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
