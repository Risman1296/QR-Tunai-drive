"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnalyticsMetrics, AnalyticsEventType } from '@/types/analytics'

export function useAnalytics(startDate?: Date, endDate?: Date) {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const qs = useMemo(() => {
    const p = new URLSearchParams()
    if (startDate) p.set('startDate', startDate.toISOString())
    if (endDate) p.set('endDate', endDate.toISOString())
    const s = p.toString()
    return s ? `?${s}` : ''
  }, [startDate, endDate])

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/analytics/metrics${qs}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`Failed: ${res.status}`)
      const json = await res.json()
      setMetrics(json.metrics as AnalyticsMetrics)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to fetch metrics')
    } finally {
      setLoading(false)
    }
  }, [qs])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  const trackEvent = useCallback(
    async (eventType: AnalyticsEventType, data: Record<string, any>, userId?: string) => {
      const res = await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType, data, userId }),
      })
      if (!res.ok) throw new Error('Failed to track event')
      return res.json()
    },
    []
  )

  const refetch = useCallback(() => {
    fetchMetrics()
  }, [fetchMetrics])

  return { metrics, loading, error, trackEvent, refetch }
}

