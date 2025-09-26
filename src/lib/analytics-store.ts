import { AnalyticsEvent, AnalyticsEventType, AnalyticsMetrics } from '@/types/analytics'

function toISODate(d: Date): string {
  const dd = new Date(d)
  dd.setHours(0, 0, 0, 0)
  return dd.toISOString().slice(0, 10)
}

class AnalyticsStore {
  private events: Map<string, AnalyticsEvent> = new Map()

  addEvent(input: Omit<AnalyticsEvent, 'id' | 'timestamp'> & { timestamp?: Date }): AnalyticsEvent {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const event: AnalyticsEvent = {
      id,
      timestamp: input.timestamp ?? new Date(),
      ...input,
    }
    this.events.set(id, event)
    return event
  }

  getEvents(filters?: {
    type?: AnalyticsEventType
    startDate?: Date
    endDate?: Date
  }): AnalyticsEvent[] {
    let list = Array.from(this.events.values())
    if (filters?.type) {
      list = list.filter((e) => e.eventType === filters.type)
    }
    if (filters?.startDate) {
      const startMs = filters.startDate.getTime()
      list = list.filter((e) => e.timestamp.getTime() >= startMs)
    }
    if (filters?.endDate) {
      const endMs = filters.endDate.getTime()
      list = list.filter((e) => e.timestamp.getTime() <= endMs)
    }
    // Sort newest first
    return list.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  getMetrics(startDate?: Date, endDate?: Date): AnalyticsMetrics {
    const events = this.getEvents({ startDate, endDate })

    // Basic counts
    const transactions = events.filter((e) => e.eventType === 'transaction')
    const scans = events.filter((e) => e.eventType === 'qr_scan')

    const totalRevenue = transactions.reduce((sum, e) => {
      const amt = Number(e.data?.amount ?? 0)
      return sum + (isFinite(amt) ? amt : 0)
    }, 0)
    const totalTransactions = transactions.length
    const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0
    const conversionRate = scans.length > 0 ? (totalTransactions / scans.length) * 100 : 0

    // Group by bank
    const bankMap = new Map<string, { count: number; revenue: number }>()
    for (const t of transactions) {
      const bank = String(t.data?.bank ?? 'Unknown')
      const amt = Number(t.data?.amount ?? 0)
      const cur = bankMap.get(bank) ?? { count: 0, revenue: 0 }
      cur.count += 1
      cur.revenue += isFinite(amt) ? amt : 0
      bankMap.set(bank, cur)
    }
    const topBanks = Array.from(bankMap.entries())
      .map(([bank, v]) => ({ bank, count: v.count, revenue: v.revenue }))
      .sort((a, b) => b.revenue - a.revenue)

    // Hourly
    const hourlyAgg = new Map<number, { count: number; revenue: number }>()
    for (const t of transactions) {
      const hour = t.timestamp.getHours()
      const amt = Number(t.data?.amount ?? 0)
      const cur = hourlyAgg.get(hour) ?? { count: 0, revenue: 0 }
      cur.count += 1
      cur.revenue += isFinite(amt) ? amt : 0
      hourlyAgg.set(hour, cur)
    }
    const hourlyData = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      count: hourlyAgg.get(h)?.count ?? 0,
      revenue: hourlyAgg.get(h)?.revenue ?? 0,
    }))

    // Daily
    const dailyAgg = new Map<string, { count: number; revenue: number }>()
    for (const t of transactions) {
      const key = toISODate(t.timestamp)
      const amt = Number(t.data?.amount ?? 0)
      const cur = dailyAgg.get(key) ?? { count: 0, revenue: 0 }
      cur.count += 1
      cur.revenue += isFinite(amt) ? amt : 0
      dailyAgg.set(key, cur)
    }
    const dailyData = Array.from(dailyAgg.entries())
      .map(([date, v]) => ({ date, count: v.count, revenue: v.revenue }))
      .sort((a, b) => (a.date < b.date ? -1 : 1))

    // Method breakdown
    const methodAgg = new Map<string, number>()
    for (const t of transactions) {
      const method = String(t.data?.method ?? 'Unknown')
      methodAgg.set(method, (methodAgg.get(method) ?? 0) + 1)
    }
    const methodTotal = Array.from(methodAgg.values()).reduce((a, b) => a + b, 0)
    const methodBreakdown = Array.from(methodAgg.entries()).map(([method, count]) => ({
      method,
      count,
      percentage: methodTotal > 0 ? (count / methodTotal) * 100 : 0,
    }))

    return {
      totalRevenue,
      totalTransactions,
      averageTransaction,
      conversionRate,
      topBanks,
      hourlyData,
      dailyData,
      methodBreakdown,
    }
  }
}

// Singleton instance
const analyticsStore = new AnalyticsStore()
export default analyticsStore

