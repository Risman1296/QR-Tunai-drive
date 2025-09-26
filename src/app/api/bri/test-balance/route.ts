import { NextRequest, NextResponse } from "next/server"
import { buildBriSignature } from "@/utils/briSignature"
import { getBriAccessToken } from "@/utils/briToken"
import { randomUUID } from "crypto"

// Force static export untuk Cloudflare Pages
export const dynamic = 'force-static';
export const revalidate = 0;

type TokenAuth = "basic" | "form"
type SignatureFormat = "colon" | "payload"
type HeadersStyle = "x" | "bri"

interface TestBalanceBody {
  baseUrl: string
  clientId: string
  clientSecret: string
  apiSecret: string
  partnerId?: string
  accountNumber: string
  tokenPath?: string
  balancePath?: string
  tokenAuth?: TokenAuth
  signatureFormat?: SignatureFormat
  headersStyle?: HeadersStyle
  signatureEncoding?: 'base64' | 'hex'
  timestampSkewSeconds?: number
}

function clean(input: unknown): string | undefined {
  return typeof input === "string" ? input.trim() : undefined
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<TestBalanceBody>

    const baseUrl = clean(body.baseUrl)
    const clientId = clean(body.clientId)
    const clientSecret = clean(body.clientSecret)
    const apiSecret = clean(body.apiSecret)
    const partnerId = clean(body.partnerId) || clientId
    const accountNumber = clean(body.accountNumber)
    const tokenPath = clean(body.tokenPath) || "/oauth/client_credential/accesstoken"
    const balanceTemplate = clean(body.balancePath) || "/v2/inquiry/{accountNumber}"
    const tokenAuth: TokenAuth = body.tokenAuth === "form" ? "form" : "basic"
    const signatureFormat: SignatureFormat = body.signatureFormat === "payload" ? "payload" : "colon"
    const headersStyle: HeadersStyle = body.headersStyle === "bri" ? "bri" : "x"
    const skew = typeof body.timestampSkewSeconds === "number" ? body.timestampSkewSeconds : 0
    const signatureEncoding = body.signatureEncoding === 'hex' ? 'hex' : 'base64'

    if (!baseUrl) return NextResponse.json({ error: "baseUrl wajib diisi" }, { status: 400 })
    if (!clientId) return NextResponse.json({ error: "clientId wajib diisi" }, { status: 400 })
    if (!clientSecret) return NextResponse.json({ error: "clientSecret wajib diisi" }, { status: 400 })
    if (!apiSecret) return NextResponse.json({ error: "apiSecret (signature key) wajib diisi" }, { status: 400 })
    if (!accountNumber) return NextResponse.json({ error: "accountNumber wajib diisi" }, { status: 400 })

    // 1) Ambil access token
    let accessToken = ""
    try {
      accessToken = await getBriAccessToken({ baseUrl, clientId, clientSecret, tokenPath, authStyle: tokenAuth })
    } catch (err: any) {
      const msg = err?.message || "Gagal memperoleh access token"
      return NextResponse.json({ error: msg, stage: "oauth" }, { status: 400 })
    }

    // 2) Siapkan request saldo
    const balancePath = balanceTemplate.replace("{accountNumber}", encodeURIComponent(accountNumber))
    const timestamp = new Date(Date.now() + skew * 1000).toISOString()
    const { signature, canonicalPath, stringToSign } = buildBriSignature(apiSecret, {
      method: "GET",
      path: balancePath,
      timestamp,
      accessToken,
      mode: signatureFormat,
      encoding: signatureEncoding,
    })

    const url = new URL(canonicalPath, baseUrl.replace(/\/$/, ""))
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Partner-Id": partnerId!,
      "X-External-Id": randomUUID(),
    }
    if (headersStyle === "bri") {
      headers["BRI-Timestamp"] = timestamp
      headers["BRI-Signature"] = signature
    } else {
      headers["X-Timestamp"] = timestamp
      headers["X-Signature"] = signature
    }

    // 3) Panggil endpoint saldo
    const response = await fetch(url.toString(), { method: "GET", headers, cache: "no-store" })
    const text = await response.text().catch(() => "")
    const json = ((): any => { try { return text ? JSON.parse(text) : {} } catch { return { raw: text } } })()

    if (!response.ok) {
      return NextResponse.json({ error: json || text || "Gagal mengambil saldo", status: response.status }, { status: response.status })
    }

    // 4) Kembalikan data beserta informasi debug minimal
    return NextResponse.json({
      success: true,
      fetchedAt: new Date().toISOString(),
      request: {
        url: url.toString(),
        headersStyle,
        signatureFormat,
        signatureEncoding,
        tokenAuth,
        stringToSign,
      },
      data: json,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Kesalahan tidak terduga" }, { status: 500 })
  }
}
