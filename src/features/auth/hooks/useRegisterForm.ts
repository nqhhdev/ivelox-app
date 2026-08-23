/** @deprecated Supabase auth removed — OTP login only. */
export function useRegisterForm() {
  return {
    form: null,
    onSubmit: async () => {
      throw new Error('Registration removed — use OTP at /login')
    },
    onGoogle: async () => {
      throw new Error('Google login removed — use OTP at /login')
    },
    isSubmitting: false,
  }
}
