import { useEffect } from 'react'
import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../api/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,

  signInWithGoogle: async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  },

  signInWithEmail: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  },

  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },
}))

export function useAuthListener() {
  const store = useAuthStore()
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      useAuthStore.setState({ session, user: session?.user ?? null, loading: false })
      // Clean up token hash from URL after Supabase exchanges it
      if (window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      useAuthStore.setState({ session, user: session?.user ?? null, loading: false })
      // Clean URL hash after token exchange
      if (event === 'SIGNED_IN' && window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return store
}
