// Konfigurasi Bank Outlet untuk Transfer Pelanggan
export type OutletBank = {
  code: string;
  name: string;
  accountNumber: string;
  accountName: string;
};

// Data rekening outlet untuk 5 bank utama
export const outletBanks: OutletBank[] = [
  {
    code: 'BCA',
    name: 'Bank Central Asia',
    accountNumber: '7930471733', // Ganti dengan nomor rekening asli
    accountName: 'OUTLET QR TUNAI'
  },
  {
    code: 'BNI',
    name: 'Bank Negara Indonesia',
    accountNumber: '0123456789', // Ganti dengan nomor rekening asli
    accountName: 'OUTLET QR TUNAI'
  },
  {
    code: 'BRI',
    name: 'Bank Rakyat Indonesia',
    accountNumber: '0987654321', // Ganti dengan nomor rekening asli
    accountName: 'OUTLET QR TUNAI'
  },
  {
    code: 'BTN',
    name: 'Bank Tabungan Negara',
    accountNumber: '1357924680', // Ganti dengan nomor rekening asli
    accountName: 'OUTLET QR TUNAI'
  },
  {
    code: 'MANDIRI',
    name: 'Bank Mandiri',
    accountNumber: '2468013579', // Ganti dengan nomor rekening asli
    accountName: 'OUTLET QR TUNAI'
  }
];

// Metode transaksi untuk setiap jenis
export const transactionMethods = {
  'Tarik Tunai': [
    { value: 'transfer_outlet', label: 'Transfer Outlet' },
    { value: 'atm', label: 'ATM' },
    { value: 'qris', label: 'QRIS (Max. 1 Juta)' }
  ],
  'Transfer': [
    { value: 'tunai', label: 'Tunai' },
    { value: 'edc_atm', label: 'ATM Mesin EDC' }
  ]
};

// Helper function untuk mendapatkan bank outlet berdasarkan kode
export const getOutletBankByCode = (code: string): OutletBank | undefined => {
  return outletBanks.find(bank => bank.code === code);
};

// Helper function untuk menentukan cash flow berdasarkan jenis transaksi dan metode
export const determineCashFlow = (type: string, method?: string): 'in' | 'out' => {
  switch (type) {
    case 'Setor Tunai':
      return 'in'; // Kas masuk
    case 'Tarik Tunai':
      if (method === 'transfer_outlet') {
        return 'out'; // Kas bank keluar
      }
      return 'out'; // Kas tunai keluar
    case 'Transfer':
      if (method === 'tunai') {
        return 'out'; // Kas tunai keluar
      }
      return 'out'; // Kas bank keluar via EDC
    case 'Pembayaran':
      return 'out'; // Kas keluar
    default:
      return 'out';
  }
};