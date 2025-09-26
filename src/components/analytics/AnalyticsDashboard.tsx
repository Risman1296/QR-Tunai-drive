"use client"

import { useMemo } from 'react'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

export default function AnalyticsDashboard() {
  const { metrics, loading, error } = useAnalytics()

  const kpis = useMemo(() => {
    return [
      { title: 'Total Revenue', value: metrics?.totalRevenue ?? 0, format: 'currency' as const },
      { title: 'Total Transaksi', value: metrics?.totalTransactions ?? 0, format: 'int' as const },
      { title: 'Rata-rata Transaksi', value: metrics?.averageTransaction ?? 0, format: 'currency' as const },
      { title: 'Conversion Rate', value: metrics?.conversionRate ?? 0, format: 'percent' as const },
    ]
  }, [metrics])

  const colors = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4']

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle className="text-base">{k.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading && '…'}
                {!loading && formatValue(k.value, k.format)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {error && (
        <Card>
          <CardContent>
            <div className="text-red-600">{error}</div>
          </CardContent>
        </Card>
      )}

      {/* Daily Revenue */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ revenue: { label: 'Revenue', color: '#2563eb' } }}
            className="h-72"
          >
            <LineChart data={metrics?.dailyData ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent labelKey="date" />} />
              <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Hourly Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Hourly Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ count: { label: 'Transactions', color: '#16a34a' } }}
            className="h-72"
          >
            <BarChart data={metrics?.hourlyData ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent labelKey="hour" />} />
              <Bar dataKey="count" fill="var(--color-count)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Method Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Method Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-72">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent labelKey="method" />} />
              <Pie data={metrics?.methodBreakdown ?? []} dataKey="count" nameKey="method" outerRadius={110}>
                {(metrics?.methodBreakdown ?? []).map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function formatValue(v: number, fmt: 'currency' | 'int' | 'percent') {
  if (fmt === 'currency') return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v)
  if (fmt === 'percent') return `${v.toFixed(1)}%`
  return new Intl.NumberFormat('id-ID').format(v)
}

export { }

