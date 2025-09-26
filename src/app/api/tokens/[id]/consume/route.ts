// POST /api/tokens/[id]/consume - consume QR token (idempotent)
import { NextRequest, NextResponse } from 'next/server';
import { qrTokenStore } from '@/server/qrTokenStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = qrTokenStore.consumeToken(id);

  if (!result.success) {
    const { statusCode, reason } = mapConsumeError(result.error);
    return NextResponse.json({ success: false, reason }, { status: statusCode });
  }

  return NextResponse.json({ success: true });
}

function mapConsumeError(error?: string): { statusCode: number; reason: 'not_found' | 'already_used' | 'expired' } {
  if (error === 'Token already consumed') {
    return { statusCode: 410, reason: 'already_used' };
  }

  if (error === 'Token not found or expired') {
    return { statusCode: 404, reason: 'not_found' };
  }

  // Fallback to expired for unexpected errors
  return { statusCode: 410, reason: 'expired' };
}

