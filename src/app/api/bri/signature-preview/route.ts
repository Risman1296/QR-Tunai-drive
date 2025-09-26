import { NextRequest, NextResponse } from "next/server"
import { buildBriSignature } from "@/utils/briSignature"
import { getBriAccessToken } from "@/utils/briToken"

// Force static export untuk Cloudflare Pages
export const dynamic = 'force-static';
export const revalidate = 0;

type TokenAuth = "basic" | "form"
type SignatureFormat = "colon" | "payload"
type HeadersStyle = "x" | "bri"

interface SignaturePreviewBody {
  // OAuth (opsional bila accessToken langsung diberikan)
  baseUrl?: string
  clientId?: string
  clientSecret?: string
  tokenPath?: string
  tokenAuth?: TokenAuth

  // Signature
  apiSecret?: string
  signatureFormat?: SignatureFormat
  headersStyle?: HeadersStyle
  signatureEncoding?: 'base64' | 'hex'
  timestampSkewSeconds?: number

  // Path
  balancePath?: string
  accountNumber?: string

  // Alternatif: langsung kirim accessToken
  accessToken?: string
}

function clean(input: unknown): string | undefined {
  return typeof input === "string" ? input.trim() : undefined
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<SignaturePreviewBody>

    const apiSecret = clean(body.apiSecret)
    if (!apiSecret) return NextResponse.json({ error: "apiSecret (Signature Key) wajib diisi" }, { status: 400 })

    const signatureFormat: SignatureFormat = body.signatureFormat === "payload" ? "payload" : "colon"
    const headersStyle: HeadersStyle = body.headersStyle === "bri" ? "bri" : "x"
    const signatureEncoding = body.signatureEncoding === 'hex' ? 'hex' : 'base64'
    const skew = typeof body.timestampSkewSeconds === "number" ? body.timestampSkewSeconds : 0

    // Build path dari template
    const balanceTemplate = clean(body.balancePath) || "/v2/accounts/{accountNumber}/balance"
    const accountNumber = clean(body.accountNumber)
    if (!accountNumber) return NextResponse.json({ error: "accountNumber wajib diisi" }, { status: 400 })
    const path = balanceTemplate.replace("{accountNumber}", encodeURIComponent(accountNumber))

    // Ambil token bila tidak disediakan
    let accessToken = clean(body.accessToken)
    if (!accessToken) {
      const baseUrl = clean(body.baseUrl)
      const clientId = clean(body.clientId)
      const clientSecret = clean(body.clientSecret)
      const tokenPath = clean(body.tokenPath) || "/oauth/client_credential/accesstoken"
      const tokenAuth: TokenAuth = body.tokenAuth === "form" ? "form" : "basic"
      if (!baseUrl || !clientId || !clientSecret) {
        return NextResponse.json({ error: "accessToken tidak ada. Isi baseUrl, clientId, clientSecret untuk ambil token atau kirim accessToken langsung." }, { status: 400 })
      }
      try {
        accessToken = await getBriAccessToken({ baseUrl, clientId, clientSecret, tokenPath, authStyle: tokenAuth })
      } catch (err: any) {
        return NextResponse.json({ error: err?.message || "Gagal memperoleh access token" }, { status: 400 })
      }
    }

    const timestamp = new Date(Date.now() + skew * 1000).toISOString()
    const { signature, canonicalPath, stringToSign, hashedBody } = buildBriSignature(apiSecret, {
      method: "GET",
      path,
      timestamp,
      accessToken,
      mode: signatureFormat,
      encoding: signatureEncoding,
    })

    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),
      result: {
        signature,
        stringToSign,
        hashedBody,
        timestamp,
        canonicalPath,
        signatureFormat,
        headersStyle,
        signatureEncoding,
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Kesalahan tidak terduga" }, { status: 500 })
  }
}
