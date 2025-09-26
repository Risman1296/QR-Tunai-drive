import { NextRequest, NextResponse } from 'next/server'
import analyticsStore from '@/lib/analytics-store'
import { AnalyticsEventType } from '@/types/analytics'

// Force static export untuk Cloudflare Pages
export const dynamic = 'force-static';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') as AnalyticsEventType | null
    const start = searchParams.get('startDate')
    const end = searchParams.get('endDate')

    const startDate = start ? new Date(start) : undefined
    const endDate = end ? new Date(end) : undefined

    const events = analyticsStore.getEvents({ type: type ?? undefined, startDate, endDate })
    return NextResponse.json({ events })
  } catch (err) {
    console.error('GET /api/analytics/events error', err)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const eventType = body?.eventType as AnalyticsEventType | undefined
    if (!eventType) {
      return NextResponse.json({ error: 'eventType is required' }, { status: 400 })
    }

    const event = analyticsStore.addEvent({
      eventType,
      data: (body?.data ?? {}) as Record<string, any>,
      userId: body?.userId,
      ip: req.headers.get('x-forwarded-for') ?? undefined,
      userAgent: req.headers.get('user-agent') ?? undefined,
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (err) {
    console.error('POST /api/analytics/events error', err)
    return NextResponse.json({ error: 'Failed to record event' }, { status: 500 })
  }
}

