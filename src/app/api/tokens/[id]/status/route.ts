import { NextRequest, NextResponse } from 'next/server';
import { qrTokenStore } from '@/server/qrTokenStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = qrTokenStore.getToken(id);
  if (!token) {
    return NextResponse.json({ error: 'Token not found' }, { status: 404 });
  }
  const now = Date.now();
  let status: 'pending' | 'consumed' | 'expired' = 'pending';
  if (now > token.expiresAt) status = 'expired';
  else if (token.isConsumed) status = 'consumed';

  return NextResponse.json({
    id,
    status,
    expiresAt: token.expiresAt,
    consumedAt: token.consumedAt ?? null,
    viewedAt: token.viewedAt ?? null,
  });
}

