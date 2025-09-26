import { NextRequest, NextResponse } from 'next/server';
import { addTransaction, getTransactions, Transaction } from '@/lib/transaction-store';


// Force static export untuk Cloudflare Pages
export const dynamic = 'force-static';
export const revalidate = 0;

export async function GET() {
  try {
    const transactions = getTransactions();
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Received transaction data:', JSON.stringify(body, null, 2));
    
    // Validate amount - prevent 0 amount transactions
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0', details: 'Invalid amount provided' },
        { status: 400 }
      );
    }
    
    const newTransaction = addTransaction(body as Omit<Transaction, 'status' | 'date'>);
    console.log('Created transaction:', newTransaction.id);
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
