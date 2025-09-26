import { NextRequest, NextResponse } from 'next/server'
import analyticsStore from '@/lib/analytics-store'

// Force static export untuk Cloudflare Pages
export const dynamic = 'force-static';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const start = searchParams.get('startDate')
    const end = searchParams.get('endDate')
    const startDate = start ? new Date(start) : undefined
    const endDate = end ? new Date(end) : undefined

    const metrics = analyticsStore.getMetrics(startDate, endDate)
    return NextResponse.json({ metrics, lastUpdated: new Date().toISOString() })
  } catch (err) {
    console.error('GET /api/analytics/metrics error', err)
    return NextResponse.json({ error: 'Failed to calculate metrics' }, { status: 500 })
  }
}

