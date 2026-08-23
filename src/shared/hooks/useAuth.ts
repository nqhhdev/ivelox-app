import { useEffect } from 'react'
import { create } from 'zustand'
import { apiClient } from '@/shared/api/client'
import {
  clearAuthStorage,
  getAccessToken,
  persistAccessToken,
} from '@/shared/api/authToken'

interface AuthState {
  accessToken: string | null
  role: 'owner' | null
  loading: boolean
  isAuthenticated: boolean
  hydrate: () => void
  requestOtp: () => Promise<void>
  verifyOtp: (code: string) => Promise<void>
  signOut: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  role: null,
  loading: true,
  isAuthenticated: false,

  hydrate: () => {
    const token = getAccessToken()
    set({
      accessToken: token,
      role: token ? 'owner' : null,
      isAuthenticated: Boolean(token),
      loading: false,
    })
  },

  requestOtp: async () => {
    await apiClient.post<void>('/api/v1/auth/otp/request')
  },

  verifyOtp: async (code: string) => {
    const res = await apiClient.post<{
      access_token: string
      expires_in: number
      token_type: string
    }>('/api/v1/auth/otp/verify', { code })
    persistAccessToken(res.access_token, res.expires_in)
    set({
      accessToken: res.access_token,
      role: 'owner',
      isAuthenticated: true,
      loading: false,
    })
  },

  signOut: () => {
    clearAuthStorage()
    set({
      accessToken: null,
      role: null,
      isAuthenticated: false,
      loading: false,
    })
  },
}))

export function useAuthListener() {
  const hydrate = useAuthStore((s) => s.hydrate)
  useEffect(() => {
    hydrate()
  }, [hydrate])
}
