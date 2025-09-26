import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Deprecated endpoint: direct clients to tokens stream per token id
export async function GET() {
  return NextResponse.json(
    {
      error: 'Deprecated endpoint. Use /api/tokens/[id]/stream instead.',
      successor: '/api/tokens/[id]/stream',
    },
    {
      status: 410,
      headers: {
        Deprecation: 'true',
        Link: '</api/tokens/[id]/stream>; rel="successor-version"',
      },
    },
  );
}
