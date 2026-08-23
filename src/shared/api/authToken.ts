const TOKEN_KEY = 'ivelox_access_token'
const EXPIRES_KEY = 'ivelox_token_expires_at'

export function getAccessToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY)
  const expiresRaw = localStorage.getItem(EXPIRES_KEY)
  if (!token || !expiresRaw) return null
  const expiresAt = Number(expiresRaw)
  if (!Number.isFinite(expiresAt) || Date.now() >= expiresAt) {
    clearAuthStorage()
    return null
  }
  return token
}

export function persistAccessToken(token: string, expiresInSeconds: number) {
  const expiresAt = Date.now() + expiresInSeconds * 1000
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(EXPIRES_KEY, String(expiresAt))
}

export function clearAuthStorage() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EXPIRES_KEY)
}
