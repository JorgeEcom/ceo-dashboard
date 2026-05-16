// PKCE helpers for GHL OAuth flow
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export interface GHLTokens {
  access_token: string
  refresh_token: string
  expires_at: number
  location_id: string
}

export function saveTokens(tokens: GHLTokens): void {
  localStorage.setItem('ghl_tokens', JSON.stringify(tokens))
  localStorage.setItem('ghl_api_key', tokens.access_token)
  localStorage.setItem('ghl_location_id', tokens.location_id)
}

export function loadTokens(): GHLTokens | null {
  const raw = localStorage.getItem('ghl_tokens')
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function isTokenExpired(tokens: GHLTokens): boolean {
  return Date.now() > tokens.expires_at - 60000
}

export function clearTokens(): void {
  localStorage.removeItem('ghl_tokens')
  localStorage.removeItem('ghl_api_key')
  localStorage.removeItem('ghl_location_id')
}

export const GHL_OAUTH = {
  authUrl: 'https://marketplace.leadconnectorhq.com/oauth/chooselocation',
  tokenUrl: 'https://services.leadconnectorhq.com/oauth/token',
  clientId: localStorage.getItem('ghl_client_id') || '',
  redirectUri: window.location.origin + '/oauth/callback',
  scopes: 'contacts.readonly opportunities.readonly opportunities.write pipelines.readonly',
}
