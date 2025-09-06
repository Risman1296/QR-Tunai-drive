import { NextRequest, NextResponse } from 'next/server';
import { addTransaction, Transaction } from '@/lib/transaction-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newTransaction = addTransaction(body as Omit<Transaction, 'status' | 'date'>);
    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to create transaction', details: errorMessage },
      { status: 500 }
    );
  }
}
