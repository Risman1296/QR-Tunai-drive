// Bank account configuration storage and management
import { writeFileSync, readFileSync, existsSync } from "fs"
import { join } from "path"

export interface BankAccount {
  id: string
  bankName: string
  bankCode: string
  accountNumber: string
  accountHolder: string
  balance: number
  isActive: boolean
  integrationId?: string
  logo: string
  swiftCode?: string
  branchName?: string
  branchCode?: string
  accountType: "current" | "savings" | "escrow"
  dailyLimit?: number
  monthlyLimit?: number
  createdAt: string
  updatedAt: string
}

export interface QrisAccount {
  id: string
  merchantId: string
  merchantName: string
  qrisCode: string
  logoUrl: string
  isActive: boolean
  dailyLimit?: number
  monthlyLimit?: number
  feePercentage: number
  createdAt: string
  updatedAt: string
}

export type BankIntegrationProvider = "bca_snap_qris" | "bri_realtime" | "custom"

export interface BankIntegration {
  id: string
  bankName: string
  bankCode: string
  provider: BankIntegrationProvider
  description?: string
  isActive: boolean
  credentials: {
    baseUrl: string
    clientId?: string
    clientSecret?: string
    apiSecret?: string
    channelId?: string
    partnerId?: string
    qrisPath?: string
    tokenPath?: string
    balancePath?: string
    transactionsPath?: string
    additional?: Record<string, unknown>
  }
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface PaymentConfiguration {
  bankAccounts: BankAccount[]
  qrisAccounts: QrisAccount[]
  defaultBankAccount?: string
  defaultQrisAccount?: string
  autoBackup: boolean
  backupInterval: number // in hours
  lastBackup?: string
  bankIntegrations: BankIntegration[]
}

// Indonesian bank logos - using reliable CDN sources
export const INDONESIAN_BANK_LOGOS: Record<string, string> = {
  BCA: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMTAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNTAiIGZpbGw9IiMwMDY2Q0MiLz48dGV4dCB4PSI1MCIgeT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIj5CQ0E8L3RleHQ+PC9zdmc+",
  MANDIRI: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMTAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNTAiIGZpbGw9IiNGRkMwMDAiLz48dGV4dCB4PSI1MCIgeT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMwMDMzOTkiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9ImJvbGQiPk1BTkRJUkk8L3RleHQ+PC9zdmc+",
  BRI: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMTAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNTAiIGZpbGw9IiMwMDY2Q0MiLz48dGV4dCB4PSI1MCIgeT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIj5CUkk8L3RleHQ+PC9zdmc+",
  BNI: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMTAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNTAiIGZpbGw9IiNGRjY2MDAiLz48dGV4dCB4PSI1MCIgeT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIj5CTkk8L3RleHQ+PC9zdmc+",
  BSI: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMTAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNTAiIGZpbGw9IiMwMDk5NDQiLz48dGV4dCB4PSI1MCIgeT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIj5CU0k8L3RleHQ+PC9zdmc+",
  BTN: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMTAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNTAiIGZpbGw9IiMwMDY2Q0MiLz48dGV4dCB4PSI1MCIgeT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIj5CVE48L3RleHQ+PC9zdmc+",
  CIMB_NIAGA: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMTAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNTAiIGZpbGw9IiNEQzI2MjYiLz48dGV4dCB4PSI1MCIgeT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZvbnQtd2VpZ2h0PSJib2xkIj5DSU1CPC90ZXh0Pjwvc3ZnPg==",
  DANAMON: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMTAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNTAiIGZpbGw9IiMwMDY2Q0MiLz48dGV4dCB4PSI1MCIgeT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZvbnQtd2VpZ2h0PSJib2xkIj5EQU5BTU9OPC90ZXh0Pjwvc3ZnPg==",
  PERMATA: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMTAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNTAiIGZpbGw9IiNGRkMwMDAiLz48dGV4dCB4PSI1MCIgeT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNEQzI2MjYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZm9udC13ZWlnaHQ9ImJvbGQiPlBFUk1BVEE8L3RleHQ+PC9zdmc+"
}

// Indonesian bank codes for validation
export const INDONESIAN_BANK_CODES: Record<string, { name: string; code: string; swiftCode: string }> = {
  BCA: { name: "Bank Central Asia", code: "014", swiftCode: "CENAIDJA" },
  MANDIRI: { name: "Bank Mandiri", code: "008", swiftCode: "BMRIIDJA" },
  BRI: { name: "Bank Rakyat Indonesia", code: "002", swiftCode: "BRINIDJA" },
  BNI: { name: "Bank Negara Indonesia", code: "009", swiftCode: "BNINIDJA" },
  BSI: { name: "Bank Syariah Indonesia", code: "451", swiftCode: "BSYUIDJA" },
  BTN: { name: "Bank Tabungan Negara", code: "200", swiftCode: "BTANIDJA" },
  CIMB_NIAGA: { name: "CIMB Niaga", code: "022", swiftCode: "BNIAIDJA" },
  DANAMON: { name: "Bank Danamon", code: "011", swiftCode: "BDMUIDJA" },
  PERMATA: { name: "Bank Permata", code: "013", swiftCode: "BBBAIDJA" }
}

const PAYMENT_CONFIG_FILE_PATH = join(process.cwd(), "payment-configuration.json")

const defaultCreatedAt = new Date().toISOString()

// Default payment configuration
const defaultPaymentConfig: PaymentConfiguration = {
  bankAccounts: [
    {
      id: "bca-main",
      bankName: "Bank Central Asia",
      bankCode: "014",
      accountNumber: "123-456-7890",
      accountHolder: "PT QR Tunai Sejahtera",
      balance: 150_750_000,
      isActive: true,
      integrationId: 'bca-snap-qris',
      logo: INDONESIAN_BANK_LOGOS.BCA,
      swiftCode: "CENAIDJA",
      branchName: "KCP Jakarta Pusat",
      branchCode: "0001",
      accountType: "current",
      dailyLimit: 500_000_000,
      monthlyLimit: 10_000_000_000,
      createdAt: defaultCreatedAt,
      updatedAt: defaultCreatedAt
    },
    {
      id: "bri-main",
      bankName: "Bank Rakyat Indonesia",
      bankCode: "002",
      accountNumber: "0068-0100-123456-0",
      accountHolder: "PT QR Tunai Sejahtera",
      balance: 64_300_000,
      isActive: true,
      integrationId: 'bri-realtime',
      logo: INDONESIAN_BANK_LOGOS.BRI,
      swiftCode: "BRINIDJA",
      branchName: "KC Jakarta Thamrin",
      branchCode: "1023",
      accountType: "current",
      dailyLimit: 400_000_000,
      monthlyLimit: 7_500_000_000,
      createdAt: defaultCreatedAt,
      updatedAt: defaultCreatedAt
    },
    {
      id: "mandiri-main",
      bankName: "Bank Mandiri",
      bankCode: "008",
      accountNumber: "098-765-4321",
      accountHolder: "PT QR Tunai Sejahtera",
      balance: 85_200_000,
      isActive: true,
      logo: INDONESIAN_BANK_LOGOS.MANDIRI,
      swiftCode: "BMRIIDJA",
      branchName: "KCP Jakarta Pusat",
      branchCode: "0010",
      accountType: "current",
      dailyLimit: 300_000_000,
      monthlyLimit: 5_000_000_000,
      createdAt: defaultCreatedAt,
      updatedAt: defaultCreatedAt
    }
  ],
  qrisAccounts: [
    {
      id: "qris-main",
      merchantId: "QRT123456",
      merchantName: "QR Tunai Drive-Thru",
      qrisCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      logoUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNGRjMzMDAiLz48dGV4dCB4PSIyNSIgeT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjEyIj5RPC90ZXh0Pjwvc3ZnPg==",
      isActive: true,
      feePercentage: 0.7,
      dailyLimit: 20_000_000,
      monthlyLimit: 500_000_000,
      createdAt: defaultCreatedAt,
      updatedAt: defaultCreatedAt
    }
  ],
  bankIntegrations: [
    {
      id: "bca-snap-qris",
      bankName: "Bank Central Asia",
      bankCode: "014",
      provider: "bca_snap_qris",
      description: "Integrasi SNAP QRIS BCA untuk generate QR realtime",
      isActive: true,
      credentials: {
        baseUrl: "https://sandbox.bca.co.id",
        clientId: "",
        clientSecret: "",
        apiSecret: "",
        channelId: "95051",
        qrisPath: "/openapi/v1.0/qris-mpm",
        balancePath: "/openapi/v1.0/balance-inquiry",
        transactionsPath: "/openapi/v1.0/bank-statement"
      },
      metadata: {
        note: "Isi kredensial melalui dashboard settings",
        timeOffsetMinutes: 420
      },
      createdAt: defaultCreatedAt,
      updatedAt: defaultCreatedAt
    },
    {
      id: "bri-realtime",
      bankName: "Bank Rakyat Indonesia",
      bankCode: "002",
      provider: "bri_realtime",
      description: "Integrasi BRIAPI untuk saldo dan mutasi realtime",
      isActive: true,
      credentials: {
        baseUrl: "https://partner.api.bri.co.id",
        clientId: "",
        clientSecret: "",
        apiSecret: "",
        partnerId: "",
        tokenPath: "/oauth/client_credential/accesstoken",
        balancePath: "/v2/inquiry/{accountNumber}",
        transactionsPath: "/v2/accounts/{accountNumber}/transactions"
      },
      metadata: {
        note: "Pastikan client_id, client_secret, dan signature key BRIAPI terisi di dashboard",
        timestampSkewSeconds: 300,
        useUtcTimestamp: true,
        // Default preset sesuai dokumen Informasi Rekening v2 (inquiry)
        tokenAuth: "form",
        signatureFormat: "payload",
        headersStyle: "bri",
        signatureEncoding: "hex"
      },
      createdAt: defaultCreatedAt,
      updatedAt: defaultCreatedAt
    }
  ],
  defaultBankAccount: "bca-main",
  defaultQrisAccount: "qris-main",
  autoBackup: true,
  backupInterval: 24,
  lastBackup: defaultCreatedAt
}

function normalizePaymentConfiguration(input: Partial<PaymentConfiguration> | undefined): PaymentConfiguration {
  const parsed = input ?? {}
  return {
    ...defaultPaymentConfig,
    ...parsed,
    bankAccounts: Array.isArray(parsed.bankAccounts) ? parsed.bankAccounts : defaultPaymentConfig.bankAccounts,
    qrisAccounts: Array.isArray(parsed.qrisAccounts) ? parsed.qrisAccounts : defaultPaymentConfig.qrisAccounts,
    bankIntegrations: Array.isArray(parsed.bankIntegrations) ? parsed.bankIntegrations : defaultPaymentConfig.bankIntegrations,
    backupInterval: parsed.backupInterval ?? defaultPaymentConfig.backupInterval,
    autoBackup: parsed.autoBackup ?? defaultPaymentConfig.autoBackup,
    defaultBankAccount: parsed.defaultBankAccount ?? defaultPaymentConfig.defaultBankAccount,
    defaultQrisAccount: parsed.defaultQrisAccount ?? defaultPaymentConfig.defaultQrisAccount,
    lastBackup: parsed.lastBackup ?? new Date().toISOString()
  }
}

// Get payment configuration from storage
export function getPaymentConfiguration(): PaymentConfiguration {
  try {
    if (existsSync(PAYMENT_CONFIG_FILE_PATH)) {
      const data = readFileSync(PAYMENT_CONFIG_FILE_PATH, "utf8")
      const parsed = JSON.parse(data) as Partial<PaymentConfiguration>
      return normalizePaymentConfiguration(parsed)
    }
    savePaymentConfiguration(defaultPaymentConfig)
    return defaultPaymentConfig
  } catch (error) {
    console.error("Error reading payment configuration:", error)
    return defaultPaymentConfig
  }
}

// Save payment configuration to storage
export function savePaymentConfiguration(config: PaymentConfiguration): void {
  try {
    const normalized = normalizePaymentConfiguration(config)
    const configToSave = {
      ...normalized,
      lastBackup: new Date().toISOString()
    }
    writeFileSync(PAYMENT_CONFIG_FILE_PATH, JSON.stringify(configToSave, null, 2))
  } catch (error) {
    console.error("Error saving payment configuration:", error)
  }
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
}

// Add bank account
export function addBankAccount(account: Omit<BankAccount, "id" | "createdAt" | "updatedAt">): string {
  const config = getPaymentConfiguration()
  const newAccount: BankAccount = {
    ...account,
    id: generateId("bank"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  config.bankAccounts.push(newAccount)
  savePaymentConfiguration(config)
  return newAccount.id
}

// Update bank account
export function updateBankAccount(id: string, updates: Partial<BankAccount>): boolean {
  const config = getPaymentConfiguration()
  const index = config.bankAccounts.findIndex((acc) => acc.id === id)

  if (index === -1) {
    return false
  }

  config.bankAccounts[index] = {
    ...config.bankAccounts[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }

  savePaymentConfiguration(config)
  return true
}

// Delete bank account
export function deleteBankAccount(id: string): boolean {
  const config = getPaymentConfiguration()
  const index = config.bankAccounts.findIndex((acc) => acc.id === id)

  if (index === -1) {
    return false
  }

  if (config.defaultBankAccount === id && config.bankAccounts.length > 1) {
    const otherAccount = config.bankAccounts.find((acc) => acc.id !== id)
    if (otherAccount) {
      config.defaultBankAccount = otherAccount.id
    }
  }

  config.bankAccounts.splice(index, 1)
  savePaymentConfiguration(config)
  return true
}

// Add QRIS account
export function addQrisAccount(account: Omit<QrisAccount, "id" | "createdAt" | "updatedAt">): string {
  const config = getPaymentConfiguration()
  const newAccount: QrisAccount = {
    ...account,
    id: generateId("qris"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  config.qrisAccounts.push(newAccount)
  savePaymentConfiguration(config)
  return newAccount.id
}

// Update QRIS account
export function updateQrisAccount(id: string, updates: Partial<QrisAccount>): boolean {
  const config = getPaymentConfiguration()
  const index = config.qrisAccounts.findIndex((acc) => acc.id === id)

  if (index === -1) {
    return false
  }

  config.qrisAccounts[index] = {
    ...config.qrisAccounts[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }

  savePaymentConfiguration(config)
  return true
}

// Delete QRIS account
export function deleteQrisAccount(id: string): boolean {
  const config = getPaymentConfiguration()
  const index = config.qrisAccounts.findIndex((acc) => acc.id === id)

  if (index === -1) {
    return false
  }

  config.qrisAccounts.splice(index, 1)
  savePaymentConfiguration(config)
  return true
}

// Bank integration helpers
export function addBankIntegration(integration: Omit<BankIntegration, "id" | "createdAt" | "updatedAt">): BankIntegration {
  const config = getPaymentConfiguration()
  const newIntegration: BankIntegration = {
    ...integration,
    id: generateId("integration"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  config.bankIntegrations.push(newIntegration)
  savePaymentConfiguration(config)
  return newIntegration
}

export function updateBankIntegration(id: string, updates: Partial<BankIntegration>): boolean {
  const config = getPaymentConfiguration()
  const index = config.bankIntegrations.findIndex((item) => item.id === id)

  if (index === -1) {
    return false
  }

  config.bankIntegrations[index] = {
    ...config.bankIntegrations[index],
    ...updates,
    credentials: {
      ...config.bankIntegrations[index].credentials,
      ...updates.credentials
    },
    metadata: {
      ...config.bankIntegrations[index].metadata,
      ...updates.metadata
    },
    updatedAt: new Date().toISOString()
  }

  savePaymentConfiguration(config)
  return true
}

export function toggleBankIntegration(id: string, isActive: boolean): boolean {
  return updateBankIntegration(id, { isActive })
}

export function deleteBankIntegration(id: string): boolean {
  const config = getPaymentConfiguration()
  const index = config.bankIntegrations.findIndex((item) => item.id === id)
  if (index === -1) {
    return false
  }
  config.bankIntegrations.splice(index, 1)
  savePaymentConfiguration(config)
  return true
}


export function getBankIntegrationById(id: string): BankIntegration | undefined {
  const config = getPaymentConfiguration()
  return config.bankIntegrations.find((item) => item.id === id)
}

export function findBankIntegrationByBankCode(bankCode: string): BankIntegration | undefined {
  const config = getPaymentConfiguration()
  return config.bankIntegrations.find((item) => item.bankCode === bankCode)
}

// Validate bank account number format
export function validateBankAccountNumber(bankCode: string, accountNumber: string): boolean {
  const cleanAccountNumber = accountNumber.replace(/\D/g, "")

  const bankValidation: Record<string, { minLength: number; maxLength: number }> = {
    "014": { minLength: 10, maxLength: 10 },
    "008": { minLength: 13, maxLength: 13 },
    "002": { minLength: 15, maxLength: 15 },
    "009": { minLength: 10, maxLength: 10 },
    "451": { minLength: 10, maxLength: 12 },
    "200": { minLength: 13, maxLength: 13 }
  }

  const validation = bankValidation[bankCode]
  if (!validation) {
    return cleanAccountNumber.length >= 8 && cleanAccountNumber.length <= 16
  }

  return cleanAccountNumber.length >= validation.minLength && cleanAccountNumber.length <= validation.maxLength
}

// Generate backup data
export function generateBackupData(): string {
  const config = getPaymentConfiguration()
  const backupData = {
    ...config,
    backupTimestamp: new Date().toISOString(),
    version: "1.1"
  }

  return JSON.stringify(backupData, null, 2)
}

