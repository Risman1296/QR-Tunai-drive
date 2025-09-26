
import { NextRequest, NextResponse } from "next/server";
import { fetchBalance } from "@/server/services/bankingService";
import { AccountIdSchema } from "@/server/contracts/banking";
import { resolveBankProvider } from "@/server/banks";

// This endpoint is dynamic (calls provider per request)
export const dynamic = 'force-static';
export const revalidate = 0;

export async function GET(req: NextRequest, context: { params: Promise<{ integrationId: string }> }) {
  try {
    const search = req.nextUrl.searchParams;
    const accountNumber = search.get("account")?.trim();
    if (!accountNumber) {
      return NextResponse.json({ error: "Query param 'account' is required" }, { status: 400 });
    }
    // Validate accountId
    const parsed = AccountIdSchema.safeParse(accountNumber);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid account id" }, { status: 400 });
    }
    const { integrationId } = await context.params;
    const bank = integrationId.toLowerCase();

    // Ensure provider is configured
    const provider = resolveBankProvider(bank);
    if (!provider) {
      return NextResponse.json(
        { error: { code: 'PROVIDER_NOT_CONFIGURED', message: `Bank provider '${bank}' is not configured` } },
        { status: 404 },
      );
    }

    // Call orchestrator service
    const result = await fetchBalance(parsed.data, { bank });
    return NextResponse.json(result);
  } catch (error: any) {
    // Sanitize error shape
    const message = typeof error?.message === 'string' ? error.message : 'Gagal mengambil saldo';
    return NextResponse.json({ error: { code: 'BANK_ERROR', message } }, { status: 502 });
  }
}
