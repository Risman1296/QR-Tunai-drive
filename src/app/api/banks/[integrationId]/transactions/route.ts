
import { NextRequest, NextResponse } from "next/server";
import { fetchMutations } from "@/server/services/bankingService";
import { AccountIdSchema, MutationQuerySchema } from "@/server/contracts/banking";
import { resolveBankProvider } from "@/server/banks";

// Force static export untuk Cloudflare Pages
export const dynamic = 'force-static';
export const revalidate = 0;

export async function GET(req: NextRequest, context: { params: Promise<{ integrationId: string }> }) {
  try {
    const search = req.nextUrl.searchParams;
    const accountNumber = search.get("account")?.trim();
    const from = search.get("from")?.trim();
    const to = search.get("to")?.trim();
    const limit = search.get("limit")?.trim();
    const cursor = search.get("cursor")?.trim();
    if (!accountNumber) {
      return NextResponse.json({ error: "Query param 'account' is required" }, { status: 400 });
    }
    // Validate accountId
    const parsedAccount = AccountIdSchema.safeParse(accountNumber);
    if (!parsedAccount.success) {
      return NextResponse.json({ error: "Invalid account id" }, { status: 400 });
    }
    // Build and validate query
    const queryObj: any = { from, to };
    if (limit) queryObj.limit = Number(limit);
    if (cursor) queryObj.cursor = cursor;
    const parsedQuery = MutationQuerySchema.safeParse(queryObj);
    if (!parsedQuery.success) {
      return NextResponse.json({ error: parsedQuery.error.errors?.[0]?.message || "Invalid query" }, { status: 400 });
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
    const result = await fetchMutations(parsedAccount.data, parsedQuery.data, { bank });
    return NextResponse.json(result);
  } catch (error: any) {
    const message = typeof error?.message === 'string' ? error.message : 'Gagal mengambil data';
    return NextResponse.json({ error: { code: 'BANK_ERROR', message } }, { status: 502 });
  }
}
