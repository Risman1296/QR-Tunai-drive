import { NextRequest, NextResponse } from "next/server"
import { buildBcaSignature } from "@/utils/bcaSignature"
import { assertBcaEnv, getBcaAccessToken } from "@/utils/bcaToken"


// Force static export untuk Cloudflare Pages
export const dynamic = 'force-static';
export const revalidate = 0;

type CreateQrisRequest = {
  amount: number | string
  merchantId: string
  storeId?: string
  terminalId?: string
  additionalInfo?: Record<string, any>
}

function toFixedAmount(value: number | string): string {
  const numeric = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(numeric)) {
    throw new Error("Invalid amount value")
  }
  return numeric.toFixed(2)
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<CreateQrisRequest>
    if (!body?.amount) {
      return NextResponse.json({ error: "amount is required" }, { status: 400 })
    }
    if (!body?.merchantId) {
      return NextResponse.json({ error: "merchantId is required" }, { status: 400 })
    }

    const env = assertBcaEnv()
    const accessToken = await getBcaAccessToken(env.baseUrl, env.clientId, env.clientSecret)

    const partnerReferenceNo = `QRT-${Date.now()}`
    const payload = {
      partnerReferenceNo,
      amount: {
        value: toFixedAmount(body.amount),
        currency: "IDR",
      },
      merchantId: body.merchantId,
      storeId: body.storeId ?? "STORE001",
      terminalId: body.terminalId ?? "TERM001",
      additionalInfo: {
        channel: "QRTUNAI-APP",
        ...body.additionalInfo,
      },
    }

    const jsonBody = JSON.stringify(payload)
    const timestamp = new Date().toISOString()
    const { signature } = buildBcaSignature(env.apiSecret, {
      method: "POST",
      relativeUrl: env.qrisPath,
      accessToken,
      timestampISO: timestamp,
      bodyString: jsonBody,
    })

    const response = await fetch(`${env.baseUrl.replace(/\/$/, "")}${env.qrisPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "X-PARTNER-ID": env.clientId,
        "X-TIMESTAMP": timestamp,
        "CHANNEL-ID": env.channelId,
        "X-SIGNATURE": signature,
      },
      body: jsonBody,
      cache: "no-store",
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      return NextResponse.json({ error: data || "Failed to create QR" }, { status: response.status })
    }

    return NextResponse.json({ partnerReferenceNo, qris: data })
  } catch (error: any) {
    console.error("[BCA][QRIS] POST error", error)
    return NextResponse.json({ error: error?.message ?? "Internal error" }, { status: 500 })
  }
}
