import { generateQrCode } from '@/ai/flows/qr-code-flow';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { baseUrl } = await req.json();
    if (!baseUrl) {
      return NextResponse.json(
        { error: 'baseUrl is required' },
        { status: 400 }
      );
    }

    const result = await generateQrCode({ baseUrl });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in QR code generation API route:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to generate QR code', details: errorMessage },
      { status: 500 }
    );
  }
}
