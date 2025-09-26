export type FeeValue =
  | { kind: 'flat'; amount: number } // amount in IDR (integer rupiah)
  | { kind: 'percent'; bps: number }; // basis points, e.g. 70 = 0.70%

export interface TransactionFee {
  id: string;
  type: string;
  fee: string; // legacy display, e.g. 'Rp 6.500' or '0.7%'
  status: boolean;
  normalizedFee?: FeeValue; // preferred numeric representation
}

export interface SystemConfig {
  // QR Display Settings
  qrSize: number
  qrRefreshInterval: number
  autoRefresh: boolean
  displayMode: 'dominant' | 'fullscreen' | 'dashboard'
  landscapeMode: boolean

  // Production Settings
  productionMode: boolean
  demoMode: boolean
  debugMode: boolean
  simulationEnabled: boolean

  // System Settings
  serverPort: number
  maxConnections: number
  sessionTimeout: number
  logLevel: 'error' | 'warn' | 'info' | 'debug'

  // Security Settings
  enableSSL: boolean
  apiRateLimit: number
  authTimeout: number

  // Banking Integration
  bankName: string
  branchCode: string
  terminalId: string
  merchantCode: string
  // Transaction Fees
  transactionFees: TransactionFee[];
}

let systemConfig: SystemConfig = {
  // QR Display Settings
  qrSize: 480,
  qrRefreshInterval: 60,
  autoRefresh: false,
  displayMode: 'dominant',
  landscapeMode: true,

  // Production Settings - Default to PRODUCTION MODE
  productionMode: true,
  demoMode: false,
  debugMode: false,
  simulationEnabled: false,

  // System Settings
  serverPort: 3000,
  maxConnections: 100,
  sessionTimeout: 30,
  logLevel: 'info',

  // Security Settings
  enableSSL: false,
  apiRateLimit: 100,
  authTimeout: 15,

  // Banking Integration
  bankName: 'Bank Terdepan',
  branchCode: 'BTD001',
  terminalId: 'QRT001',
  merchantCode: 'MRC001',

  // Transaction Fees (default)
  transactionFees: [
    { id: "FEE01", type: "Transfer Antar Bank", fee: "Rp 6.500", status: true, normalizedFee: { kind: 'flat', amount: 6500 } },
    { id: "FEE02", type: "Tarik Tunai (Beda Bank)", fee: "Rp 7.500", status: true, normalizedFee: { kind: 'flat', amount: 7500 } },
    { id: "FEE03", type: "Pembayaran QRIS (> 100rb)", fee: "0.7%", status: true, normalizedFee: { kind: 'percent', bps: 70 } },
    { id: "FEE04", type: "Biaya Layanan Drive-Thru", fee: "Rp 2.000", status: false, normalizedFee: { kind: 'flat', amount: 2000 } },
  ],
}

export function getCurrentConfig(): SystemConfig {
  return systemConfig
}

export function setCurrentConfig(newConfig: SystemConfig) {
  systemConfig = newConfig
}

export function isValidConfig(config: any): config is SystemConfig {
  return (
    typeof config === 'object' &&
    typeof config.qrSize === 'number' && config.qrSize >= 200 && config.qrSize <= 600 &&
    typeof config.qrRefreshInterval === 'number' && config.qrRefreshInterval >= 10 &&
    typeof config.productionMode === 'boolean' &&
    typeof config.displayMode === 'string' &&
    ['dominant', 'fullscreen', 'dashboard'].includes(config.displayMode) &&
    Array.isArray(config.transactionFees) &&
    config.transactionFees.every((fee: any) => {
      const legacyOk = typeof fee.fee === 'string';
      const normalizedOk = !fee.normalizedFee || (
        (fee.normalizedFee.kind === 'flat' && Number.isInteger(fee.normalizedFee.amount) && fee.normalizedFee.amount >= 0) ||
        (fee.normalizedFee.kind === 'percent' && Number.isInteger(fee.normalizedFee.bps) && fee.normalizedFee.bps >= 0)
      );
      return (
        typeof fee.id === 'string' &&
        typeof fee.type === 'string' &&
        typeof fee.status === 'boolean' &&
        legacyOk && normalizedOk
      );
    })
  );
}

export async function applyConfiguration(config: SystemConfig) {
  if (config.productionMode) {
    console.log('[CONFIG] PRODUCTION MODE ACTIVATED')
    console.log('- Demo mode: DISABLED')
    console.log('- Simulation: DISABLED')
    console.log('- Debug mode: DISABLED')
    console.log('- QR Size: ' + config.qrSize + 'px')
    console.log('- Display Mode: ' + config.displayMode)
  }
}
