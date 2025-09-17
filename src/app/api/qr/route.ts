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
    const host = request.headers.get('host') || 'localhost:3001';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    
    // Check if request comes from localhost/127.0.0.1, then use network IP for mobile access
    let baseHost = host;
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      // Extract port from host
      const port = host.split(':')[1] || '3001';
      // Use environment variable or default network IP
      const networkIp = process.env.NETWORK_IP || '0.0.0.0';
      if (networkIp !== '0.0.0.0') {
        baseHost = `${networkIp}:${port}`;
      }
    }
    
    const fullUrl = `${protocol}://${baseHost}${transactionUrl}`;
    
    console.log('Generated QR URL:', fullUrl); // Debug log
    
    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(fullUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Ensure consistent naming with client expectations
    return NextResponse.json({
      id: tokenId,
      token,
      transactionUrl,
      qrCodeDataUrl, // This is what we return for the QR code
      expiresIn: ttlSeconds,
      expiresAt
    });
  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}
