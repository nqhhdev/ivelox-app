import { clearAuthStorage, getAccessToken } from '@/shared/api/authToken'

const API_URL = import.meta.env.VITE_API_URL as string

function authHeaders(): Record<string, string> {
  const token = getAccessToken()
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

function handleUnauthorized() {
  clearAuthStorage()
  if (window.location.pathname !== '/login') {
    window.location.assign('/login')
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options.headers,
    },
  })
  if (res.status === 401) {
    handleUnauthorized()
    throw new Error('unauthorized')
  }
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText })) as { error?: string }
    throw new Error(error.error ?? 'Request failed')
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
    request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
