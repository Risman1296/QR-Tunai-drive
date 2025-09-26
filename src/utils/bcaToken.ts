import { env } from 'process'

export class BcaOAuthError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message)
    this.name = 'BcaOAuthError'
  }
}

export interface GetBcaTokenOptions {
  baseUrl: string
  clientId: string
  clientSecret: string
}

export interface BcaTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope?: string
}

export async function getBcaAccessToken(baseUrl: string, clientId: string, clientSecret: string): Promise<string> {
  const oauthUrl = `${baseUrl.replace(/\/$/, '')}/api/oauth/token`
  const res = await fetch(oauthUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  })

  const json = (await res.json().catch(() => ({}))) as Partial<BcaTokenResponse> & { error_description?: string }

  if (!res.ok) {
    throw new BcaOAuthError(json?.error_description || `OAuth failed with status ${res.status}`, res.status)
  }

  const token = json?.access_token
  if (!token) {
    throw new BcaOAuthError('OAuth response missing access_token field', res.status)
  }

  return token
}

export function assertBcaEnv(): {
  clientId: string
  clientSecret: string
  apiSecret: string
  baseUrl: string
  channelId: string
  qrisPath: string
  appOrigin: string
} {
  const {
    BCA_CLIENT_ID,
    BCA_CLIENT_SECRET,
    BCA_API_SECRET,
    BCA_BASE_URL,
    BCA_CHANNEL_ID,
    BCA_QRIS_PATH,
    APP_ORIGIN,
  } = env

  if (!BCA_CLIENT_ID) throw new Error('BCA_CLIENT_ID env is required')
  if (!BCA_CLIENT_SECRET) throw new Error('BCA_CLIENT_SECRET env is required')
  if (!BCA_API_SECRET) throw new Error('BCA_API_SECRET env is required')
  if (!BCA_BASE_URL) throw new Error('BCA_BASE_URL env is required')
  if (!BCA_CHANNEL_ID) throw new Error('BCA_CHANNEL_ID env is required')
  if (!BCA_QRIS_PATH) throw new Error('BCA_QRIS_PATH env is required')

  return {
    clientId: BCA_CLIENT_ID,
    clientSecret: BCA_CLIENT_SECRET,
    apiSecret: BCA_API_SECRET,
    baseUrl: BCA_BASE_URL,
    channelId: BCA_CHANNEL_ID,
    qrisPath: BCA_QRIS_PATH,
    appOrigin: APP_ORIGIN || 'http://localhost:3000',
  }
}
