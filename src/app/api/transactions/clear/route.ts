import { NextRequest, NextResponse } from 'next/server';
import { clearAllTransactions } from '@/lib/transaction-store';


// Force static export untuk Cloudflare Pages
export const dynamic = 'force-static';
export const revalidate = 0;

export async function DELETE() {
  try {
    clearAllTransactions();
    return NextResponse.json({ 
      message: 'All transactions cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error clearing transactions:', error);
    return NextResponse.json(
      { error: 'Failed to clear transactions' },
      { status: 500 }
    );
  }
}
