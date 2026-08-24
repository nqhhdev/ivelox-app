import { clearAuthStorage, getAccessToken } from '@/shared/api/authToken'

const API_URL = import.meta.env.VITE_API_URL as string

/** Paths that must never send Authorization (avoids leaking JWT on public calls). */
function isPublicPath(path: string): boolean {
  return (
    path === '/api/v1/health' ||
    path === '/api/v1/features' ||
    path.startsWith('/api/v1/auth/otp/')
  )
}

function buildHeaders(path: string, hasBody: boolean, extra?: HeadersInit): Headers {
  const headers = new Headers(extra)
  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (!isPublicPath(path)) {
    const token = getAccessToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }
  return headers
}

function handleUnauthorized() {
  clearAuthStorage()
  if (window.location.pathname !== '/login') {
    window.location.assign('/login')
  }
}

/** Only surface a short, non-sensitive client message. */
function clientErrorMessage(status: number, body: unknown): string {
  if (body && typeof body === 'object' && 'error' in body) {
    const raw = (body as { error?: unknown }).error
    if (typeof raw === 'string' && raw.length > 0 && raw.length <= 120) {
      // Strip anything that looks like a secret / stack / SQL fragment
      if (!/exception|stack|sql|token|secret|password|jdbc|postgres/i.test(raw)) {
        return raw
      }
    }
  }
  if (status === 401) return 'unauthorized'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'not found'
  if (status === 429) return 'too many requests'
  if (status >= 500) return 'server error'
  return 'request failed'
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const hasBody = options.body != null && options.body !== ''
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: buildHeaders(path, hasBody, options.headers),
  })
  if (res.status === 401) {
    handleUnauthorized()
    throw new Error('unauthorized')
  }
  if (!res.ok) {
    const errorBody = await res.json().catch(() => null)
    throw new Error(clientErrorMessage(res.status, errorBody))
  }
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T
  }
  const text = await res.text()
  if (!text) {
    return undefined as T
  }
  return JSON.parse(text) as T
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
