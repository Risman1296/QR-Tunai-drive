
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
    customerName: 'BUDI SETIAWAN',
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
    customerName: 'SITI AMINAH',
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
    customerName: 'RINA SARI',
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
    customerName: 'AGUS Wibowo',
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
    customerName: 'DEWI LESTARI',
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
    customerName: 'EKO PRASETYO',
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
    customerName: 'BUDI SETIAWAN',
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
    customerName: 'SITI AMINAH',
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
    customerName: 'RINA SARI',
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
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  balance: number;
  logo: string;
  history: BankAccountHistory[];
}

export const bankAccounts: BankAccount[] = [
  {
    id: 'bca',
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
    id: 'mandiri',
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
    id: 'bri',
    bankName: 'Bank Rakyat Indonesia',
    accountNumber: '111-222-3334',
    accountHolder: 'Outlet Pusat QR Tunai',
    balance: 112300000,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/68/BANK_BRI_logo.svg',
    history: [
      { id: 'BRI01', description: 'Trf dari Siti A.', amount: 2000000, type: 'credit', time: '11:50' },
      { id: 'BRI02', description: 'Tarik Tunai TXN123', amount: -500000, type: 'debit', time: '11:45' },
      { id: 'BRI03', description: 'Setoran Tunai TXN122', amount: 3500000, type: 'credit', time: '11:30' },
      { id: 'BRI04', description: 'Biaya Admin', amount: -6500, type: 'debit', time: '11:00' },
      { id: 'BRI05', description: 'Trf dari Toko Jaya', amount: 1800000, type: 'credit', time: '10:15' },
      { id: 'BRI06', description: 'Gaji Karyawan', amount: -15000000, type: 'debit', time: 'Yesterday' },
      { id: 'BRI07', description: 'Trf dari PT Sejahtera', amount: 7500000, type: 'credit', time: 'Yesterday' },
    ]
  },
  {
    id: 'bsi',
    bankName: 'Bank Syariah Indonesia',
    accountNumber: '777-888-9990',
    accountHolder: 'Outlet Pusat QR Tunai',
    balance: 78500000,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Bank_Syariah_Indonesia_logo.svg',
    history: [
      { id: 'BSI01', description: 'Setoran Nasabah', amount: 1500000, type: 'credit', time: '11:00' },
      { id: 'BSI02', description: 'Pembelian ATK', amount: -250000, type: 'debit', time: '09:10' },
      { id: 'BSI03', description: 'Trf dari H. Sulaiman', amount: 5000000, type: 'credit', time: 'Yesterday' },
    ]
  },
  {
    id: 'bni',
    bankName: 'Bank Negara Indonesia',
    accountNumber: '444-555-6667',
    accountHolder: 'Outlet Pusat QR Tunai',
    balance: 95100000,
    logo: 'https://upload.wikimedia.org/wikipedia/id/5/55/BNI_logo.svg',
    history: [
      { id: 'BNI01', description: 'Trf dari PT Abadi', amount: 10000000, type: 'credit', time: '10:45' },
      { id: 'BNI02', description: 'Tarik tunai nasabah', amount: -2000000, type: 'debit', time: '10:00' },
      { id: 'BNI03', description: 'Setoran', amount: 3000000, type: 'credit', time: 'Yesterday' },
    ]
  },
  {
    id: 'btn',
    bankName: 'Bank Tabungan Negara',
    accountNumber: '222-333-4445',
    accountHolder: 'Outlet Pusat QR Tunai',
    balance: 62000000,
    logo: 'https://upload.wikimedia.org/wikipedia/id/b/b3/Bank_Tabungan_Negara_logo.svg',
    history: [
      { id: 'BTN01', description: 'Kredit Angsuran', amount: 850000, type: 'credit', time: '11:20' },
      { id: 'BTN02', description: 'Biaya admin', amount: -15000, type: 'debit', time: 'Yesterday' },
      { id: 'BTN03', description: 'Trf dari Ibu Ratna', amount: 1000000, type: 'credit', time: 'Yesterday' },
    ]
  }
];
