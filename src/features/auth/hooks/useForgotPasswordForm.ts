import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../schemas/auth.schemas'
import { supabase } from '@/shared/api/supabase'
import { useToast } from '@/shared/hooks/useToast'

export function useForgotPasswordForm() {
  const [sent, setSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')
  const toast = useToast()

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      })
      if (error) throw error
      setSentEmail(data.email)
      setSent(true)
      toast.success('Reset link sent! Check your inbox.')
    } catch (e) {
      toast.error(e, 'Failed to send reset email.')
    }
  })

  return { form, onSubmit, sent, sentEmail }
}
