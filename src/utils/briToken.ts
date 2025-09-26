export interface GetBriTokenOptions {
  baseUrl: string
  clientId: string
  clientSecret: string
  tokenPath?: string
  // token auth style:
  // - 'basic' (default): Authorization: Basic base64(clientId:clientSecret), body grant_type only
  // - 'form': body includes client_id & client_secret
  authStyle?: 'basic' | 'form'
}

export interface BriTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export class BriOAuthError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message)
    this.name = "BriOAuthError"
  }
}

export async function getBriAccessToken({
  baseUrl,
  clientId,
  clientSecret,
  tokenPath = "/oauth/client_credential/accesstoken",
  authStyle = 'basic',
}: GetBriTokenOptions): Promise<string> {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "")
  const url = new URL(tokenPath, normalizedBaseUrl)
  if (!url.searchParams.has("grant_type")) {
    url.searchParams.set("grant_type", "client_credentials")
  }

  let headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  }
  let body = "grant_type=client_credentials"
  if (authStyle === 'basic') {
    headers.Authorization = "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
  } else {
    const params = new URLSearchParams()
    params.set("client_id", clientId)
    params.set("client_secret", clientSecret)
    params.set("grant_type", "client_credentials")
    body = params.toString()
  }

  const response = await fetch(url.toString(), {
    method: "POST",
    headers,
    body,
    cache: "no-store",
  })

  const cloned = response.clone()
  const rawText = await cloned.text().catch(() => "")
  const contentType = response.headers.get("content-type") || ""
  const finalUrl = (response as any)?.url || url.toString()
  const redirected = (response as any)?.redirected ? true : false
  const payload = ((): any => {
    try {
      return rawText ? JSON.parse(rawText) : {}
    } catch {
      return {}
    }
  })() as Partial<BriTokenResponse> & {
    error?: string
    error_description?: string
  }

  if (!response.ok) {
    const htmlHint = contentType.includes("text/html")
    const detail = payload.error_description || payload.error || `OAuth failed with status ${response.status}`
    const extra = htmlHint
      ? `; looks like HTML from ${finalUrl}${redirected ? " (redirected)" : ""}. Check baseUrl/tokenPath and network (WAF/captive portal).`
      : ""
    throw new BriOAuthError(detail + extra, response.status)
  }

  const token = (payload as any).access_token || (payload as any).accessToken || (payload as any).token || (payload as any)?.data?.access_token
  if (!token) {
    const snippet = (rawText || "").slice(0, 200)
    const htmlHint = contentType.includes("text/html")
    const extra = htmlHint
      ? `; got HTML from ${finalUrl}${redirected ? " (redirected)" : ""}. This usually means wrong baseUrl/tokenPath or a captive portal/WAF.`
      : ""
    throw new BriOAuthError(
      `OAuth response missing access_token field${snippet ? `; body: ${snippet}` : ""}${extra}`,
      response.status
    )
  }

  return token
}

export function assertBriEnv(): {
  baseUrl: string
  clientId: string
  clientSecret: string
  apiSecret: string
  partnerId: string
  tokenPath: string
  balancePath: string
  transactionsPath: string
} {
  const {
    BRI_BASE_URL,
    BRI_CLIENT_ID,
    BRI_CLIENT_SECRET,
    BRI_API_SECRET,
    BRI_PARTNER_ID,
    BRI_TOKEN_PATH,
    BRI_BALANCE_PATH,
    BRI_TRANSACTIONS_PATH,
  } = process.env

  if (!BRI_BASE_URL) throw new Error("BRI_BASE_URL env is required")
  if (!BRI_CLIENT_ID) throw new Error("BRI_CLIENT_ID env is required")
  if (!BRI_CLIENT_SECRET) throw new Error("BRI_CLIENT_SECRET env is required")
  if (!BRI_API_SECRET) throw new Error("BRI_API_SECRET env is required")

  return {
    baseUrl: BRI_BASE_URL,
    clientId: BRI_CLIENT_ID,
    clientSecret: BRI_CLIENT_SECRET,
    apiSecret: BRI_API_SECRET,
    partnerId: BRI_PARTNER_ID || BRI_CLIENT_ID,
    tokenPath: BRI_TOKEN_PATH || "/oauth/client_credential/accesstoken",
    balancePath: BRI_BALANCE_PATH || "/v2/accounts/{accountNumber}/balance",
    transactionsPath: BRI_TRANSACTIONS_PATH || "/v2/accounts/{accountNumber}/transactions",
  }
}
