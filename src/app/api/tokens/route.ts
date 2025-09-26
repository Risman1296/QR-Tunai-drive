// POST /api/tokens - Create new QR token
import { NextRequest, NextResponse } from 'next/server';
import { qrTokenStore } from '@/server/qrTokenStore';
import QRCode from 'qrcode';

// Force dynamic for token security
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { amount, description, ttlSeconds = 60, metadata } = await request.json();

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be provided and greater than 0' },
        { status: 400 }
      );
    }

    // Generate unique token ID
    const tokenId = `qr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Create token in store
    const token = qrTokenStore.createToken(tokenId, ttlSeconds, {
      amount,
      description: description || 'Drive-Thru Payment',
      ...metadata,
    });

    // Generate QR code URL
    const qrUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/t/${tokenId}`;
    
    // Generate QR code image
    const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });

    console.log(`✅ QR Token created: ${tokenId}, TTL: ${ttlSeconds}s, Amount: ${amount}`);

    return NextResponse.json({
      success: true,
      id: tokenId,
      qrCodeDataUrl,
      qrUrl,
      amount,
      description: description || 'Drive-Thru Payment',
      expiresAt: token.expiresAt,
      expiresIn: ttlSeconds,
    });

  } catch (error) {
    console.error('❌ Token creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create token' },
      { status: 500 }
    );
  }
}
