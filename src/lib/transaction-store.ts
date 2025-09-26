import { randomUUID } from 'crypto';
import { determineCashFlow } from '@/lib/bank-config';
import { useFinancialStore } from '@/lib/financial-store';

export type TransactionStatus = 'pending' | 'completed' | 'cancelled';

export interface Transaction {
  id: string;
  type: string; // e.g., 'Pembayaran Digital', 'Transfer Bank'
  customerName: string;
  amount: number;
  status: TransactionStatus;
  date: Date;
  notes?: string;
  bank?: string;
  accountNumber?: string;
  // Tambahan untuk tracking kas dan metode
  method?: string; // Untuk Tarik Tunai: transfer_outlet, atm, qris; Untuk Transfer: tunai, edc_atm
  outletBank?: string; // Bank outlet untuk transfer (BCA, BNI, BRI, BTN, MANDIRI)
  cashFlow?: 'in' | 'out'; // Arus kas masuk atau keluar untuk laporan
}

// Use a simple in-memory Map to store transactions.
// In a real-world app, you would use a database (e.g., PostgreSQL, Redis).
const transactions = new Map<string, Transaction>();

// --- Core Functions ---

export function getTransactions(): Transaction[] {
  return Array.from(transactions.values());
}

export function getTransactionById(id: string): Transaction | undefined {
  return transactions.get(id);
}

export function addTransaction(data: Omit<Transaction, 'id' | 'date' | 'status' | 'cashFlow'>): Transaction {
  const id = randomUUID();
  
  // Auto-calculate cash flow based on transaction type and method
  const cashFlow = determineCashFlow(data.type, data.method);
  
  const newTransaction: Transaction = {
    id,
    status: 'pending', // All new transactions start as pending
    date: new Date(),
    cashFlow,
    ...data,
  };
  transactions.set(id, newTransaction);
  console.log(`Transaction added: ${id}, Total: ${transactions.size}`);
  console.log('New transaction data:', JSON.stringify(newTransaction, null, 2));
  return newTransaction;
}

// Add a new function to create transactions with specific IDs (for QR codes)
export function addTransactionWithId(id: string, data: Omit<Transaction, 'id' | 'date' | 'status' | 'cashFlow'>): Transaction {
  // Auto-calculate cash flow based on transaction type and method
  const cashFlow = determineCashFlow(data.type, data.method);
  
  const newTransaction: Transaction = {
    id,
    status: 'pending', // All new transactions start as pending
    date: new Date(),
    cashFlow,
    ...data,
  };
  transactions.set(id, newTransaction);
  console.log(`Transaction added with specific ID: ${id}, Total: ${transactions.size}`);
  console.log('New transaction data:', JSON.stringify(newTransaction, null, 2));
  return newTransaction;
}

export function updateTransaction(id: string, updateData: Partial<Omit<Transaction, 'id' | 'date'>>): Transaction | undefined {
    const transaction = transactions.get(id);
    if (!transaction) {
        console.warn(`Attempted to update non-existent transaction: ${id}`);
        return undefined;
    }

    // Do not allow status to be reverted from a final state
    if (transaction.status !== 'pending' && updateData.status) {
        console.warn(`Attempted to change status of a completed/cancelled transaction: ${id}`);
        return transaction; 
    }

    const updatedTransaction = { ...transaction, ...updateData };
    transactions.set(id, updatedTransaction);
    
    // Process financial flow when transaction is completed
    if (updateData.status === 'completed') {
        processFinancialFlow(updatedTransaction);
    }
    
    console.log(`Transaction updated: ${id}`, updatedTransaction);
    return updatedTransaction;
}

// Process financial implications of a transaction
function processFinancialFlow(transaction: Transaction) {
    try {
        // Access financial store methods
        const { processTransactionFlow } = useFinancialStore.getState();
        
        // Determine transaction type and process accordingly
        if (transaction.type === 'Tarik Tunai' && transaction.method === 'qris') {
            processTransactionFlow('cash_withdrawal', transaction.amount, {
                customerName: transaction.customerName,
                transactionId: transaction.id,
                method: 'qris',
                shiftId: 'current' // You might want to get actual shift ID
            });
        } else if (transaction.type.includes('QRIS') || transaction.method === 'qris') {
            processTransactionFlow('qris_payment', transaction.amount, {
                customerName: transaction.customerName,
                transactionId: transaction.id,
                shiftId: 'current'
            });
        }
    } catch (error) {
        console.error('Error processing financial flow:', error);
    }
}

// A specific function to update only status for clarity in dashboard logic, but uses the generic updater.
export function updateTransactionStatus(id: string, status: TransactionStatus): Transaction | undefined {
    return updateTransaction(id, { status });
}

// Clear all transactions (useful for cleanup)
export function clearAllTransactions(): void {
    transactions.clear();
    console.log('All transactions cleared');
}
