// Financial Management Types and Configuration
export interface BankAccount {
  id: string;
  name: string;
  code: string;
  accountNumber: string;
  balance: number;
  type: 'bank';
  isActive: boolean;
  color: string;
}

export interface MerchantAccount {
  id: string;
  name: string;
  provider: string; // e.g., "QRIS", "GoPay", "OVO", etc.
  merchantId: string;
  balance: number;
  type: 'merchant';
  isActive: boolean;
  color: string;
}

export interface CashAccount {
  id: string;
  name: string;
  balance: number;
  type: 'cash';
  location?: string; // e.g., "Kasir Utama", "Brankas"
  isActive: boolean;
  color: string;
}

export type FinancialAccount = BankAccount | MerchantAccount | CashAccount;

export interface FinancialTransaction {
  id: string;
  date: Date;
  type: 'debit' | 'credit';
  amount: number;
  fromAccount?: FinancialAccount;
  toAccount?: FinancialAccount;
  description: string;
  category: 'cash_withdrawal' | 'qris_payment' | 'transfer' | 'fee' | 'adjustment';
  transactionId?: string; // Link to original transaction
  shiftId?: string;
  userId?: string;
  notes?: string;
}

export interface ShiftFinancialSummary {
  shiftId: string;
  startTime: Date;
  endTime?: Date;
  userId: string;
  userName: string;
  openingBalance: Record<string, number>; // account_id -> balance
  closingBalance: Record<string, number>; // account_id -> balance
  transactions: FinancialTransaction[];
  totalCashIn: number;
  totalCashOut: number;
  totalQrisIn: number;
  discrepancies: Array<{
    accountId: string;
    expected: number;
    actual: number;
    difference: number;
  }>;
  isHandedOver: boolean;
  handoverNotes?: string;
  handoverTime?: Date;
}

// Default account configurations
export const DEFAULT_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'bank_bri',
    name: 'Bank BRI',
    code: 'BRI',
    accountNumber: '',
    balance: 0,
    type: 'bank',
    isActive: true,
    color: '#0066CC'
  },
  {
    id: 'bank_bca',
    name: 'Bank BCA',
    code: 'BCA',
    accountNumber: '',
    balance: 0,
    type: 'bank',
    isActive: true,
    color: '#003D7A'
  },
  {
    id: 'bank_bni',
    name: 'Bank BNI',
    code: 'BNI',
    accountNumber: '',
    balance: 0,
    type: 'bank',
    isActive: true,
    color: '#FF6900'
  },
  {
    id: 'bank_mandiri',
    name: 'Bank Mandiri',
    code: 'MANDIRI',
    accountNumber: '',
    balance: 0,
    type: 'bank',
    isActive: true,
    color: '#FFA500'
  },
  {
    id: 'bank_btn',
    name: 'Bank BTN',
    code: 'BTN',
    accountNumber: '',
    balance: 0,
    type: 'bank',
    isActive: true,
    color: '#228B22'
  },
  {
    id: 'bank_bsi',
    name: 'Bank BSI',
    code: 'BSI',
    accountNumber: '',
    balance: 0,
    type: 'bank',
    isActive: true,
    color: '#008080'
  }
];

export const DEFAULT_MERCHANT_ACCOUNTS: MerchantAccount[] = [
  {
    id: 'merchant_qris',
    name: 'QRIS Merchant',
    provider: 'QRIS',
    merchantId: '',
    balance: 0,
    type: 'merchant',
    isActive: true,
    color: '#E53E3E'
  }
];

export const DEFAULT_CASH_ACCOUNTS: CashAccount[] = [
  {
    id: 'cash_main',
    name: 'Kas Tunai Utama',
    balance: 0,
    type: 'cash',
    location: 'Kasir Utama',
    isActive: true,
    color: '#38A169'
  }
];