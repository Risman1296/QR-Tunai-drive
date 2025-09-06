import { NextResponse } from 'next/server';
import { getTransactions } from '@/lib/transaction-store';

export const dynamic = 'force-dynamic';

function calculateSummary(transactions: any[]) {
  const totalRevenue = transactions
    .filter(tx => tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalTransactions = transactions.length;
  const completedTransactions = transactions.filter(tx => tx.status === 'completed').length;
  const cancelledTransactions = transactions.filter(tx => tx.status === 'cancelled').length;
  const pendingTransactions = transactions.filter(tx => tx.status === 'pending').length;

  return {
    totalRevenue,
    totalTransactions,
    completedTransactions,
    cancelledTransactions,
    pendingTransactions,
    completionRate: totalTransactions > 0 ? (completedTransactions / (completedTransactions + cancelledTransactions)) * 100 : 0,
  };
}

export async function GET() {
  try {
    const transactions = getTransactions();
    const summary = calculateSummary(transactions);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching transaction summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction summary' },
      { status: 500 }
    );
  }
}
