export type AnalyticsEventType =
  | 'transaction'
  | 'login'
  | 'qr_scan'
  | 'form_access'
  | 'custom'

export interface AnalyticsEvent {
  id: string
  userId?: string
  eventType: AnalyticsEventType
  data: Record<string, any>
  timestamp: Date
  ip?: string
  userAgent?: string
}

export interface AnalyticsMetrics {
  totalRevenue: number
  totalTransactions: number
  averageTransaction: number
  conversionRate: number
  topBanks: { bank: string; count: number; revenue: number }[]
  hourlyData: { hour: number; count: number; revenue: number }[]
  dailyData: { date: string; count: number; revenue: number }[]
  methodBreakdown: { method: string; count: number; percentage: number }[]
}

