import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { broadcastSseEvent } from "@/lib/sse"


// Force static export untuk Cloudflare Pages
export const dynamic = 'force-static';
export const revalidate = 0;

const WEBHOOK_PATH = "/api/bca/webhook"

function hashBody(body: string): string {
  return crypto.createHash("sha256").update(body).digest("hex")
}

function verifySignature(secret: string, req: NextRequest, rawBody: string): boolean {
  const timestamp = req.headers.get("x-timestamp") ?? ""
  const signature = req.headers.get("x-signature") ?? ""
  if (!timestamp || !signature) return false

  const bodyHash = hashBody(rawBody)
  const stringToSign = ["POST", WEBHOOK_PATH, bodyHash, timestamp].join(":")
  const expected = crypto.createHmac("sha256", secret).update(stringToSign).digest("hex")
  return expected === signature
}

export async function POST(req: NextRequest) {
  const secret = process.env.BCA_API_SECRET
  if (!secret) {
    console.error("[BCA][Webhook] Missing BCA_API_SECRET env")
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
  }

  const rawBody = await req.text()
  try {
    if (!verifySignature(secret, req, rawBody)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(rawBody)

    await broadcastSseEvent({ source: "bca", event })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("[BCA][Webhook] Error", error)
    return NextResponse.json({ error: error?.message ?? "Internal error" }, { status: 500 })
  }
}
