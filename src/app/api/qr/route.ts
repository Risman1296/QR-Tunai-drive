import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
  try {
    // Generate unique token for QR
    const tokenId = crypto.randomUUID();
    const timestamp = Date.now();
    const ttlSeconds = 120; // 2 minutes
    const expiresAt = timestamp + (ttlSeconds * 1000);
    
    // Create HMAC token
    const secret = process.env.JWT_SECRET || 'default-secret-change-me';
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${tokenId}:${expiresAt}`);
    const signature = hmac.digest('hex');
    
    const token = `${tokenId}:${expiresAt}:${signature}`;
    const transactionUrl = `/t/${tokenId}/form`;
    
    // Dynamically construct base URL from request headers to ensure same port
    const host = request.headers.get('host') || 'localhost:4000';
    const protocol = request.headers.get('x-forwarded-proto') || 
                    (request.headers.get('x-forwarded-port') === '443' ? 'https' : 'http') ||
                    (process.env.NODE_ENV === 'production' ? 'http' : 'http');
    
    // Check if request comes from localhost/127.0.0.1, then use network IP for mobile access
    let baseHost = host;
    
    // For production, use the configured domain
    if (process.env.NODE_ENV === 'production') {
      // Use the production domain from environment variables
      const productionUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL;
      if (productionUrl) {
        const prodUrl = new URL(productionUrl);
        baseHost = prodUrl.host;
      } else {
        // Fallback to current host if no production URL is set
        baseHost = host;
      }
    } else if (host.includes('localhost') || host.includes('127.0.0.1')) {
      // Extract port from host
      const port = host.split(':')[1] || '4000';
      // Use environment variable or keep localhost for development
      const networkIp = process.env.NETWORK_IP;
      if (networkIp && networkIp !== '0.0.0.0') {
        baseHost = `${networkIp}:${port}`;
      }
    }
    
    const fullUrl = `${protocol}://${baseHost}${transactionUrl}`;
    
    // Enhanced debug logging
    console.log('=== QR Code Generation Debug ===');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Request Host:', host);
    console.log('Request Protocol:', protocol);
    console.log('Network IP:', process.env.NETWORK_IP);
    console.log('Production URL:', process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL);
    console.log('Constructed Base Host:', baseHost);
    console.log('Final QR URL:', fullUrl);
    console.log('================================');
    
    // Generate QR code with error handling
    let qrCodeDataUrl;
    try {
      qrCodeDataUrl = await QRCode.toDataURL(fullUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      
      console.log('QR Code generated successfully, size:', qrCodeDataUrl.length, 'characters');
      
      // Validate QR code data
      if (!qrCodeDataUrl.startsWith('data:image/png;base64,')) {
        throw new Error('Invalid QR code format generated');
      }
      
    } catch (qrError) {
      console.error('QR Code generation failed:', qrError);
      throw new Error(`QR code generation failed: ${qrError instanceof Error ? qrError.message : 'Unknown QR error'}`);
    }
    
    // Ensure consistent naming with client expectations
    return NextResponse.json({
      id: tokenId,
      token,
      transactionUrl,
      qrCodeDataUrl, // This is what we return for the QR code
      expiresIn: ttlSeconds,
      expiresAt,
      debugInfo: {
        generatedUrl: fullUrl,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      }
    });
  } catch (error) {
    console.error('=== QR Generation Error ===');
    console.error('Error details:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('========================');
    
    return NextResponse.json(
      { 
        error: 'Failed to generate QR code',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
