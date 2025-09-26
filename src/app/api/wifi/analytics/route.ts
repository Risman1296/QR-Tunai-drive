/**
 * WiFi Analytics API
 * Provides usage statistics and reports
 */

import { NextResponse } from 'next/server';
import { WiFiAnalytics } from '@/lib/wifi-manager';

// Dynamic: analytics reflects latest usage
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const report = await WiFiAnalytics.generateDailyReport();
    
    return NextResponse.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Failed to generate analytics report:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate analytics report',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Log WiFi connection event
    await WiFiAnalytics.logConnection({
      transactionId: data.transactionId,
      deviceInfo: data.deviceInfo,
      connectionTime: new Date(data.connectionTime),
      sessionDuration: data.sessionDuration
    });
    
    return NextResponse.json({
      success: true,
      message: 'WiFi usage logged successfully'
    });
  } catch (error) {
    console.error('Failed to log WiFi usage:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to log WiFi usage',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
