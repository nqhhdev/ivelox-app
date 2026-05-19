import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { registerSchema, type RegisterFormValues } from '../schemas/auth.schemas'
import { useAuthStore } from '@/shared/hooks/useAuth'
import { useToast } from '@/shared/hooks/useToast'

export function useRegisterForm() {
  const { signUp, signInWithGoogle } = useAuthStore()
  const navigate = useNavigate()
  const toast = useToast()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', agreeTerms: false },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await signUp(data.email, data.password)
      sessionStorage.setItem('pending_verify_email', data.email)
      navigate('/verify-email')
    } catch (e) {
      toast.error(e, 'Registration failed. Please try again.')
    }
  })

  const onGoogle = async () => {
    try {
      await signInWithGoogle()
    } catch (e) {
      toast.error(e, 'Google sign-in failed.')
    }
  }

  return { form, onSubmit, onGoogle }
}
