/**
 * Connection Test API
 * Tests customer internet connection quality
 */

import { NextResponse } from 'next/server';

// Force static export untuk Cloudflare Pages
export const dynamic = 'force-static';
export const revalidate = 0;

export async function GET() {
  try {
    // Return a simple response for connection testing
    // The response time will be measured by the client
    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        message: 'Connection test successful',
        serverTime: Date.now()
      },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Connection test failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}