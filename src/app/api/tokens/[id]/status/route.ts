import { NextRequest, NextResponse } from 'next/server';
import { getTokenStatus } from '@/lib/token-tracker';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const status = getTokenStatus(id);
    
    return NextResponse.json({
      tokenId: id,
      status: status || { accessed: false, used: false }
    });
  } catch (error) {
    console.error('Error getting token status:', error);
    return NextResponse.json(
      { error: 'Failed to get token status' },
      { status: 500 }
    );
  }
}