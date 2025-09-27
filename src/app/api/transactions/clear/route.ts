import { NextRequest, NextResponse } from 'next/server';
import { clearAllTransactions } from '@/lib/transaction-store';

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