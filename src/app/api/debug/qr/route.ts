import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get request info
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const userAgent = request.headers.get('user-agent');
    
    // Get environment info
    const nodeEnv = process.env.NODE_ENV;
    const networkIp = process.env.NETWORK_IP;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const jwtSecret = process.env.JWT_SECRET;
    const port = process.env.PORT;
    
    // Construct URLs
    let constructedBaseHost = host;
    let finalProtocol = protocol;
    
    if (process.env.NODE_ENV === 'production') {
      finalProtocol = 'https';
      const productionUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL;
      if (productionUrl) {
        const prodUrl = new URL(productionUrl);
        constructedBaseHost = prodUrl.host;
      }
    } else if (host && (host.includes('localhost') || host.includes('127.0.0.1'))) {
      const portFromHost = host.split(':')[1] || '3001';
      if (networkIp && networkIp !== '0.0.0.0') {
        constructedBaseHost = `${networkIp}:${portFromHost}`;
      }
    }
    
    const sampleUrl = `${finalProtocol}://${constructedBaseHost}/t/sample-id/form`;
    
    return NextResponse.json({
      debug: true,
      timestamp: new Date().toISOString(),
      request: {
        host: host,
        protocol: protocol,
        userAgent: userAgent?.substring(0, 100) + '...',
        url: request.url
      },
      environment: {
        NODE_ENV: nodeEnv,
        NETWORK_IP: networkIp,
        NEXT_PUBLIC_BASE_URL: baseUrl,
        NEXT_PUBLIC_APP_URL: appUrl,
        JWT_SECRET: jwtSecret ? '***SET***' : 'NOT_SET',
        PORT: port
      },
      qr_construction: {
        original_host: host,
        original_protocol: protocol,
        constructed_host: constructedBaseHost,
        final_protocol: finalProtocol,
        sample_qr_url: sampleUrl
      },
      system: {
        platform: process.platform,
        node_version: process.version,
        memory: process.memoryUsage()
      }
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      error: 'Debug failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}