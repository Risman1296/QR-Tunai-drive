import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import {
  addBankIntegration,
  updateBankIntegration,
  toggleBankIntegration,
  deleteBankIntegration,
  getPaymentConfiguration,
  type BankIntegration,
  type BankIntegrationProvider,
} from "@/lib/payment-config"

// Force static export untuk Cloudflare Pages
export const dynamic = 'force-static';
export const revalidate = 0;

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error("CRITICAL: JWT_SECRET environment variable is not set or too short!")
  throw new Error("JWT_SECRET must be set and at least 32 characters long")
}

interface UserPayload {
  userId: string
  username?: string
  contactNumber?: string
  role: string
  name: string
  userType: "admin" | "employee"
}

class HttpError extends Error {
  constructor(readonly status: number, message: string) {
    super(message)
    this.name = "HttpError"
  }
}

function sanitizeText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  return value.trim().replace(/[<>"']/g, "") || undefined
}

async function requireOwner(request: NextRequest): Promise<UserPayload> {
  const token = request.cookies.get("auth-token")?.value
  if (!token) {
    throw new HttpError(401, "Tidak diizinkan")
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as UserPayload
    if (decoded.role !== "Owner") {
      throw new HttpError(403, "Akses ditolak - hanya Owner yang dapat mengatur integrasi bank")
    }
    return decoded
  } catch (err) {
    if (err instanceof HttpError) throw err
    console.error("JWT verification for integrations failed:", err)
    throw new HttpError(401, "Token tidak valid atau telah expired")
  }
}

function parseProvider(value: unknown): BankIntegrationProvider {
  if (value === "bca_snap_qris") return "bca_snap_qris"
  if (value === "bri_realtime") return "bri_realtime"
  return "custom"
}

function buildCredentials(input: Record<string, unknown>) {
  const baseUrl = typeof input.baseUrl === "string" ? input.baseUrl.trim() : ""
  if (!baseUrl) {
    throw new HttpError(400, "Base URL API harus diisi")
  }

  return {
    baseUrl,
    clientId: sanitizeText(input.clientId),
    clientSecret: sanitizeText(input.clientSecret),
    apiSecret: sanitizeText(input.apiSecret),
    channelId: sanitizeText(input.channelId),
    partnerId: sanitizeText(input.partnerId),
    qrisPath: sanitizeText(input.qrisPath),
    tokenPath: sanitizeText(input.tokenPath),
    balancePath: sanitizeText(input.balancePath),
    transactionsPath: sanitizeText(input.transactionsPath),
    additional: typeof input.additional === "object" ? (input.additional as Record<string, unknown>) : undefined,
  }
}

function normalizeMetadata(input: unknown): Record<string, unknown> | undefined {
  if (input && typeof input === "object" && !Array.isArray(input)) {
    return input as Record<string, unknown>
  }
  return undefined
}

export async function GET(request: NextRequest) {
  try {
    await requireOwner(request)
    const config = getPaymentConfiguration()
    return NextResponse.json({ integrations: config.bankIntegrations })
  } catch (error: any) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error("[Integrations][GET] Unexpected error", error)
    return NextResponse.json({ error: "Gagal mengambil daftar integrasi" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireOwner(request)
    const body = await request.json()

    const bankName = sanitizeText(body.bankName)
    const bankCode = sanitizeText(body.bankCode)
    const description = sanitizeText(body.description)
    const provider = parseProvider(body.provider)
    if (!bankName) throw new HttpError(400, "Nama bank harus diisi")
    if (!bankCode) throw new HttpError(400, "Kode bank harus diisi")

    const credentials = buildCredentials(body.credentials ?? body)

    const integration = addBankIntegration({
      bankName,
      bankCode,
      provider,
      description,
      isActive: body.isActive !== false,
      credentials,
      metadata: normalizeMetadata(body.metadata),
    })

    return NextResponse.json(
      {
        success: true,
        message: "Integrasi bank berhasil ditambahkan",
        integration,
      },
      { status: 201 }
    )
  } catch (error: any) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Format JSON tidak valid" }, { status: 400 })
    }
    console.error("[Integrations][POST] Unexpected error", error)
    return NextResponse.json({ error: "Gagal menambahkan integrasi bank" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireOwner(request)
    const body = await request.json()
    const action = body.action as string | undefined
    const id = sanitizeText(body.id)
    if (!id) throw new HttpError(400, "ID integrasi diperlukan")

    if (action === "toggle") {
      const isActive = Boolean(body.isActive)
      const success = toggleBankIntegration(id, isActive)
      if (!success) throw new HttpError(404, "Integrasi tidak ditemukan")
      return NextResponse.json({ success: true, message: `Integrasi ${isActive ? "diaktifkan" : "dinonaktifkan"}` })
    }

    if (action === "update") {
      const updates: Partial<BankIntegration> = {}
      if (body.bankName) updates.bankName = sanitizeText(body.bankName) ?? undefined
      if (body.bankCode) updates.bankCode = sanitizeText(body.bankCode) ?? undefined
      if (body.description !== undefined) updates.description = sanitizeText(body.description)
      if (body.provider) updates.provider = parseProvider(body.provider)
      if (body.metadata) updates.metadata = normalizeMetadata(body.metadata)
      if (body.credentials) {
        updates.credentials = buildCredentials(body.credentials)
      }
      if (body.isActive !== undefined) {
        updates.isActive = Boolean(body.isActive)
      }

      const success = updateBankIntegration(id, updates)
      if (!success) throw new HttpError(404, "Integrasi tidak ditemukan")
      return NextResponse.json({ success: true, message: "Integrasi bank berhasil diperbarui" })
    }

    throw new HttpError(400, "Aksi tidak dikenali")
  } catch (error: any) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Format JSON tidak valid" }, { status: 400 })
    }
    console.error("[Integrations][PUT] Unexpected error", error)
    return NextResponse.json({ error: "Gagal memperbarui integrasi" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireOwner(request)
    const body = await request.json()
    const id = sanitizeText(body.id)
    if (!id) throw new HttpError(400, "ID integrasi diperlukan")

    const success = deleteBankIntegration(id)
    if (!success) throw new HttpError(404, "Integrasi tidak ditemukan")

    return NextResponse.json({ success: true, message: "Integrasi bank berhasil dihapus" })
  } catch (error: any) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Format JSON tidak valid" }, { status: 400 })
    }
    console.error("[Integrations][DELETE] Unexpected error", error)
    return NextResponse.json({ error: "Gagal menghapus integrasi" }, { status: 500 })
  }
}
