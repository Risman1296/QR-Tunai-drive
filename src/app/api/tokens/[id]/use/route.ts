import { NextRequest, NextResponse } from 'next/server';
import { markTokenUsed, getTokenStatus } from '@/lib/token-tracker';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Mark token as used
    markTokenUsed(id);
    
    // Get current status
    const status = getTokenStatus(id);
    
    return NextResponse.json({
      success: true,
      tokenId: id,
      status: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error marking token as used:', error);
    return NextResponse.json(
      { error: 'Failed to mark token as used' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get current status
    const status = getTokenStatus(id);
    
    return NextResponse.json({
      tokenId: id,
      status: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting token status:', error);
    return NextResponse.json(
      { error: 'Failed to get token status' },
      { status: 500 }
    );
  }
}