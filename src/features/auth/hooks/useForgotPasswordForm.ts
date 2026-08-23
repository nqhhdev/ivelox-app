/** @deprecated Supabase auth removed — OTP login only. */
export function useForgotPasswordForm() {
  return {
    form: null,
    onSubmit: async () => {
      throw new Error('Password reset removed — use OTP at /login')
    },
    isSubmitting: false,
    sent: false,
  }
}
