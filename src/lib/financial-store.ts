import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  FinancialAccount, 
  BankAccount, 
  MerchantAccount, 
  CashAccount,
  FinancialTransaction,
  ShiftFinancialSummary,
  DEFAULT_BANK_ACCOUNTS,
  DEFAULT_MERCHANT_ACCOUNTS,
  DEFAULT_CASH_ACCOUNTS
} from './financial-types';

interface FinancialState {
  // Accounts
  bankAccounts: BankAccount[];
  merchantAccounts: MerchantAccount[];
  cashAccounts: CashAccount[];
  
  // Transactions
  transactions: FinancialTransaction[];
  
  // Shift summaries
  shiftSummaries: ShiftFinancialSummary[];
  currentShiftSummary?: ShiftFinancialSummary;
  
  // Actions
  initializeAccounts: () => void;
  
  // Account management
  updateBankAccount: (id: string, account: Partial<BankAccount>) => void;
  updateMerchantAccount: (id: string, account: Partial<MerchantAccount>) => void;
  updateCashAccount: (id: string, account: Partial<CashAccount>) => void;
  
  // Balance management
  updateAccountBalance: (accountId: string, newBalance: number) => void;
  getAccountBalance: (accountId: string) => number;
  getAllAccounts: () => FinancialAccount[];
  
  // Transaction management
  addTransaction: (transaction: Omit<FinancialTransaction, 'id' | 'date'>) => void;
  processTransactionFlow: (
    transactionType: 'cash_withdrawal' | 'qris_payment' | 'transfer',
    amount: number,
    details: any
  ) => void;
  
  // Shift financial management
  startShiftFinancials: (shiftId: string, userId: string, userName: string) => void;
  endShiftFinancials: (shiftId: string, actualBalances: Record<string, number>, notes?: string) => void;
  getCurrentShiftSummary: () => ShiftFinancialSummary | undefined;
  
  // Reporting
  getFinancialSummary: (startDate: Date, endDate: Date) => {
    totalCashIn: number;
    totalCashOut: number;
    totalQrisIn: number;
    netFlow: number;
    accountBalances: Record<string, number>;
  };
  
  // Cash flow analysis
  getCashFlow: (accountId: string, startDate: Date, endDate: Date) => FinancialTransaction[];
}

export const useFinancialStore = create<FinancialState>()(
  persist(
    (set, get) => ({
      // Initial state
      bankAccounts: [],
      merchantAccounts: [],
      cashAccounts: [],
      transactions: [],
      shiftSummaries: [],
      currentShiftSummary: undefined,
      
      // Initialize default accounts
      initializeAccounts: () => {
        const state = get();
        if (state.bankAccounts.length === 0) {
          set({
            bankAccounts: DEFAULT_BANK_ACCOUNTS,
            merchantAccounts: DEFAULT_MERCHANT_ACCOUNTS,
            cashAccounts: DEFAULT_CASH_ACCOUNTS
          });
        }
      },
      
      // Account management
      updateBankAccount: (id, updates) => {
        set(state => ({
          bankAccounts: state.bankAccounts.map(acc => 
            acc.id === id ? { ...acc, ...updates } : acc
          )
        }));
      },
      
      updateMerchantAccount: (id, updates) => {
        set(state => ({
          merchantAccounts: state.merchantAccounts.map(acc => 
            acc.id === id ? { ...acc, ...updates } : acc
          )
        }));
      },
      
      updateCashAccount: (id, updates) => {
        set(state => ({
          cashAccounts: state.cashAccounts.map(acc => 
            acc.id === id ? { ...acc, ...updates } : acc
          )
        }));
      },
      
      // Balance management
      updateAccountBalance: (accountId, newBalance) => {
        const state = get();
        const bankAcc = state.bankAccounts.find(acc => acc.id === accountId);
        const merchantAcc = state.merchantAccounts.find(acc => acc.id === accountId);
        const cashAcc = state.cashAccounts.find(acc => acc.id === accountId);
        
        if (bankAcc) {
          get().updateBankAccount(accountId, { balance: newBalance });
        } else if (merchantAcc) {
          get().updateMerchantAccount(accountId, { balance: newBalance });
        } else if (cashAcc) {
          get().updateCashAccount(accountId, { balance: newBalance });
        }
      },
      
      getAccountBalance: (accountId) => {
        const state = get();
        const allAccounts = [...state.bankAccounts, ...state.merchantAccounts, ...state.cashAccounts];
        const account = allAccounts.find(acc => acc.id === accountId);
        return account?.balance || 0;
      },
      
      getAllAccounts: () => {
        const state = get();
        return [...state.bankAccounts, ...state.merchantAccounts, ...state.cashAccounts];
      },
      
      // Transaction management
      addTransaction: (transactionData) => {
        const transaction: FinancialTransaction = {
          ...transactionData,
          id: `fin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          date: new Date()
        };
        
        set(state => ({
          transactions: [transaction, ...state.transactions]
        }));
      },
      
      processTransactionFlow: (transactionType, amount, details) => {
        const state = get();
        
        switch (transactionType) {
          case 'cash_withdrawal':
            // Customer withdraws cash using QRIS/EDC - Cash decreases, Merchant increases
            if (details.method === 'qris') {
              get().addTransaction({
                type: 'debit',
                amount,
                fromAccount: state.cashAccounts.find(acc => acc.id === 'cash_main'),
                toAccount: state.merchantAccounts.find(acc => acc.id === 'merchant_qris'),
                description: `Penarikan Tunai QRIS - ${details.customerName}`,
                category: 'cash_withdrawal',
                transactionId: details.transactionId,
                shiftId: details.shiftId
              });
              
              // Update balances
              const cashAccount = state.cashAccounts.find(acc => acc.id === 'cash_main');
              const merchantAccount = state.merchantAccounts.find(acc => acc.id === 'merchant_qris');
              
              if (cashAccount) {
                get().updateAccountBalance('cash_main', cashAccount.balance - amount);
              }
              if (merchantAccount) {
                get().updateAccountBalance('merchant_qris', merchantAccount.balance + amount);
              }
            }
            break;
            
          case 'qris_payment':
            // Direct QRIS payment - only merchant balance increases
            get().addTransaction({
              type: 'credit',
              amount,
              toAccount: state.merchantAccounts.find(acc => acc.id === 'merchant_qris'),
              description: `Pembayaran QRIS - ${details.customerName}`,
              category: 'qris_payment',
              transactionId: details.transactionId,
              shiftId: details.shiftId
            });
            
            const merchantAccount = state.merchantAccounts.find(acc => acc.id === 'merchant_qris');
            if (merchantAccount) {
              get().updateAccountBalance('merchant_qris', merchantAccount.balance + amount);
            }
            break;
            
          case 'transfer':
            // Bank transfer between accounts
            const fromAccount = state.getAllAccounts().find(acc => acc.id === details.fromAccountId);
            const toAccount = state.getAllAccounts().find(acc => acc.id === details.toAccountId);
            
            if (fromAccount && toAccount) {
              get().addTransaction({
                type: 'debit',
                amount,
                fromAccount,
                toAccount,
                description: `Transfer ${fromAccount.name} ke ${toAccount.name}`,
                category: 'transfer',
                shiftId: details.shiftId,
                notes: details.notes
              });
              
              get().updateAccountBalance(details.fromAccountId, fromAccount.balance - amount);
              get().updateAccountBalance(details.toAccountId, toAccount.balance + amount);
            }
            break;
        }
      },
      
      // Shift financial management
      startShiftFinancials: (shiftId, userId, userName) => {
        const state = get();
        const allAccounts = state.getAllAccounts();
        
        const openingBalance: Record<string, number> = {};
        allAccounts.forEach(account => {
          openingBalance[account.id] = account.balance;
        });
        
        const shiftSummary: ShiftFinancialSummary = {
          shiftId,
          startTime: new Date(),
          userId,
          userName,
          openingBalance,
          closingBalance: {},
          transactions: [],
          totalCashIn: 0,
          totalCashOut: 0,
          totalQrisIn: 0,
          discrepancies: [],
          isHandedOver: false
        };
        
        set({ currentShiftSummary: shiftSummary });
      },
      
      endShiftFinancials: (shiftId, actualBalances, notes) => {
        const state = get();
        if (!state.currentShiftSummary || state.currentShiftSummary.shiftId !== shiftId) return;
        
        const allAccounts = state.getAllAccounts();
        const discrepancies: any[] = [];
        
        // Check for discrepancies
        allAccounts.forEach(account => {
          const expected = account.balance;
          const actual = actualBalances[account.id] || 0;
          const difference = actual - expected;
          
          if (Math.abs(difference) > 0.01) { // Allow for small rounding differences
            discrepancies.push({
              accountId: account.id,
              expected,
              actual,
              difference
            });
          }
        });
        
        const shiftTransactions = state.transactions.filter(tx => tx.shiftId === shiftId);
        const totalCashOut = shiftTransactions
          .filter(tx => tx.type === 'debit' && tx.fromAccount?.type === 'cash')
          .reduce((sum, tx) => sum + tx.amount, 0);
        const totalCashIn = shiftTransactions
          .filter(tx => tx.type === 'credit' && tx.toAccount?.type === 'cash')
          .reduce((sum, tx) => sum + tx.amount, 0);
        const totalQrisIn = shiftTransactions
          .filter(tx => tx.type === 'credit' && tx.toAccount?.type === 'merchant')
          .reduce((sum, tx) => sum + tx.amount, 0);
        
        const completedSummary: ShiftFinancialSummary = {
          ...state.currentShiftSummary,
          endTime: new Date(),
          closingBalance: actualBalances,
          transactions: shiftTransactions,
          totalCashIn,
          totalCashOut,
          totalQrisIn,
          discrepancies,
          isHandedOver: true,
          handoverNotes: notes,
          handoverTime: new Date()
        };
        
        set(state => ({
          shiftSummaries: [completedSummary, ...state.shiftSummaries],
          currentShiftSummary: undefined
        }));
      },
      
      getCurrentShiftSummary: () => {
        return get().currentShiftSummary;
      },
      
      // Reporting
      getFinancialSummary: (startDate, endDate) => {
        const state = get();
        const transactions = state.transactions.filter(tx => 
          tx.date >= startDate && tx.date <= endDate
        );
        
        const totalCashIn = transactions
          .filter(tx => tx.type === 'credit' && tx.toAccount?.type === 'cash')
          .reduce((sum, tx) => sum + tx.amount, 0);
        
        const totalCashOut = transactions
          .filter(tx => tx.type === 'debit' && tx.fromAccount?.type === 'cash')
          .reduce((sum, tx) => sum + tx.amount, 0);
        
        const totalQrisIn = transactions
          .filter(tx => tx.type === 'credit' && tx.toAccount?.type === 'merchant')
          .reduce((sum, tx) => sum + tx.amount, 0);
        
        const netFlow = totalCashIn - totalCashOut + totalQrisIn;
        
        const accountBalances: Record<string, number> = {};
        state.getAllAccounts().forEach(account => {
          accountBalances[account.id] = account.balance;
        });
        
        return {
          totalCashIn,
          totalCashOut,
          totalQrisIn,
          netFlow,
          accountBalances
        };
      },
      
      getCashFlow: (accountId, startDate, endDate) => {
        const state = get();
        return state.transactions.filter(tx => 
          (tx.fromAccount?.id === accountId || tx.toAccount?.id === accountId) &&
          tx.date >= startDate && tx.date <= endDate
        ).sort((a, b) => b.date.getTime() - a.date.getTime());
      }
    }),
    {
      name: 'financial-store',
      version: 1
    }
  )
);