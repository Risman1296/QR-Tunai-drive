import { createHash, createHmac } from "crypto"

export interface BriSignatureOptions {
  method: string
  path: string
  query?: string
  body?: string
  timestamp: string
  accessToken?: string
  // signature formatting mode:
  // - 'colon'   => METHOD:PATH_WITH_QUERY:ACCESS_TOKEN:SHA256(body):TIMESTAMP
  // - 'payload' => path=...&verb=...&token=Bearer <token>&timestamp=<ISO8601Z>&body=<raw>
  mode?: 'colon' | 'payload'
  // output encoding for HMAC result
  // - 'base64' (default)
  // - 'hex'    (some docs specify 64-char hex)
  encoding?: 'base64' | 'hex'
}

export interface BriSignatureResult {
  signature: string
  stringToSign: string
  hashedBody: string
  canonicalPath: string
}

function ensureLeadingSlash(input: string): string {
  if (!input.startsWith("/")) {
    return `/${input}`
  }
  return input
}

export function buildBriSignature(secretKey: string, options: BriSignatureOptions): BriSignatureResult {
  const method = options.method.trim().toUpperCase()
  const path = ensureLeadingSlash(options.path.trim())
  const query = options.query?.trim() ?? ""
  const canonicalPath = query ? `${path}?${query}` : path
  const bodyString = options.body ?? ""
  const hashedBody = bodyString
    ? createHash("sha256").update(bodyString, "utf8").digest("hex")
    : ""
  const accessToken = options.accessToken?.trim() ?? ""
  const timestamp = options.timestamp.trim()
  const mode = options.mode || 'colon'

  let stringToSign: string
  if (mode === 'payload') {
    // BRI documented payload-style signature: path excludes query params
    const pathForPayload = path
    const tokenField = accessToken ? `Bearer ${accessToken}` : ''
    const bodyField = bodyString || ''
    stringToSign = `path=${pathForPayload}&verb=${method}&token=${tokenField}&timestamp=${timestamp}&body=${bodyField}`
  } else {
    // Default colon-joined style
    stringToSign = [method, canonicalPath, accessToken, hashedBody, timestamp].join(":")
  }

  const encoding = options.encoding || 'base64'
  const signature = createHmac("sha256", secretKey).update(stringToSign, "utf8").digest(encoding)

  return { signature, stringToSign, hashedBody, canonicalPath }
}
