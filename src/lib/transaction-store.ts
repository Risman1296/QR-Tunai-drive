import { randomUUID } from 'crypto';

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
}

// Use a simple in-memory Map to store transactions.
// In a real-world app, you would use a database (e.g., PostgreSQL, Redis).
const transactions = new Map<string, Transaction>();

// --- Pre-seed with some dummy data for demonstration ---

const addDummyTransaction = (data: Omit<Transaction, 'id' | 'date'>) => {
  const id = randomUUID();
  const newTx: Transaction = {
    id,
    date: new Date(),
    ...data,
  };
  transactions.set(id, newTx);
};

addDummyTransaction({
  type: 'Pembayaran Digital',
  customerName: 'Budi Santoso',
  amount: 75000,
  status: 'completed',
  notes: 'Kopi dan 2 Roti'
});
addDummyTransaction({
  type: 'Pembayaran Digital',
  customerName: 'Siti Aminah',
  amount: 150000,
  status: 'completed',
  notes: 'Makan siang keluarga'
});
addDummyTransaction({
  type: 'Pembayaran Digital',
  customerName: 'Joko Susilo',
  amount: 25000,
  status: 'cancelled',
  notes: 'Salah input'
});
addDummyTransaction({
  type: 'Pembayaran Digital',
  customerName: 'Pelanggan',
  amount: 0, // Pending amount
  status: 'pending',
  notes: 'Scan QR untuk membayar'
});


// --- Core Functions ---

export function getTransactions(): Transaction[] {
  return Array.from(transactions.values());
}

export function getTransactionById(id: string): Transaction | undefined {
  return transactions.get(id);
}

export function addTransaction(data: Omit<Transaction, 'id' | 'date' | 'status'>): Transaction {
  const id = randomUUID();
  const newTransaction: Transaction = {
    id,
    status: 'pending', // All new transactions start as pending
    date: new Date(),
    ...data,
  };
  transactions.set(id, newTransaction);
  console.log(`Transaction added: ${id}, Total: ${transactions.size}`);
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
    console.log(`Transaction updated: ${id}`, updatedTransaction);
    return updatedTransaction;
}

// A specific function to update only status for clarity in dashboard logic, but uses the generic updater.
export function updateTransactionStatus(id: string, status: TransactionStatus): Transaction | undefined {
    return updateTransaction(id, { status });
}
