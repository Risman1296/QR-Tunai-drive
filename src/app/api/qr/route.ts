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
    const fullUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${transactionUrl}`;
    
    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(fullUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return NextResponse.json({
      id: tokenId,
      token,
      transactionUrl,
      qrCodeDataUrl,
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
