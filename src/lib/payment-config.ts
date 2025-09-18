// Bank account configuration storage and management
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface BankAccount {
  id: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  balance: number;
  isActive: boolean;
  logo: string;
  swiftCode?: string;
  branchName?: string;
  branchCode?: string;
  accountType: 'current' | 'savings' | 'escrow';
  dailyLimit?: number;
  monthlyLimit?: number;
  createdAt: string;
  updatedAt: string;
}

export interface QrisAccount {
  id: string;
  merchantId: string;
  merchantName: string;
  qrisCode: string;
  logoUrl: string;
  isActive: boolean;
  dailyLimit?: number;
  monthlyLimit?: number;
  feePercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentConfiguration {
  bankAccounts: BankAccount[];
  qrisAccounts: QrisAccount[];
  defaultBankAccount?: string;
  defaultQrisAccount?: string;
  autoBackup: boolean;
  backupInterval: number; // in hours
  lastBackup?: string;
}

// Indonesian bank logos - using reliable CDN sources
export const INDONESIAN_BANK_LOGOS: Record<string, string> = {
  'BCA': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMTAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNTAiIGZpbGw9IiMwMDY2Q0MiLz48dGV4dCB4PSI1MCIgeT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIj5CQ0E8L3RleHQ+PC9zdmc+',
  'MANDIRI': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMTAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNTAiIGZpbGw9IiNGRkMwMDAiLz48dGV4dCB4PSI1MCIgeT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMwMDMzOTkiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9ImJvbGQiPk1BTkRJUkk8L3RleHQ+PC9zdmc+',
  'BRI': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMTAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNTAiIGZpbGw9IiMwMDY2Q0MiLz48dGV4dCB4PSI1MCIgeT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIj5CUkk8L3RleHQ+PC9zdmc+',
  'BNI': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMTAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNTAiIGZpbGw9IiNGRjY2MDAiLz48dGV4dCB4PSI1MCIgeT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIj5CTkk8L3RleHQ+PC9zdmc+',
  'BSI': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMTAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNTAiIGZpbGw9IiMwMDk5NDQiLz48dGV4dCB4PSI1MCIgeT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIj5CU0k8L3RleHQ+PC9zdmc+',
  'BTN': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMTAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNTAiIGZpbGw9IiMwMDY2Q0MiLz48dGV4dCB4PSI1MCIgeT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIj5CVE48L3RleHQ+PC9zdmc+',
  'CIMB_NIAGA': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMTAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNTAiIGZpbGw9IiNEQzI2MjYiLz48dGV4dCB4PSI1MCIgeT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZvbnQtd2VpZ2h0PSJib2xkIj5DSU1CPC90ZXh0Pjwvc3ZnPg==',
  'DANAMON': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMTAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNTAiIGZpbGw9IiMwMDY2Q0MiLz48dGV4dCB4PSI1MCIgeT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZvbnQtd2VpZ2h0PSJib2xkIj5EQU5BTU9OPC90ZXh0Pjwvc3ZnPg==',
  'PERMATA': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMTAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNTAiIGZpbGw9IiNGRkMwMDAiLz48dGV4dCB4PSI1MCIgeT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNEQzI2MjYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZm9udC13ZWlnaHQ9ImJvbGQiPlBFUk1BVEE8L3RleHQ+PC9zdmc+'
};

// Indonesian bank codes for validation
export const INDONESIAN_BANK_CODES: Record<string, { name: string; code: string; swiftCode: string }> = {
  'BCA': { name: 'Bank Central Asia', code: '014', swiftCode: 'CENAIDJA' },
  'MANDIRI': { name: 'Bank Mandiri', code: '008', swiftCode: 'BMRIIDJA' },
  'BRI': { name: 'Bank Rakyat Indonesia', code: '002', swiftCode: 'BRINIDJA' },
  'BNI': { name: 'Bank Negara Indonesia', code: '009', swiftCode: 'BNINIDJA' },
  'BSI': { name: 'Bank Syariah Indonesia', code: '451', swiftCode: 'BSYUIDJA' },
  'BTN': { name: 'Bank Tabungan Negara', code: '200', swiftCode: 'BTANIDJA' },
  'CIMB_NIAGA': { name: 'CIMB Niaga', code: '022', swiftCode: 'BNIAIDJA' },
  'DANAMON': { name: 'Bank Danamon', code: '011', swiftCode: 'BDMUIDJA' },
  'PERMATA': { name: 'Bank Permata', code: '013', swiftCode: 'BBBAIDJA' }
};

const PAYMENT_CONFIG_FILE_PATH = join(process.cwd(), 'payment-configuration.json');

// Default payment configuration
const defaultPaymentConfig: PaymentConfiguration = {
  bankAccounts: [
    {
      id: 'bca-main',
      bankName: 'Bank Central Asia',
      bankCode: '014',
      accountNumber: '123-456-7890',
      accountHolder: 'PT QR Tunai Sejahtera',
      balance: 150750000,
      isActive: true,
      logo: INDONESIAN_BANK_LOGOS['BCA'],
      swiftCode: 'CENAIDJA',
      branchName: 'KCP Jakarta Pusat',
      branchCode: '0001',
      accountType: 'current',
      dailyLimit: 500000000,
      monthlyLimit: 10000000000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'mandiri-main',
      bankName: 'Bank Mandiri',
      bankCode: '008',
      accountNumber: '098-765-4321',
      accountHolder: 'PT QR Tunai Sejahtera',
      balance: 85200000,
      isActive: true,
      logo: INDONESIAN_BANK_LOGOS['MANDIRI'],
      swiftCode: 'BMRIIDJA',
      branchName: 'KCP Jakarta Pusat',
      branchCode: '0010',
      accountType: 'current',
      dailyLimit: 300000000,
      monthlyLimit: 5000000000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  qrisAccounts: [
    {
      id: 'qris-main',
      merchantId: 'QRT123456',
      merchantName: 'QR Tunai Drive-Thru',
      qrisCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      logoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNGRjMzMDAiLz48dGV4dCB4PSIyNSIgeT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjEyIj5RPC90ZXh0Pjwvc3ZnPg==',
      isActive: true,
      feePercentage: 0.7,
      dailyLimit: 20000000,
      monthlyLimit: 500000000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  defaultBankAccount: 'bca-main',
  defaultQrisAccount: 'qris-main',
  autoBackup: true,
  backupInterval: 24
};

// Get payment configuration from storage
export function getPaymentConfiguration(): PaymentConfiguration {
  try {
    if (existsSync(PAYMENT_CONFIG_FILE_PATH)) {
      const data = readFileSync(PAYMENT_CONFIG_FILE_PATH, 'utf8');
      return JSON.parse(data);
    } else {
      // Create file with default data if it doesn't exist
      savePaymentConfiguration(defaultPaymentConfig);
      return defaultPaymentConfig;
    }
  } catch (error) {
    console.error('Error reading payment configuration:', error);
    return defaultPaymentConfig;
  }
}

// Save payment configuration to storage
export function savePaymentConfiguration(config: PaymentConfiguration): void {
  try {
    const configToSave = {
      ...config,
      lastBackup: new Date().toISOString()
    };
    writeFileSync(PAYMENT_CONFIG_FILE_PATH, JSON.stringify(configToSave, null, 2));
  } catch (error) {
    console.error('Error saving payment configuration:', error);
  }
}

// Add bank account
export function addBankAccount(account: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>): string {
  const config = getPaymentConfiguration();
  const newAccount: BankAccount = {
    ...account,
    id: `bank-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  config.bankAccounts.push(newAccount);
  savePaymentConfiguration(config);
  return newAccount.id;
}

// Update bank account
export function updateBankAccount(id: string, updates: Partial<BankAccount>): boolean {
  const config = getPaymentConfiguration();
  const index = config.bankAccounts.findIndex(acc => acc.id === id);
  
  if (index === -1) {
    return false;
  }
  
  config.bankAccounts[index] = {
    ...config.bankAccounts[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  savePaymentConfiguration(config);
  return true;
}

// Delete bank account
export function deleteBankAccount(id: string): boolean {
  const config = getPaymentConfiguration();
  const index = config.bankAccounts.findIndex(acc => acc.id === id);
  
  if (index === -1) {
    return false;
  }
  
  // Don't delete if it's the default account
  if (config.defaultBankAccount === id && config.bankAccounts.length > 1) {
    // Set another account as default
    const otherAccount = config.bankAccounts.find(acc => acc.id !== id);
    if (otherAccount) {
      config.defaultBankAccount = otherAccount.id;
    }
  }
  
  config.bankAccounts.splice(index, 1);
  savePaymentConfiguration(config);
  return true;
}

// Add QRIS account
export function addQrisAccount(account: Omit<QrisAccount, 'id' | 'createdAt' | 'updatedAt'>): string {
  const config = getPaymentConfiguration();
  const newAccount: QrisAccount = {
    ...account,
    id: `qris-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  config.qrisAccounts.push(newAccount);
  savePaymentConfiguration(config);
  return newAccount.id;
}

// Update QRIS account
export function updateQrisAccount(id: string, updates: Partial<QrisAccount>): boolean {
  const config = getPaymentConfiguration();
  const index = config.qrisAccounts.findIndex(acc => acc.id === id);
  
  if (index === -1) {
    return false;
  }
  
  config.qrisAccounts[index] = {
    ...config.qrisAccounts[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  savePaymentConfiguration(config);
  return true;
}

// Validate bank account number format
export function validateBankAccountNumber(bankCode: string, accountNumber: string): boolean {
  // Remove non-numeric characters
  const cleanAccountNumber = accountNumber.replace(/\D/g, '');
  
  // Basic length validation based on Indonesian bank standards
  const bankValidation: Record<string, { minLength: number; maxLength: number }> = {
    '014': { minLength: 10, maxLength: 10 }, // BCA
    '008': { minLength: 13, maxLength: 13 }, // Mandiri
    '002': { minLength: 15, maxLength: 15 }, // BRI
    '009': { minLength: 10, maxLength: 10 }, // BNI
    '451': { minLength: 10, maxLength: 12 }, // BSI
    '200': { minLength: 13, maxLength: 13 }, // BTN
  };
  
  const validation = bankValidation[bankCode];
  if (!validation) {
    return cleanAccountNumber.length >= 8 && cleanAccountNumber.length <= 16;
  }
  
  return cleanAccountNumber.length >= validation.minLength && cleanAccountNumber.length <= validation.maxLength;
}

// Generate backup data
export function generateBackupData(): string {
  const config = getPaymentConfiguration();
  const backupData = {
    ...config,
    backupTimestamp: new Date().toISOString(),
    version: '1.0'
  };
  
  return JSON.stringify(backupData, null, 2);
}