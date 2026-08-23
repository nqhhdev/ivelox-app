/** @deprecated Supabase auth removed — OTP login only. */
export function useLoginForm() {
  return {
    form: null,
    onSubmit: async () => {
      throw new Error('Email login removed — use OTP at /login')
    },
    onGoogle: async () => {
      throw new Error('Google login removed — use OTP at /login')
    },
    isSubmitting: false,
  }
}
