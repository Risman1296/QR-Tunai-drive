import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard'

export default function AnalyticsPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Ringkasan metrik transaksi dan aktivitas pengguna.</p>
      </div>
      <AnalyticsDashboard />
    </div>
  )
}
