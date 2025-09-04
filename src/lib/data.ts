export type Transaction = {
  id: string;
  type: 'Tarik Tunai' | 'Setor Tunai' | 'Transfer' | 'Pembayaran';
  bank: string;
  accountNumber: string;
  amount: number;
  customerName?: string;
  notes: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
  date: Date;
  cashier?: string;
};

export const pendingTransactions: Transaction[] = [
  {
    id: 'TXN789012',
    type: 'Tarik Tunai',
    bank: 'Bank Central Asia',
    accountNumber: '8881234567',
    amount: 500000,
    notes: 'Untuk biaya sekolah anak.',
    status: 'Pending',
    date: new Date(Date.now() - 1 * 60 * 1000), // 1 minute ago
  },
  {
    id: 'TXN456789',
    type: 'Transfer',
    bank: 'Bank Mandiri',
    accountNumber: '1239876543',
    amount: 1250000,
    notes: 'Pembayaran supplier',
    status: 'Pending',
    date: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
  },
  {
    id: 'TXN123456',
    type: 'Setor Tunai',
    bank: 'Bank Rakyat Indonesia',
    accountNumber: '0987654321',
    amount: 2000000,
    notes: '',
    status: 'Pending',
    date: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
  },
];

export const transactionHistory: Transaction[] = [
    {
    id: 'TXN001',
    type: 'Tarik Tunai',
    bank: 'Bank Permata',
    accountNumber: '555666777',
    amount: 300000,
    notes: '',
    status: 'Completed',
    date: new Date('2024-07-20T10:30:00'),
    cashier: 'Admin',
  },
  {
    id: 'TXN002',
    type: 'Pembayaran',
    bank: 'Citibank',
    accountNumber: 'N/A - Tagihan Listrik',
    amount: 450000,
    notes: 'Tagihan bulan Juli',
    status: 'Completed',
    date: new Date('2024-07-20T09:15:00'),
    cashier: 'Admin',
  },
  {
    id: 'TXN003',
    type: 'Transfer',
    bank: 'Bank Syariah Indonesia',
    accountNumber: '7123456789',
    amount: 750000,
    notes: 'Untuk keluarga',
    status: 'Completed',
    date: new Date('2024-07-19T15:00:00'),
    cashier: 'Admin',
  },
  {
    id: 'TXN004',
    type: 'Setor Tunai',
    bank: 'Bank Central Asia',
    accountNumber: '8881234567',
    amount: 1000000,
    notes: 'Tabungan',
    status: 'Completed',
    date: new Date('2024-07-19T11:45:00'),
    cashier: 'Admin',
  },
  {
    id: 'TXN005',
    type: 'Tarik Tunai',
    bank: 'Bank Mandiri',
    accountNumber: '1239876543',
    amount: 1500000,
    notes: 'Modal usaha',
    status: 'Completed',
    date: new Date('2024-07-18T14:20:00'),
    cashier: 'Admin',
  },
  {
    id: 'TXN006',
    type: 'Transfer',
    bank: 'Bank Rakyat Indonesia',
    accountNumber: '0987654321',
    amount: 250000,
    notes: '',
    status: 'Cancelled',
    date: new Date('2024-07-18T10:05:00'),
    cashier: 'Admin',
  },
];

export type BankAccountHistory = {
  id: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  time: string;
};

export type BankAccount = {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  balance: number;
  logo: string;
  history: BankAccountHistory[];
}

export const bankAccounts: BankAccount[] = [
  {
    bankName: 'Bank Central Asia',
    accountNumber: '123-456-7890',
    accountHolder: 'Outlet Pusat QR Tunai',
    balance: 150750000,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia_logo.svg',
    history: [
      { id: 'BCA01', description: 'Trf dari Rina S.', amount: 500000, type: 'credit', time: '10:15' },
      { id: 'BCA02', description: 'Bayar listrik', amount: -750000, type: 'debit', time: '09:30' },
      { id: 'BCA03', description: 'Trf dari Budi P.', amount: 200000, type: 'credit', time: '08:45' },
    ]
  },
  {
    bankName: 'Bank Mandiri',
    accountNumber: '098-765-4321',
    accountHolder: 'Outlet Pusat QR Tunai',
    balance: 85200000,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg',
    history: [
      { id: 'MDR01', description: 'Trf dari CV Maju', amount: 1250000, type: 'credit', time: '10:05' },
      { id: 'MDR02', description: 'Setoran tunai', amount: 5000000, type: 'credit', time: '09:00' },
      { id: 'MDR03', description: 'Biaya sewa', amount: -2500000, type: 'debit', time: 'Yesterday' },
    ]
  },
  {
    bankName: 'Bank Rakyat Indonesia',
    accountNumber: '111-222-3334',
    accountHolder: 'Outlet Pusat QR Tunai',
    balance: 112300000,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/BANK_BRI_logo.svg/2560px-BANK_BRI_logo.svg.png',
    history: [
      { id: 'BRI01', description: 'Trf dari Siti A.', amount: 2000000, type: 'credit', time: '09:50' },
      { id: 'BRI02', description: 'Gaji Karyawan', amount: -15000000, type: 'debit', time: 'Yesterday' },
      { id: 'BRI03', description: 'Trf dari Toko Jaya', amount: 3500000, type: 'credit', time: 'Yesterday' },
    ]
  }
];
