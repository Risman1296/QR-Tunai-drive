import crypto from "crypto"

export type BcaHttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

export interface BuildBcaSignatureArgs {
  method: BcaHttpMethod
  relativeUrl: string
  accessToken: string
  timestampISO: string
  bodyString?: string
}

export interface BcaSignatureResult {
  signature: string
  stringToSign: string
  bodyHash: string
}

function normalizeRelativeUrl(url: string): string {
  if (!url) throw new Error("relativeUrl is required for BCA signature generation")
  return url.startsWith("/") ? url : "/" + url
}

export function hashRequestBody(body: string | undefined | null): string {
  const payload = body ?? ""
  return crypto.createHash("sha256").update(payload).digest("hex").toLowerCase()
}

export function buildBcaSignature(apiSecret: string, args: BuildBcaSignatureArgs): BcaSignatureResult {
  if (!apiSecret) throw new Error("BCA API secret is missing")
  const method = args.method.toUpperCase() as BcaHttpMethod
  const relativeUrl = normalizeRelativeUrl(args.relativeUrl)
  const accessToken = args.accessToken ?? ""
  const timestampISO = args.timestampISO
  if (!timestampISO) throw new Error("timestampISO is required for BCA signature generation")

  const bodyHash = hashRequestBody(args.bodyString ?? "")
  const stringToSign = [method, relativeUrl, accessToken, bodyHash, timestampISO].join(":")
  const signature = crypto.createHmac("sha256", apiSecret).update(stringToSign).digest("hex")

  return { signature, stringToSign, bodyHash }
}
