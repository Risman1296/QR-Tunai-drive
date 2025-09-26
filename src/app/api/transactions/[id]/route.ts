import { NextRequest, NextResponse } from 'next/server';
import { getTransactionById, getTransactions, updateTransaction, TransactionStatus, Transaction } from '@/lib/transaction-store';

// Force static exports for Cloudflare Pages
export const dynamic = 'force-static';
export const revalidate = 0;

// GET a single transaction by ID
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    console.log(`🔍 Looking for transaction: ${params.id}`);
    
    const transaction = getTransactionById(params.id);
    
    if (!transaction) {
      console.log(`❌ Transaction ${params.id} not found in store`);
      // Let's also log all available transactions for debugging
      const allTransactions = getTransactions();
      console.log(`📋 Available transactions in store: ${allTransactions.length}`);
      console.log('Available transaction IDs:', allTransactions.map((t: Transaction) => t.id));
      
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    
    console.log(`✅ Found transaction: ${params.id}`, transaction);
    return NextResponse.json(transaction);
  } catch (error) {
    console.error(`Error fetching transaction ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


// UPDATE a transaction (either by customer or cashier)
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const { id } = params;
    const body = await req.json();

    // Check for required fields based on the type of update
    const isStatusUpdate = 'status' in body;
    const isDetailUpdate = 'customerName' in body && 'amount' in body;

    if (!isStatusUpdate && !isDetailUpdate) {
      return NextResponse.json(
        { error: 'Invalid update data. Provide either `status` or both `customerName` and `amount`.' }, 
        { status: 400 }
      );
    }

    const updateData: { status?: TransactionStatus; customerName?: string; amount?: number } = {};

    if (isStatusUpdate) {
        // Update from Cashier Dashboard (e.g., completing or cancelling)
        if (typeof body.status !== 'string' || !['pending', 'completed', 'cancelled'].includes(body.status)) {
            return NextResponse.json({ error: 'Invalid status value.' }, { status: 400 });
        }
        updateData.status = body.status;
    }

    if (isDetailUpdate) {
        // Update from Customer Form
        if (typeof body.customerName !== 'string' || body.customerName.trim() === '') {
            return NextResponse.json({ error: 'Customer name cannot be empty.' }, { status: 400 });
        }
        if (typeof body.amount !== 'number' || body.amount <= 0) {
            return NextResponse.json({ error: 'Amount must be a positive number.' }, { status: 400 });
        }
        updateData.customerName = body.customerName.trim();
        updateData.amount = body.amount;
    }

    const updatedTransaction = updateTransaction(id, updateData);

    if (!updatedTransaction) {
      return NextResponse.json({ error: 'Transaction not found or update failed' }, { status: 404 });
    }

    // In a real app, you would also trigger a real-time update to the dashboard here (e.g., via WebSockets or another SSE)

    return NextResponse.json(updatedTransaction);

  } catch (error) {
    console.error(`Error updating transaction ${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to update transaction', details: errorMessage },
      { status: 500 }
    );
  }
}
