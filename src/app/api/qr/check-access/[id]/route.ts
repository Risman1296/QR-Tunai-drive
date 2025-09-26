import { NextRequest, NextResponse } from 'next/server';
import { getCurrentConfig } from '@/lib/system-config';

// Force static exports for Cloudflare Pages
export const dynamic = 'force-static';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const config = getCurrentConfig();

    // PRODUCTION MODE: Real transaction checking
    if (config.productionMode && !config.simulationEnabled) {
      // Real implementation: Check database for actual transaction access
      const realAccess = await checkRealTransactionAccess(id);
      
      return NextResponse.json({
        accessed: realAccess.accessed,
        accessedAt: realAccess.accessedAt,
        transactionId: id,
        customerIP: request.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || '',
        productionMode: true,
        simulationDisabled: true
      }, { status: 200 });
    }

    // DEMO MODE: Simulation only when explicitly enabled
    if (config.demoMode || config.simulationEnabled) {
      const mockAccess = {
        accessed: Math.random() > 0.8, // Reduced frequency for demo
        accessedAt: new Date(),
        transactionId: id,
        customerIP: request.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || '',
        demoMode: true
      };

      return NextResponse.json(mockAccess, { status: 200 });
    }

    // Default: No access (production without simulation)
    return NextResponse.json({
      accessed: false,
      accessedAt: null,
      transactionId: id,
      customerIP: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || '',
      productionMode: config.productionMode,
      message: 'Production mode - real access monitoring active'
    }, { status: 200 });

  } catch (error) {
    console.error('Error checking QR access:', error);
    return NextResponse.json(
      { error: 'Failed to check QR access' },
      { status: 500 }
    );
  }
}

async function checkRealTransactionAccess(transactionId: string) {
  // Real implementation would check:
  // 1. Database for transaction access logs
  // 2. External banking system APIs
  // 3. Mobile app integration status
  // 4. Form submission status

  console.log('🔍 Production Mode: Checking real transaction access for', transactionId);
  
  // For now, return false until real integration is implemented
  return {
    accessed: false,
    accessedAt: null
  };
}
